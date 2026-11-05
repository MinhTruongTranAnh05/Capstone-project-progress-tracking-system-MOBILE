import { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Field, SectionHeading, ui } from '@/core/ui/primitives';
import { staffApi } from '../data/staffApi';
import { LoadState, Pagination, Status } from './controls';
import { useStaff } from './StaffContext';

export function UnassignedStudents() {
  const f = useStaff(); const [q, setQ] = useState(''); const [page, setPage] = useState(0);
  const query = useQuery({ queryKey: [...f.key, 'unassigned', f.semester, q, page], queryFn: ({ signal }) => staffApi.students(f.semester, { hasGroup: false, q, page, size: 20 }, signal), enabled: !!f.semester });
  const students = query.data?.content ?? [];
  return <><Card><SectionHeading title="Sinh viên chưa có nhóm" subtitle="Phân loại theo điều kiện được Admin đồng bộ; trạng thái chưa xác định được giữ nguyên." /><Field label="Tìm sinh viên chưa có nhóm" value={q} onChangeText={value => { setQ(value); setPage(0); }} /></Card>
    <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
      <Text style={ui.text}>Tổng cộng {query.data?.totalElements} sinh viên chưa có nhóm. Các danh sách dưới hiển thị dữ liệu của trang hiện tại.</Text>
      {[false, true].map(ineligible => <Card key={String(ineligible)}><SectionHeading title={ineligible ? 'Danh sách sinh viên KHÔNG đủ điều kiện' : 'Danh sách sinh viên chưa có nhóm & Đủ điều kiện'} />
        {students.filter(s => (s.eligibility === 'INELIGIBLE') === ineligible).map(student => <View key={student.enrollmentId} style={ui.inset}><Text style={ui.strong}>{student.fullName} · {student.studentCode}</Text><Text style={ui.text}>{student.email}</Text><Text style={ui.text}>{student.majorName} · Kỳ {student.currentTerm}</Text><Status>{student.eligibility}</Status>{student.eligibilityReason && <Text style={ui.notice}>{student.eligibilityReason}</Text>}</View>)}
        {!students.some(s => (s.eligibility === 'INELIGIBLE') === ineligible) && <Empty text="Không có sinh viên thuộc danh sách này trên trang hiện tại." />}
      </Card>)}
      <Pagination page={page} totalPages={query.data?.totalPages ?? 0} busy={query.isFetching} onChange={setPage} />
    </LoadState>
  </>;
}
