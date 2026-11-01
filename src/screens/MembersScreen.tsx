import { useState } from 'react';
import { Platform, Share, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useFormation } from '@/contexts/FormationContext';
import { Avatar, Badge, Button, Card, ConfirmButton, Empty, ErrorState, Field, FormationPage, ProfileDetails, SectionHeading, ui, useAction } from '@/components/FormationUI';
import { GroupInvitationForm } from '@/components/GroupInvitationForm';
import { LeaderTransferRequests } from '@/components/LeaderTransferRequests';
import { ProfileEditor } from '@/components/ProfileEditor';
import { RequestCard } from '@/components/JoinRequestCard';
import { colors } from '@/constants/colors';
import { groupService } from '@/services/groupService';
import { canInvite, GROUP_LABELS, isPending } from '@/constants/formation';
import { MAX_GROUP_MEMBERS } from '@/constants/group';

export default function MembersScreen() {
  const f = useFormation();
  return <FormationPage title={f.group ? 'Thành viên nhóm (3–5 người)' : 'Hồ sơ & Đăng ký vào nhóm'}>
    {f.subject ? <MembersBody key={f.subject.scopeId} /> : <Empty text="Chưa có môn học để lập nhóm." />}
  </FormationPage>;
}
export function MembersBody() {
  const f = useFormation();
  const action = useAction();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [skill, setSkill] = useState('');
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const open = useQuery({ queryKey: [...f.key, 'open', f.subject!.subjectId, q, skill], queryFn: ({ signal }) => groupService.openGroups(f.subject!.subjectId, q, skill, signal), enabled: !f.group });
  const candidates = useQuery({ queryKey: [...f.key, 'candidates', f.subject!.subjectId, q, skill], queryFn: ({ signal }) => groupService.candidates(f.subject!.subjectId, q, skill, signal), enabled: f.isLeader });
  const mine = useQuery({ queryKey: [...f.key, 'myRequests', f.subject!.subjectId], queryFn: ({ signal }) => groupService.myRequests(f.subject!.subjectId, signal), enabled: !f.group });
  const detail = useQuery({ queryKey: [...f.key, 'publicGroup', expanded], queryFn: ({ signal }) => groupService.getGroup(expanded!, signal), enabled: !!expanded && !f.group });
  const full = !canInvite(f.group);
  const pendingCount = (mine.data ?? []).filter(r => r.type === 'APPLY' && isPending(r)).length;
  return <>
    {action.feedback}
    {f.group ? <>
      <LeaderTransferRequests />
      <Card><SectionHeading title={`Thành viên nhóm (${f.group.size}/5 người)`} subtitle="Yêu cầu quy mô nhóm hợp lệ: từ 3 đến 5 thành viên chính thức." /><Badge tone={f.group.size >= 3 && f.group.size <= 5 ? 'success' : 'warning'}>{f.group.size >= 3 && f.group.size <= 5 ? '✓ Sĩ số hợp lệ' : '⚠ Cần từ 3–5 thành viên'}</Badge></Card>
      {f.isLeader && <GroupInvitationForm />}
      <Card><View style={[ui.inset, { backgroundColor: colors.primary50, borderColor: colors.primary100 }]}><Text style={[ui.eyebrow, { color: colors.primary }]}>Mã nhóm</Text><Text selectable style={ui.heading}>{f.group.code}</Text><Button title={Platform.OS === 'web' ? 'Sao chép mã nhóm' : 'Chia sẻ mã nhóm'} secondary onPress={() => action.run(() => Platform.OS === 'web' ? navigator.clipboard.writeText(f.group!.code) : Share.share({ message: f.group!.code }))} /></View>
        <View style={ui.row}><Text style={ui.eyebrow}>Danh sách thành viên hiện tại</Text><Badge tone="neutral">{GROUP_LABELS[f.group.state]}</Badge></View>
        {f.group.members.map(member => <View key={member.userId} style={ui.inset}>
          <View style={[ui.row, { flexWrap: 'nowrap', alignItems: 'flex-start' }]}><Avatar name={member.fullName} /><View style={{ flex: 1, gap: 8 }}><ProfileDetails profile={member.profile} /><Badge tone={member.leader ? 'success' : 'neutral'}>{member.leader ? '👑 Trưởng nhóm' : '👤 Thành viên'}</Badge></View></View>
          {f.isLeader && !member.leader && <><ConfirmButton title="Bổ nhiệm Leader" message={`Đề nghị ${member.fullName} nhận vai trò Trưởng nhóm? Thành viên phải chấp nhận để hoàn tất.`} disabled={!f.canParticipate || f.subject?.phase === 'PREPARING'} busy={action.busy} onConfirm={() => action.run(() => groupService.offerTransfer(f.group!.id, member.userId, false))} /><ConfirmButton title="Xóa" tone="danger" message={`Xóa ${member.fullName} khỏi nhóm?`} disabled={!f.canAct || f.group?.finalized} busy={action.busy} onConfirm={() => action.run(() => groupService.kick(f.group!.id, member.userId))} /></>}
        </View>)}
      </Card>
    </> : <>
      <ProfileEditor />
      {mine.isSuccess && <><Card><Text style={ui.eyebrow}>📬 Lời mời tham gia nhóm từ Trưởng nhóm ({mine.data.filter(r => r.type === 'INVITE' && isPending(r)).length})</Text>{mine.data.filter(r => r.type === 'INVITE' && isPending(r)).length === 0 && <Text style={ui.text}>Hiện tại bạn không có lời mời tham gia nhóm nào từ Trưởng nhóm.</Text>}{mine.data.filter(r => r.type === 'INVITE' && isPending(r)).map(r => <RequestCard key={r.id} request={r} action={action} inset />)}</Card>
        <Card><SectionHeading title={`⚡ Đơn Apply của tôi (${pendingCount}/3 đơn đang chờ)`} subtitle="Giới hạn tối đa 3 đơn gửi song song để đảm bảo tỷ lệ phản hồi tốt nhất." />{mine.data.filter(r => r.type === 'APPLY').length === 0 && <Text style={ui.text}>Bạn chưa gửi đơn Apply nào.</Text>}{mine.data.filter(r => r.type === 'APPLY').map(r => <RequestCard key={r.id} request={r} action={action} inset />)}</Card></>}
      <Card><SectionHeading title="Tìm nhóm phù hợp" subtitle="Khám phá các nhóm đang mở tuyển trong môn học của bạn." /><Button title="Tạo nhóm mới" secondary disabled={!f.canAct} onPress={() => router.push('/(groups)/create')} />
        <Field label="Lời giới thiệu khi gửi Apply" value={message} onChangeText={setMessage} maxLength={1000} multiline />
      </Card>
    </>}
    {(!f.group || f.isLeader) && <Card><Text style={ui.heading}>{f.group ? 'Sinh viên đang tìm nhóm' : 'Các nhóm đang mở tuyển'}</Text>
      <Field label={f.group ? 'Tìm tên hoặc MSSV' : 'Tìm tên nhóm'} value={q} onChangeText={setQ} />
      <Field label="Lọc theo kỹ năng" value={skill} onChangeText={setSkill} />
    </Card>}
    {!f.canAct && <Empty text="Môn học chưa mở, đã qua hạn hoặc bạn chỉ có quyền xem. Các thao tác tuyển thành viên đang được khóa." />}
    {!f.group && <>
      {(open.isPending || mine.isPending) && <Empty text="Đang tải nhóm và đơn Apply..." />}
      {open.error && <ErrorState error={open.error} retry={() => void open.refetch()} />}
      {mine.error && <ErrorState error={mine.error} retry={() => void mine.refetch()} />}
      {open.data?.length === 0 && <Empty text="Chưa có nhóm phù hợp với bộ lọc." />}
      {open.data?.map(group => <Card key={group.id}><View style={[ui.row, { justifyContent: 'space-between' }]}><Badge tone="success">Đang tuyển thành viên</Badge><Badge tone="neutral">{group.size}/{MAX_GROUP_MEMBERS} người</Badge></View><Text style={ui.title}>{group.code}</Text><Text style={ui.heading}>{group.name}</Text>
        <View style={ui.divider} /><Text style={ui.eyebrow}>Kỹ năng & Công nghệ cần tuyển</Text><View style={ui.row}>{group.wantedSkills ? group.wantedSkills.split(',').filter(Boolean).map((value, index) => <Badge key={index}>{value.trim()}</Badge>) : <Text style={ui.text}>Chưa cập nhật</Text>}</View>
        <Button title={expanded === group.id ? 'Ẩn chi tiết' : 'Xem chi tiết nhóm'} secondary onPress={() => setExpanded(expanded === group.id ? null : group.id)} />
        {expanded === group.id && <>{detail.isPending ? <Text style={ui.text}>Đang tải chi tiết...</Text> : detail.error ? <ErrorState error={detail.error} retry={() => void detail.refetch()} /> : detail.data?.members.map(member => <ProfileDetails key={member.userId} profile={member.profile} />)}</>}
        <ConfirmButton title="🚀 NỘP ĐƠN APPLY" secondary={false} message={`Gửi đơn ứng tuyển vào nhóm ${group.code}?`} busy={action.busy} disabled={!f.canAct || !canInvite(group) || group.locked || pendingCount >= 3 || !mine.isSuccess || mine.data.some(r => r.groupId === group.id && r.type === 'APPLY' && isPending(r))}
          onConfirm={() => action.run(() => groupService.apply(group.id, message.trim()))} />
      </Card>)}
    </>}
    {f.group && f.isLeader && <>
      {candidates.isPending && <Empty text="Đang tải sinh viên..." />}
      {candidates.error && <ErrorState error={candidates.error} retry={() => void candidates.refetch()} />}
      {candidates.data?.length === 0 && <Empty text="Không tìm thấy sinh viên phù hợp." />}
      {candidates.data?.map(profile => <Card key={profile.userId}><ProfileDetails profile={profile} />
        <Button title="Mời vào nhóm" disabled={!f.canAct || full || !profile.studentCode} busy={action.busy} onPress={() => action.run(() => groupService.invite(f.group!.id, profile.studentCode!, message.trim()))} />
      </Card>)}
    </>}
  </>;
}
