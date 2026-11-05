import { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Field, SectionHeading, ui } from '@/core/ui/primitives';
import { getErrorMessage } from '@/services/apiError';
import { staffApi } from '../data/staffApi';
import { pickImportFile, type ImportFile } from '../data/fileTransfer';
import type { ImportReport, StudentRow } from '../domain/models';
import { FormDialog, LoadState, Pagination, SelectField, Status, type FormSpec, useStaffAction } from './controls';
import { useStaff } from './StaffContext';

export function EligibilityPanel() {
  const f = useStaff(); const action = useStaffAction();
  const [q, setQ] = useState(''); const [filter, setFilter] = useState(''); const [page, setPage] = useState(0);
  const [kind, setKind] = useState<'students' | 'eligibility'>('students'); const [file, setFile] = useState<ImportFile | null>(null); const [report, setReport] = useState<ImportReport | null>(null); const [pickError, setPickError] = useState<unknown>(null); const [form, setForm] = useState<FormSpec | null>(null);
  const query = useQuery({ queryKey: [...f.key, 'students', f.semester, q, filter, page], queryFn: ({ signal }) => staffApi.students(f.semester, { q, eligibility: filter ? filter as StudentRow['eligibility'] : undefined, page, size: 20 }, signal), enabled: !!f.semester });
  const pick = async () => { setPickError(null); try { const selected = await pickImportFile(); if (selected) { setFile(selected); setReport(null); } } catch (error) { setPickError(error); } };
  const runImport = (preview: boolean) => { if (file && f.semester) action.run(async () => { const result = await staffApi.importFile(f.semester, kind, file.data, preview); setReport(result); if (result.committed) setFile(null); }); };
  const edit = (student: StudentRow) => setForm({ title: `Cập nhật điều kiện · ${student.studentCode}`, initial: { eligibility: student.eligibility, reason: student.eligibilityReason ?? '' }, fields: [{ key: 'eligibility', label: 'Điều kiện', required: true, options: [{ value: 'ELIGIBLE', label: 'Đủ điều kiện' }, { value: 'INELIGIBLE', label: 'Chưa đủ điều kiện' }, { value: 'UNDECIDED', label: 'Chưa xác định' }] }, { key: 'reason', label: 'Lý do', multiline: true, maxLength: 500 }], onSubmit: values => action.execute(() => staffApi.eligibility(student.enrollmentId, { eligibility: values.eligibility as StudentRow['eligibility'], reason: values.reason ?? '' })) });
  if (!f.semester) return <Empty text="Chọn hoặc tạo học kỳ trước khi import sinh viên." />;
  return <>{action.feedback}<Card><SectionHeading title="Import Sinh viên & Điều kiện" subtitle="Import danh sách ban đầu hoặc cập nhật điều kiện sinh viên theo học kỳ." />
    <View style={ui.row}><Button title="Danh sách ban đầu" secondary={kind !== 'students'} disabled={action.busy} onPress={() => { setKind('students'); setFile(null); setReport(null); }} /><Button title="Cập nhật điều kiện" secondary={kind !== 'eligibility'} disabled={action.busy} onPress={() => { setKind('eligibility'); setFile(null); setReport(null); }} /></View>
    <Text style={ui.text}>{kind === 'students' ? 'Cột: MSSV, Họ tên, Email, Kỳ, Ngành. Có thể bổ sung Số điện thoại, Điều kiện và Lý do.' : 'Cột: MSSV, Môn (tùy chọn), Điều kiện (tùy chọn), Lý do.'}</Text>
    <Button title={file?.name ?? 'Chọn file CSV / XLSX / XLS'} secondary disabled={action.busy} onPress={() => void pick()} />{!!pickError && <Text style={ui.error}>{getErrorMessage(pickError)}</Text>}
    <Button title="Xem trước dữ liệu" secondary disabled={!file} busy={action.busy} onPress={() => runImport(true)} /><Button title={kind === 'students' ? 'Import danh sách ban đầu' : 'Import cập nhật điều kiện'} disabled={!file} busy={action.busy} onPress={() => runImport(false)} />
  </Card>
  {report && <Card><SectionHeading title={report.committed ? 'Kết quả import' : 'Xem trước dữ liệu import'} /><Text style={ui.text}>Mới: {report.newRows} · Cập nhật: {report.updatedRows} · Không đổi: {report.unchangedRows} · Lỗi: {report.errorRows}</Text>
    {!!report.newMajors?.length && <Text style={ui.text}>Chuyên ngành mới: {report.newMajors.join(', ')}</Text>}{[...(report.errors ?? []), ...(report.blockedFinalized ?? [])].map((error, index) => <Text key={index} style={ui.error}>Dòng {error.row} · {error.key}: {error.reason}</Text>)}
  </Card>}
  <Card><SectionHeading title="Danh sách sinh viên" /><Field label="Tìm tên, email hoặc MSSV" value={q} onChangeText={value => { setQ(value); setPage(0); }} /><SelectField field={{ key: 'eligibility', label: 'Điều kiện', options: [{ value: '', label: 'Tất cả' }, { value: 'ELIGIBLE', label: 'Đủ điều kiện' }, { value: 'INELIGIBLE', label: 'Chưa đủ điều kiện' }, { value: 'UNDECIDED', label: 'Chưa xác định' }] }} value={filter} onChange={value => { setFilter(value); setPage(0); }} /></Card>
  <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
    <Text style={ui.text}>Tổng cộng {query.data?.totalElements} sinh viên</Text>{query.data?.content.map(student => <Card key={student.enrollmentId}><Text style={ui.heading}>{student.fullName}</Text><Text style={ui.text}>{student.studentCode} · {student.email}</Text><Text style={ui.text}>{student.majorName} · Kỳ {student.currentTerm} · {student.hasGroup ? student.groupCode : 'Chưa có nhóm'}</Text><Status>{student.eligibility}</Status>{!!student.eligibilityReason && <Text style={ui.notice}>{student.eligibilityReason}</Text>}<Button title="Cập nhật điều kiện" secondary onPress={() => edit(student)} /></Card>)}
    {query.data?.content.length === 0 && <Empty text="Không tìm thấy sinh viên phù hợp." />}<Pagination page={page} totalPages={query.data?.totalPages ?? 0} onChange={setPage} busy={query.isFetching} />
  </LoadState>{form && <FormDialog form={form} onClose={() => setForm(null)} />}</>;
}
