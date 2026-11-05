import { useState } from 'react';
import { Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, SectionHeading, ui } from '@/core/ui/primitives';
import { PHASE_LABELS, formatDate } from '@/constants/formation';
import { staffApi } from '../data/staffApi';
import type { FinalizeCheck, Scope } from '../domain/models';
import { toInstant, toLocalDateTime } from '../domain/validation';
import { FormDialog, LoadState, type FormSpec, useStaffAction } from './controls';
import { useStaff } from './StaffContext';

export function ScopesPanel({ semesterOverride, controlsOnly = false }: { semesterOverride?: string; controlsOnly?: boolean }) {
  const f = useStaff(); const action = useStaffAction(); const semester = semesterOverride ?? f.semester;
  const [form, setForm] = useState<FormSpec | null>(null); const [check, setCheck] = useState<{ scope: Scope; result: FinalizeCheck } | null>(null);
  const query = useQuery({ queryKey: [...f.key, 'scopes', semester], queryFn: ({ signal }) => staffApi.scopes(semester, signal), enabled: !!semester });
  const deadline = (scope: Scope, extend: boolean) => setForm({ title: extend ? 'Gia hạn thời hạn hoàn thành' : 'Cấu hình thời hạn ngành', description: `${scope.subjectName} · ${scope.majorName}`, initial: { deadline: toLocalDateTime(scope.deadline) }, fields: [{ key: 'deadline', label: 'Thời hạn mới', required: true, placeholder: 'YYYY-MM-DDTHH:mm' }], onSubmit: values => action.execute(() => extend ? staffApi.extend(scope.id, toInstant(values.deadline)) : staffApi.setDeadline(scope.id, toInstant(values.deadline))) });
  if (!semester) return <Empty text="Chưa có học kỳ để cấu hình phạm vi." />;
  return <>{action.feedback}<Card><SectionHeading eyebrow="Phạm vi & Thời hạn ngành" title={controlsOnly ? 'Chốt / Mở lại danh sách theo ngành' : 'Cấu hình thời gian & thời hạn hoàn thành theo từng ngành'} /></Card>
    <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
      {!query.data?.length && <Empty text="Chưa có phạm vi ngành trong học kỳ này." />}
      {query.data?.map(scope => <Card key={scope.id}><SectionHeading title={`${scope.subjectName} · ${scope.majorName}`} subtitle={`${scope.subjectCode} · ${scope.majorCode}`} /><Text style={ui.strong}>{PHASE_LABELS[scope.phase]}</Text><Text style={ui.text}>Thời hạn hoàn thành: {formatDate(scope.deadline)}</Text><Text style={ui.text}>{scope.studentCount} sinh viên · {scope.groupCount} nhóm</Text>
        {scope.finalizedAt && <Text style={ui.text}>Đã chốt lúc: {formatDate(scope.finalizedAt)}</Text>}{scope.reopenReason && <Text style={ui.notice}>Lý do mở lại: {scope.reopenReason}</Text>}
        {scope.phase === 'FINALIZED' ? <Button title="Mở lại danh sách" secondary onPress={() => setForm({ title: 'Mở lại danh sách đã chốt', fields: [{ key: 'reason', label: 'Lý do mở lại', required: true, multiline: true, maxLength: 1000 }], onSubmit: values => action.execute(() => staffApi.reopen(scope.id, values.reason)) })} /> : <>
          {!controlsOnly && <><Button title="Cấu hình thời hạn" secondary onPress={() => deadline(scope, false)} /><Button title="Mở và gia hạn thời hạn" secondary onPress={() => deadline(scope, true)} />
          {scope.ownDeadline && <Button title="Dùng thời hạn chung của học kỳ" secondary onPress={() => setForm({ title: 'Dùng thời hạn chung', description: `Áp dụng thời hạn chung cho ${scope.majorName}?`, onSubmit: () => action.execute(() => staffApi.setDeadline(scope.id, null)) })} />}</>}
          <Button title="Kiểm tra trước khi chốt" secondary busy={action.busy} onPress={() => action.run(async () => { setCheck({ scope, result: await staffApi.finalizeCheck(scope.id) }); })} />
        </>}
      </Card>)}
    </LoadState>
    {check && <Card><SectionHeading title={`Kiểm tra chốt danh sách · ${check.scope.majorName}`} /><Text style={ui.text}>Sinh viên chưa có nhóm: {check.result.studentsWithoutGroup} · Yêu cầu rời nhóm đang mở: {check.result.openLeaveRequests}</Text>{check.result.blockers.map((text, i) => <Text key={`b${i}`} style={ui.error}>{text}</Text>)}{check.result.warnings.map((text, i) => <Text key={`w${i}`} style={ui.notice}>{text}</Text>)}
      {check.result.groupsUnderMinimum.map(group => <Text key={group.id} style={ui.text}>{group.code}: {group.size} thành viên</Text>)}
      <Button title="Chốt danh sách" disabled={!check.result.canFinalize} onPress={() => setForm({ title: 'Chốt danh sách bàn giao', description: `Xác nhận chốt danh sách ${check.scope.subjectName} · ${check.scope.majorName}?`, submitLabel: 'Xác nhận chốt', onSubmit: () => action.execute(async () => { await staffApi.finalize(check.scope.id); setCheck(null); }) })} /><Button title="Đóng kết quả kiểm tra" secondary onPress={() => setCheck(null)} />
    </Card>}{form && <FormDialog form={form} onClose={() => setForm(null)} />}</>;
}
