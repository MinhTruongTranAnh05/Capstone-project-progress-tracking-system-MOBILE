import { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Card, Empty, Field, SectionHeading, ui } from '@/core/ui/primitives';
import { formatDate } from '@/constants/formation';
import { staffApi } from '../data/staffApi';
import { exportReport } from '../data/reportExport';
import type { Semester } from '../domain/models';
import { toInstant, toLocalDateTime } from '../domain/validation';
import { FormDialog, LoadState, type FormSpec, useStaffAction } from './controls';
import { useStaff } from './StaffContext';
import { ScopesPanel } from './ScopesPanel';

export function SemestersPanel() {
  const f = useStaff(); const action = useStaffAction();
  const [q, setQ] = useState(''); const [form, setForm] = useState<FormSpec | null>(null); const [settings, setSettings] = useState<string | null>(null);
  const query = useQuery({ queryKey: [...f.key, 'semesters', 'search', q], queryFn: ({ signal }) => staffApi.semesters({ q }, signal) });
  const edit = (semester?: Semester) => setForm({ title: semester ? 'Chỉnh sửa học kỳ' : 'Tạo học kỳ mới',
    fields: [{ key: 'code', label: 'Mã học kỳ', required: true }, { key: 'name', label: 'Tên học kỳ', required: true }, { key: 'startDate', label: 'Ngày bắt đầu', required: true, placeholder: 'YYYY-MM-DD' }, { key: 'endDate', label: 'Ngày kết thúc', required: true, placeholder: 'YYYY-MM-DD' }, { key: 'formationOpensAt', label: 'Mở lập nhóm', required: true, placeholder: 'YYYY-MM-DDTHH:mm' }, { key: 'defaultDeadline', label: 'Hạn lập nhóm', required: true, placeholder: 'YYYY-MM-DDTHH:mm' }],
    initial: { code: semester?.code ?? '', name: semester?.name ?? '', startDate: semester?.startDate ?? '', endDate: semester?.endDate ?? '', formationOpensAt: toLocalDateTime(semester?.formationOpensAt), defaultDeadline: toLocalDateTime(semester?.defaultDeadline) },
    onSubmit: values => action.execute(() => {
      const input = { code: values.code, name: values.name, startDate: values.startDate, endDate: values.endDate, formationOpensAt: toInstant(values.formationOpensAt), defaultDeadline: toInstant(values.defaultDeadline) };
      return semester ? staffApi.updateSemester(semester.code, input) : staffApi.createSemester(input);
    }) });
  const assign = (semester: Semester) => setForm({ title: `Phân công Điều phối viên · ${semester.name}`, fields: [{ key: 'moderator', label: 'Điều phối viên', required: true, listKey: 'moderators', loadOptions: async (q, page, signal) => {
    const data = await staffApi.users({ role: 'LECTURER', q, page, size: 20 }, signal);
    return { content: data.content.map(u => ({ value: u.id, label: `${u.fullName} · ${u.email}` })), totalPages: data.totalPages };
  } }], onSubmit: values => action.execute(() => staffApi.assignModerator(semester.code, values.moderator)) });
  return <>{action.feedback}<Card><SectionHeading title="Quản lý học kỳ" subtitle="Thời gian lập nhóm và phân công giảng viên điều phối." /><Field label="Tìm theo mã hoặc tên học kỳ" value={q} onChangeText={setQ} /><Button title="+ Tạo học kỳ" onPress={() => edit()} /></Card>
    <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
      {!query.data?.length && <Empty text="Chưa có học kỳ phù hợp." />}
      {query.data?.map(semester => <Card key={semester.code}><View style={ui.row}><Badge>{semester.code}</Badge><Text style={ui.heading}>{semester.name}</Text></View>
        <Text style={ui.text}>{semester.startDate} → {semester.endDate}</Text><Text style={ui.text}>Mở lập nhóm: {formatDate(semester.formationOpensAt)}</Text><Text style={ui.text}>Hạn lập nhóm: {formatDate(semester.defaultDeadline)}</Text>
        <Text style={ui.text}>Điều phối viên: {semester.moderator?.fullName ?? 'Chưa phân công'}</Text><Text style={ui.text}>{semester.studentCount} sinh viên · {semester.groupCount} nhóm · {semester.subjectCount} môn học</Text>
        <Button title="Chỉnh sửa học kỳ" secondary onPress={() => edit(semester)} /><Button title="Phân công Điều phối viên" secondary onPress={() => assign(semester)} />
        {!!semester.moderator && <Button title="Gỡ phân công" secondary onPress={() => setForm({ title: 'Gỡ phân công Điều phối viên', description: `Gỡ phân công cho học kỳ ${semester.name}?`, onSubmit: () => action.execute(() => staffApi.assignModerator(semester.code, '')) })} />}
        <Button title="Cấu hình môn học & thời hạn" secondary onPress={() => { f.selectSemester(semester.code); setSettings(settings === semester.code ? null : semester.code); }} />
        <Button title="Xuất Excel" secondary busy={action.busy} onPress={() => action.run(() => exportReport(semester.code))} />
        <Button title="Xóa học kỳ" tone="danger" secondary onPress={() => setForm({ title: 'Xóa học kỳ', description: `Xóa học kỳ ${semester.name}?`, danger: true, submitLabel: 'Xác nhận xóa', onSubmit: () => action.execute(() => staffApi.deleteSemester(semester.code)) })} />
      </Card>)}
    </LoadState>
    {settings && <SemesterSettings key={settings} semester={settings} />}
    {form && <FormDialog form={form} onClose={() => setForm(null)} />}
  </>;
}
function SemesterSettings({ semester }: { semester: string }) {
  const f = useStaff(); const action = useStaffAction(); const [form, setForm] = useState<FormSpec | null>(null);
  const query = useQuery({ queryKey: [...f.key, 'subjects', semester], queryFn: ({ signal }) => staffApi.subjects(semester, signal) });
  return <><Card><SectionHeading title={`Cấu hình môn học · ${semester}`} /></Card>{action.feedback}
    <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>{query.data?.map(subject => <Card key={subject.id}><Text style={ui.heading}>{subject.name} · {subject.code}</Text><Text style={ui.text}>Kỳ học: {subject.targetTerm} · Thời hạn phản hồi: {subject.requestTtlMinutes} phút</Text>
      <Button title="Chỉnh sửa cấu hình môn học" secondary onPress={() => setForm({ title: 'Cấu hình môn học', initial: { code: subject.code, name: subject.name, term: String(subject.targetTerm), ttl: String(subject.requestTtlMinutes) }, fields: [{ key: 'code', label: 'Mã môn học', required: true }, { key: 'name', label: 'Tên môn học', required: true }, { key: 'term', label: 'Kỳ học', required: true }, { key: 'ttl', label: 'Thời hạn phản hồi Apply/Invite (phút)', required: true }], onSubmit: values => action.execute(() => staffApi.updateSubject(subject.id, { code: values.code, name: values.name, targetTerm: Number(values.term), requestTtlMinutes: Number(values.ttl) })) })} />
    </Card>)}</LoadState><ScopesPanel semesterOverride={semester} />{form && <FormDialog form={form} onClose={() => setForm(null)} />}</>;
}
