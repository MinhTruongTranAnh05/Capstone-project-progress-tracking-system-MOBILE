import { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Badge, Button, Card, Empty, Field, SectionHeading, ui } from '@/core/ui/primitives';
import { ProfileDetails } from '@/features/profile/presentation/ProfileDetails';
import { GROUP_LABELS } from '@/constants/formation';
import { getErrorMessage } from '@/services/apiError';
import { staffApi } from '../data/staffApi';
import { collectGroups } from '../data/groupLists';
import { exportReport } from '../data/reportExport';
import type { StudentGroup } from '../domain/models';
import { DetailDialog, FormDialog, LoadState, Pagination, SelectField, Stat, type FormField, type FormSpec, useStaffAction } from './controls';
import { useStaff } from './StaffContext';
import { UnassignedStudents } from './UnassignedStudents';
import { ScopesPanel } from './ScopesPanel';

type GroupAction = 'add' | 'merge' | 'leader' | 'move' | 'remove';
export function GroupsPanel({ controls = false }: { controls?: boolean }) {
  const f = useStaff(); const action = useStaffAction();
  const [q, setQ] = useState(''); const [under3, setUnder3] = useState(false); const [page, setPage] = useState(0); const [scopeId, setScopeId] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null); const [form, setForm] = useState<FormSpec | null>(null); const [preparing, setPreparing] = useState(false); const [prepareError, setPrepareError] = useState<unknown>(null);
  const query = useQuery({ queryKey: [...f.key, 'groups', f.semester, q, under3, page], queryFn: ({ signal }) => staffApi.groups(f.semester, { q, maxSize: under3 ? 2 : undefined, page, size: 20 }, signal), enabled: !!f.semester });
  const scopes = useQuery({ queryKey: [...f.key, 'scopes', f.semester], queryFn: ({ signal }) => staffApi.scopes(f.semester, signal), enabled: !!f.semester });
  const stats = useQuery({ queryKey: [...f.key, 'statistics', f.semester], queryFn: ({ signal }) => staffApi.statistics(f.semester, undefined, signal), enabled: !!f.semester && !f.admin });
  const newScope = scopes.data?.find(scope => scope.id === scopeId);
  const studentField = (majorId?: string, multiple = false): FormField => ({ key: multiple ? 'members' : 'student', label: multiple ? 'Thành viên bổ sung (tối đa 4)' : 'Sinh viên chưa có nhóm', required: !multiple, multiple, listKey: `unassigned:${f.semester}:${majorId ?? ''}`,
    loadOptions: async (q, page, signal) => { const data = await staffApi.students(f.semester, { q, page, size: 20, majorId, hasGroup: false }, signal); return { content: data.content.filter(s => s.eligibility !== 'INELIGIBLE').map(s => ({ value: s.userId, label: `${s.fullName} · ${s.studentCode} · ${s.majorName}` })), totalPages: data.totalPages }; } });
  const groupField = (group: StudentGroup, merging: boolean): FormField => ({ key: 'group', label: merging ? 'Nhóm nguồn cần gộp' : 'Nhóm chuyển đến', required: true, listKey: `target:${group.id}:${merging}`,
    loadOptions: async (q, page, signal) => { const data = await staffApi.groups(f.semester, { q, page, size: 20, majorId: scopes.data?.find(s => s.id === group.scopeId)?.majorId, finalized: false }, signal); return { content: data.content.filter(g => g.id !== group.id && g.scopeId === group.scopeId && g.state !== 'DISSOLVED' && (merging ? g.size + group.size <= 5 : g.size < 5)).map(g => ({ value: g.id, label: `${g.code} · ${g.name} · ${g.size}/5 thành viên` })), totalPages: data.totalPages }; } });
  const operate = (group: StudentGroup, kind: GroupAction, memberId?: string) => {
    const member = group.members?.find(m => m.userId === memberId);
    const scope = scopes.data?.find(s => s.id === group.scopeId);
    if (kind === 'add') setForm({ title: `Thêm sinh viên · ${group.code}`, fields: [studentField(scope?.majorId)], onSubmit: values => action.execute(() => staffApi.add(group.id, values.student)) });
    if (kind === 'merge') setForm({ title: `Gộp nhóm vào ${group.code}`, description: 'Tổng sĩ số sau khi gộp không vượt quá 5 thành viên.', fields: [groupField(group, true)], onSubmit: values => action.execute(() => staffApi.merge(group.id, values.group)) });
    if (kind === 'leader') setForm({ title: 'Đổi Trưởng nhóm', description: `Chọn thành viên hiện tại của nhóm ${group.code}.`, fields: [{ key: 'student', label: 'Trưởng nhóm mới', required: true, options: (group.members ?? []).filter(m => !m.leader).map(m => ({ value: m.userId, label: `${m.fullName} · ${m.studentCode ?? ''}` })) }], onSubmit: values => action.execute(() => staffApi.appointLeader(group.id, values.student)) });
    if (kind === 'move' && member) setForm({ title: `Chuyển nhóm · ${member.fullName}`, fields: [groupField(group, false)], onSubmit: values => action.execute(() => staffApi.move(values.group, member.userId)) });
    if (kind === 'remove' && member) setForm({ title: `Đưa ${member.fullName} ra khỏi nhóm`, danger: true, fields: [{ key: 'reason', label: 'Lý do', required: true, multiline: true, maxLength: 1000 }], onSubmit: values => action.execute(() => staffApi.remove(group.id, member.userId, values.reason)) });
  };
  const create = () => {
    if (!newScope) return;
    const leaderField = { ...studentField(newScope.majorId), key: 'leader', label: 'Chỉ định Trưởng nhóm' };
    setForm({ title: 'Tạo nhóm mới từ sinh viên lẻ', description: `${newScope.subjectName} · ${newScope.majorName}`, fields: [{ key: 'name', label: 'Tên nhóm', required: true, maxLength: 100 }, leaderField, studentField(newScope.majorId, true)],
      onSubmit: values => action.execute(() => staffApi.createGroup(newScope.id, { name: values.name, leaderUserId: values.leader, memberUserIds: (values.members ?? '').split(',').filter(Boolean) })) });
  };
  const dissolveSmall = async () => {
    setPreparing(true); setPrepareError(null);
    try {
      const groups = (await collectGroups(f.semester, { maxSize: 2 })).filter(g => g.state !== 'DISSOLVED' && !g.finalized);
      if (!groups.length) throw new Error('Không có nhóm dưới 3 thành viên để giải tán.');
      setForm({ title: 'Giải tán nhóm dưới chuẩn', description: `Xác nhận giải tán ${groups.length} nhóm dưới 3 thành viên trong học kỳ ${f.semester}?`, danger: true, submitLabel: 'Xác nhận giải tán', fields: [{ key: 'reason', label: 'Lý do', required: true, multiline: true, maxLength: 1000 }], onSubmit: values => action.execute(() => staffApi.dissolve(groups.map(g => g.id), values.reason)) });
    } catch (error) { setPrepareError(error); } finally { setPreparing(false); }
  };
  if (!f.semester) return <Empty text="Chưa có học kỳ để xem nhóm." />;
  return <>{action.feedback}{!!prepareError && <Text style={ui.error}>{getErrorMessage(prepareError)}</Text>}
    {!f.admin && <LoadState pending={stats.isPending} error={stats.error} retry={() => void stats.refetch()}>{stats.data && <View style={ui.row}><Stat label="Tổng số nhóm" value={stats.data.total.totalGroups} /><Stat label="Nhóm dưới 3 người" value={stats.data.total.groupsUnderMinimum} /><Stat label="Sinh viên chưa có nhóm" value={stats.data.total.withoutGroup} /><Stat label="Khiếu nại đang mở" value={stats.data.total.openComplaints} /></View>}</LoadState>}
    <Card><SectionHeading title={controls ? 'Điều phối chi tiết nhóm' : 'Danh sách nhóm'} /><Field label="Tìm mã hoặc tên nhóm" value={q} onChangeText={value => { setQ(value); setPage(0); }} /><Button title={under3 ? 'Xem tất cả nhóm' : 'Chỉ xem nhóm dưới 3 người'} secondary onPress={() => { setUnder3(!under3); setPage(0); }} /><Button title="Xuất Excel bàn giao" secondary busy={action.busy} onPress={() => action.run(() => exportReport(f.semester))} />
      {!f.admin && <Button title="Giải tán các nhóm dưới 3 thành viên" tone="danger" secondary busy={preparing} disabled={action.busy} onPress={() => void dissolveSmall()} />}
    </Card>
    {controls && <Card><SectionHeading title="Tạo nhóm mới từ sinh viên chưa có nhóm" /><LoadState pending={scopes.isPending} error={scopes.error} retry={() => void scopes.refetch()}><SelectField field={{ key: 'scope', label: 'Môn học & Chuyên ngành', options: scopes.data?.filter(s => s.phase !== 'FINALIZED').map(s => ({ value: s.id, label: `${s.subjectName} · ${s.majorName}` })) ?? [] }} value={scopeId} onChange={setScopeId} /><Button title="+ Tạo nhóm mới" disabled={!newScope || action.busy} onPress={create} /></LoadState></Card>}
    {controls && <><ScopesPanel controlsOnly /><UnassignedStudents /></>}
    <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
      <Text style={ui.text}>Tổng cộng {query.data?.totalElements} nhóm</Text>{!query.data?.content.length && <Empty text="Không có nhóm phù hợp." />}
      {query.data?.content.map(group => <Card key={group.id}><SectionHeading title={group.code} subtitle={group.name} /><View style={ui.row}><Badge>{group.size}/5 thành viên</Badge><Badge tone="neutral">{GROUP_LABELS[group.state]}</Badge>{group.finalized && <Badge tone="success">Đã chốt danh sách</Badge>}</View><Text style={ui.text}>{group.subjectCode} · {group.majorName}</Text><Text style={ui.text}>Trưởng nhóm: {group.leaderName ?? 'Chưa có'}</Text><Button title="Xem chi tiết nhóm" secondary onPress={() => setDetailId(group.id)} /></Card>)}
      <Pagination page={page} totalPages={query.data?.totalPages ?? 0} onChange={setPage} busy={query.isFetching} />
    </LoadState>
    {detailId && <GroupDetails groupId={detailId} controls={controls} busy={action.busy} onAction={operate} onClose={() => setDetailId(null)} />}
    {form && <FormDialog form={form} onClose={() => setForm(null)} />}
  </>;
}
function GroupDetails({ groupId, controls, busy, onAction, onClose }: { groupId: string; controls: boolean; busy: boolean; onAction: (group: StudentGroup, action: GroupAction, memberId?: string) => void; onClose: () => void }) {
  const f = useStaff();
  const query = useQuery({ queryKey: [...f.key, 'group', groupId], queryFn: ({ signal }) => staffApi.group(groupId, signal) });
  const group = query.data;
  return <DetailDialog title="Chi tiết nhóm" onClose={onClose}><LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
    {group && <><SectionHeading title={group.code} subtitle={group.name} /><Text style={ui.text}>{group.majorName} · {group.size}/5 thành viên</Text><Text style={ui.text}>Kỹ năng cần tuyển: {group.wantedSkills || 'Chưa cập nhật'}</Text>
      <Button title="Đổi Trưởng nhóm" secondary disabled={busy || group.state === 'DISSOLVED' || !(group.members ?? []).some(m => !m.leader)} onPress={() => onAction(group, 'leader')} />
      {controls && <><Button title="Thêm sinh viên chưa có nhóm" secondary disabled={busy || group.finalized || group.size >= 5 || group.state === 'DISSOLVED'} onPress={() => onAction(group, 'add')} /><Button title="Gộp nhóm" secondary disabled={busy || group.finalized || group.state === 'DISSOLVED' || group.size >= 5} onPress={() => onAction(group, 'merge')} /></>}
      {(group.members ?? []).map(member => <View key={member.userId} style={ui.inset}><View style={ui.row}><Avatar name={member.fullName} /><Text style={ui.strong}>{member.fullName}</Text></View><Text style={ui.text}>{member.studentCode}</Text><Badge>{member.leader ? 'Trưởng nhóm' : 'Thành viên'}</Badge>{member.profile && <ProfileDetails profile={member.profile} />}
        {controls && <><Button title="Chuyển sang nhóm khác" secondary disabled={busy || group.finalized} onPress={() => onAction(group, 'move', member.userId)} /><Button title="Đưa ra khỏi nhóm" secondary tone="danger" disabled={busy || group.finalized} onPress={() => onAction(group, 'remove', member.userId)} /></>}
      </View>)}
    </>}
  </LoadState></DetailDialog>;
}
