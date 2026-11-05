import { useState } from 'react';
import { Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Card, Empty, SectionHeading, ui } from '@/core/ui/primitives';
import { STATUS_LABELS, formatDate } from '@/constants/formation';
import { staffApi } from '../data/staffApi';
import type { LeaveRequest } from '../domain/models';
import { FormDialog, LoadState, SelectField, type FormSpec, useStaffAction } from './controls';
import { useStaff } from './StaffContext';

export function LeaveRequestsPanel({ selectedId }: { selectedId?: string }) {
  const f = useStaff(); const action = useStaffAction(); const [selected, setSelected] = useState(''); const [scope, setScope] = useState(''); const [form, setForm] = useState<FormSpec | null>(null);
  const subjects = useQuery({ queryKey: [...f.key, 'subjects', f.semester], queryFn: ({ signal }) => staffApi.subjects(f.semester, signal), enabled: !!f.semester });
  const subjectId = subjects.data?.some(s => s.id === selected) ? selected : '';
  const subjectIds = subjectId ? [subjectId] : (subjects.data ?? []).map(s => s.id);
  const query = useQuery({ queryKey: [...f.key, 'complaints', subjectIds, scope], queryFn: async ({ signal }) => (await Promise.all(subjectIds.map(id => staffApi.complaints(id, scope || undefined, signal)))).flat(), enabled: subjects.isSuccess });
  const decide = (request: LeaveRequest, approve: boolean) => setForm({ title: approve ? 'Duyệt yêu cầu rời nhóm' : 'Từ chối yêu cầu rời nhóm', description: `${request.fullName} · ${request.groupCode}`, fields: [{ key: 'note', label: approve ? 'Ghi chú xử lý' : 'Lý do từ chối', required: !approve, multiline: true, maxLength: 1000 }], submitLabel: approve ? 'Xác nhận duyệt' : 'Xác nhận từ chối', danger: !approve,
    onSubmit: values => action.execute(() => staffApi.decideLeave(request.id, approve, values.note ?? '')) });
  if (!f.semester) return <Empty text="Chưa có học kỳ để xem yêu cầu." />;
  return <>{action.feedback}<Card><SectionHeading eyebrow="Quản lý điều phối" title={f.admin ? 'Yêu cầu rời nhóm' : 'Khiếu nại rời nhóm'} subtitle="Các yêu cầu đang chờ Điều phối viên xử lý theo môn học." />
    <LoadState pending={subjects.isPending} error={subjects.error} retry={() => void subjects.refetch()}><SelectField field={{ key: 'subject', label: 'Môn học', options: [{ value: '', label: 'Tất cả môn học' }, ...(subjects.data ?? []).map(s => ({ value: s.id, label: s.name }))] }} value={subjectId} onChange={value => { setSelected(value); setScope(''); }} />
      <SelectField field={{ key: 'scope', label: 'Phạm vi ngành', options: [{ value: '', label: 'Tất cả ngành' }, ...(subjects.data?.find(s => s.id === subjectId)?.scopes ?? []).map(s => ({ value: s.id, label: s.majorName }))] }} value={scope} onChange={setScope} />
    </LoadState>
  </Card>
  {subjects.isSuccess && <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
    {selectedId && query.isSuccess && !query.data.some(request => request.id === selectedId) && <Text style={ui.notice}>Yêu cầu từ thông báo không nằm trong danh sách đang chờ xử lý của học kỳ và bộ lọc hiện tại. Yêu cầu có thể đã được xử lý.</Text>}
    {!query.data?.length && <Empty text="Không có yêu cầu đang chờ xử lý." />}{query.data?.map(request => <Card key={request.id} style={request.id === selectedId ? { borderWidth: 2, borderColor: '#E65100' } : undefined}><Text style={ui.heading}>{request.fullName} · {request.studentCode}</Text><Text style={ui.text}>{request.groupCode} · {request.groupName}</Text><Badge>{STATUS_LABELS[request.status] ?? request.status}</Badge><Text style={ui.text}>{request.complaint ? 'Khiếu nại' : 'Yêu cầu rời nhóm'} · {formatDate(request.createdAt)}</Text><Text style={ui.text}>Lý do: {request.reason || 'Không có'}</Text>{request.leaderNote && <Text style={ui.notice}>Phản hồi của Trưởng nhóm: {request.leaderNote}</Text>}{request.decisionNote && <Text style={ui.notice}>Kết quả xử lý: {request.decisionNote}</Text>}
      {request.status === 'PENDING_MODERATOR' && <><Button title="Duyệt" busy={action.busy} onPress={() => decide(request, true)} /><Button title="Từ chối" tone="danger" secondary disabled={action.busy} onPress={() => decide(request, false)} /></>}
    </Card>)}
  </LoadState>}{form && <FormDialog form={form} onClose={() => setForm(null)} />}</>;
}
