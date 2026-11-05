import { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Field, SectionHeading, ui } from '@/core/ui/primitives';
import { staffApi } from '../data/staffApi';
import type { StudentRow, User } from '../domain/models';
import { FormDialog, LoadState, Pagination, SelectField, SemesterPicker, Status, type FormSpec, useStaffAction } from './controls';
import { useStaff } from './StaffContext';

export function AccountsPanel() {
  const f = useStaff(); const action = useStaffAction();
  const [mode, setMode] = useState<'users' | 'students'>('users'); const [q, setQ] = useState(''); const [role, setRole] = useState(''); const [page, setPage] = useState(0); const [form, setForm] = useState<FormSpec | null>(null);
  const users = useQuery({ queryKey: [...f.key, 'users', q, role, page], queryFn: ({ signal }) => staffApi.users({ q, role: role ? role as User['role'] : undefined, page, size: 20 }, signal), enabled: mode === 'users' });
  const students = useQuery({ queryKey: [...f.key, 'accounts-roster', f.semester, q, page], queryFn: ({ signal }) => staffApi.students(f.semester, { q, page, size: 20 }, signal), enabled: mode === 'students' && !!f.semester });
  const changeMode = (value: 'users' | 'students') => { setMode(value); setQ(''); setPage(0); };
  const editUser = (user: User) => setForm({ title: 'Chỉnh sửa tài khoản', fields: [{ key: 'fullName', label: 'Họ và tên', required: true }, { key: 'email', label: 'Email', required: true }, { key: 'phone', label: 'Số điện thoại', maxLength: 20 }, { key: 'status', label: 'Trạng thái', required: true, options: [{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'SUSPENDED', label: 'Tạm khóa' }, { value: 'INACTIVE', label: 'Vô hiệu hóa' }] }],
    initial: { fullName: user.fullName, email: user.email, phone: user.phone ?? '', status: user.status }, onSubmit: values => action.execute(() => staffApi.updateUser(user.id, { fullName: values.fullName, email: values.email, phone: values.phone ?? '', status: values.status as User['status'] })) });
  const editStudent = (student: StudentRow) => setForm({ title: 'Chỉnh sửa thông tin sinh viên', fields: [{ key: 'fullName', label: 'Họ và tên', required: true, maxLength: 255 }, { key: 'email', label: 'Email', required: true }, { key: 'phone', label: 'Số điện thoại', maxLength: 20 }], initial: { fullName: student.fullName, email: student.email, phone: student.phone ?? '' }, onSubmit: values => action.execute(() => staffApi.updateStudent(student.semesterStudentId, { fullName: values.fullName, email: values.email, phone: values.phone ?? '' })) });
  return <>{action.feedback}<Card><SectionHeading title="Quản lý tài khoản" /><View style={ui.row}><Button title="Tài khoản hệ thống" secondary={mode !== 'users'} onPress={() => changeMode('users')} /><Button title="Sinh viên theo học kỳ" secondary={mode !== 'students'} onPress={() => changeMode('students')} /></View>
    <Field label="Tìm tên, email hoặc MSSV" value={q} onChangeText={value => { setQ(value); setPage(0); }} />
    {mode === 'users' && <><SelectField field={{ key: 'role', label: 'Vai trò', options: [{ value: '', label: 'Tất cả' }, { value: 'STUDENT', label: 'Sinh viên' }, { value: 'LECTURER', label: 'Giảng viên điều phối' }, { value: 'ADMIN', label: 'Quản trị viên' }] }} value={role} onChange={value => { setRole(value); setPage(0); }} />
      <Button title="+ Tạo tài khoản Giảng viên" onPress={() => setForm({ title: 'Tạo tài khoản Giảng viên điều phối', fields: [{ key: 'fullName', label: 'Họ và tên', required: true }, { key: 'email', label: 'Email', required: true }, { key: 'password', label: 'Mật khẩu', required: true, password: true, maxLength: 72 }, { key: 'phone', label: 'Số điện thoại', maxLength: 20 }], onSubmit: values => action.execute(() => staffApi.createModerator({ fullName: values.fullName, email: values.email, password: values.password, phone: values.phone ?? '' })) })} />
      <Text style={ui.text}>Tài khoản sinh viên được tạo từ danh sách import và đăng nhập bằng Google.</Text>
    </>}
  </Card>
  {mode === 'students' && <SemesterPicker />}
  {mode === 'users' ? <LoadState pending={users.isPending} error={users.error} retry={() => void users.refetch()}>
    <Text style={ui.text}>Tổng cộng {users.data?.totalElements} tài khoản</Text>{users.data?.content.map(user => <Card key={user.id}><Text style={ui.heading}>{user.fullName}</Text><Text style={ui.text}>{user.email}</Text><Text style={ui.text}>{user.studentCode} · {user.role === 'LECTURER' ? 'Giảng viên điều phối' : user.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên'}</Text><Status>{user.status}</Status><Button title="Chỉnh sửa" secondary onPress={() => editUser(user)} />
      {user.role === 'LECTURER' && <Button title="Đặt lại mật khẩu" secondary onPress={() => setForm({ title: `Đặt lại mật khẩu · ${user.fullName}`, fields: [{ key: 'password', label: 'Mật khẩu mới', password: true, required: true, maxLength: 72 }], onSubmit: values => action.execute(() => staffApi.resetPassword(user.id, values.password)) })} />}
    </Card>)}{users.data?.content.length === 0 && <Empty text="Không tìm thấy tài khoản." />}<Pagination page={page} totalPages={users.data?.totalPages ?? 0} onChange={setPage} busy={users.isFetching} />
  </LoadState> : !!f.semester && <LoadState pending={students.isPending} error={students.error} retry={() => void students.refetch()}>
    {students.data?.content.map(student => <Card key={student.enrollmentId}><Text style={ui.heading}>{student.fullName}</Text><Text style={ui.text}>{student.studentCode} · {student.email}</Text><Text style={ui.text}>{student.majorName} · Kỳ {student.currentTerm}</Text><Status>{student.eligibility}</Status><Button title="Chỉnh sửa thông tin" secondary onPress={() => editStudent(student)} /></Card>)}
    {students.data?.content.length === 0 && <Empty text="Không tìm thấy sinh viên." />}<Pagination page={page} totalPages={students.data?.totalPages ?? 0} onChange={setPage} busy={students.isFetching} />
  </LoadState>}{form && <FormDialog form={form} onClose={() => setForm(null)} />}</>;
}
