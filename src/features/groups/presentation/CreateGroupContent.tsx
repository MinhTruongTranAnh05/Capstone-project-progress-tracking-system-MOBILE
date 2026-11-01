import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useFormation } from '@/contexts/FormationContext';
import { Badge, Button, Card, Columns, Field, InfoTile, SectionHeading, ui } from '@/components/FormationUI';
import { groupService } from '@/services/groupService';
import { getErrorMessage } from '@/services/apiError';
import { colors } from '@/constants/colors';
import { formatDate } from '@/constants/formation';

export function CreateGroupContent() {
  const f = useFormation();
  return <CreateGroupForm key={f.subject?.scopeId ?? 'no-scope'} />;
}
function CreateGroupForm() {
  const f = useFormation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [committed, setCommitted] = useState(true);
  const skills = tags.join(', ');
  const addSkill = (skill: string) => { const value = skill.trim(); if (value && !tags.includes(value) && [...tags, value].join(', ').length <= 500) { setTags(old => [...old, value]); setCustom(''); } };
  const mutation = useMutation({ mutationFn: () => groupService.createGroup(f.subject!.subjectId, { name: name.trim(), wantedSkills: skills }),
    onSuccess: async () => { await f.refresh(); router.replace('/(tabs)'); }, onError: () => { void f.refresh(); } });
  return <Columns main={<Card>
      <SectionHeading eyebrow="Khởi tạo Capstone Project" title="Đăng ký thành lập nhóm mới" subtitle="Điền đầy đủ thông tin bên dưới để khởi tạo nhóm và nhận quyền Trưởng nhóm chính thức." />
      <View style={ui.divider} />
      <View style={[ui.inset, { backgroundColor: colors.warning50, borderColor: colors.warningBorder }]}><Text style={ui.strong}>⚠ Lưu ý quan trọng:</Text><Text style={ui.text}>Sinh viên tạo nhóm sẽ tự động trở thành Trưởng nhóm và chịu trách nhiệm xét duyệt thành viên tham gia.</Text></View>
      <InfoTile label="Mã nhóm" value="Hệ thống tự cấp sau khi thành lập nhóm" />
      <Field label="TÊN NHÓM DỰ ÁN *" value={name} onChangeText={setName} maxLength={100} editable={!mutation.isPending} placeholder="VD: Nhóm 01 - SmartCampus AI" />
      <Text style={[ui.text, { fontSize: 10 }]}>Tên nhóm nhận diện công khai trên sàn ghép đôi</Text>
      <InfoTile label="HỌC KỲ ÁP DỤNG" value={f.semester?.semesterName} />
      <InfoTile label="MÔN HỌC & NGÀNH HỌC" value={f.subject ? `${f.subject.name} · ${f.semester?.majorName}` : undefined} />
      <Text style={ui.label}>KỸ NĂNG & CÔNG NGHỆ CẦN TUYỂN</Text>
      <View style={ui.inset}><View style={ui.row}>{tags.map(tag => <TouchableOpacity accessibilityLabel={`Bỏ kỹ năng ${tag}`} accessibilityRole="button" key={tag} disabled={mutation.isPending} onPress={() => setTags(old => old.filter(value => value !== tag))} style={{ minHeight: 44, justifyContent: 'center' }}><Badge>{tag}  ×</Badge></TouchableOpacity>)}</View>
        <Field label="Thêm kỹ năng" value={custom} onChangeText={setCustom} placeholder="Nhập kỹ năng khác..." maxLength={100} editable={!mutation.isPending} onSubmitEditing={() => addSkill(custom)} />
        <Button title="+ Thêm kỹ năng" secondary disabled={!custom.trim() || mutation.isPending || [...tags, custom.trim()].join(', ').length > 500} onPress={() => addSkill(custom)} />
        <Text style={[ui.text, { fontSize: 10 }]}>Gợi ý nhanh:</Text><View style={ui.row}>{['ReactJS', 'NodeJS / Express', 'Spring Boot', 'UI/UX (Figma)', 'Java', 'Python'].filter(tag => !tags.includes(tag)).map(tag => <TouchableOpacity key={tag} accessibilityRole="button" disabled={mutation.isPending} onPress={() => addSkill(tag)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={ui.tag}>+ {tag}</Text></TouchableOpacity>)}</View>
      </View>
      <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: committed }} onPress={() => setCommitted(!committed)} style={[ui.row, { flexWrap: 'nowrap', alignItems: 'flex-start', minHeight: 44 }]}><Text style={{ color: colors.primary, fontSize: 22 }}>{committed ? '☑' : '☐'}</Text><Text style={[ui.text, { flex: 1, fontSize: 11 }]}>Tôi cam kết thông tin khai báo là chính xác, đồng ý chịu trách nhiệm điều hành nhóm theo quy chế của Nhà trường và Khoa CNTT FPT.</Text></TouchableOpacity>
      {mutation.isError && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(mutation.error)}</Text>}
      {(!f.canAct || !!f.group) && <Text style={ui.notice}>{f.group ? 'Bạn đã có nhóm trong môn học này.' : 'Hiện bạn chưa được tạo nhóm trong môn học đã chọn.'}</Text>}
      <Button title="XÁC NHẬN THÀNH LẬP NHÓM TRONG MÔN HỌC" disabled={!committed || !name.trim() || !f.canAct || !!f.group || !f.subject} busy={mutation.isPending} onPress={() => mutation.mutate()} />
      <Text style={[ui.text, { fontSize: 10, textAlign: 'center' }]}>(Bạn sẽ chính thức trở thành Trưởng nhóm)</Text>
    </Card>} aside={<>
      <Card><Text style={[ui.eyebrow, { color: colors.primary }]}>💡 Quy chế lập nhóm Capstone</Text><Text style={[ui.text, { fontSize: 10 }]}>FPT University Rules</Text><Text style={ui.text}>• Quy mô nhóm hợp lệ: tối thiểu 3 đến tối đa 5 thành viên chính thức.</Text><Text style={ui.text}>• Mỗi sinh viên chỉ thuộc một nhóm chính thức trong cùng môn học.</Text><Text style={ui.text}>• Hạn chót khóa danh sách: {formatDate(f.subject?.deadline ?? null)}.</Text></Card>
      <Card><Text style={[ui.eyebrow, { color: colors.primary }]}>👑 Đặc quyền trưởng nhóm</Text><Text style={ui.text}>✓ Duyệt hoặc từ chối sinh viên ứng tuyển.</Text><Text style={ui.text}>✓ Gửi lời mời trực tiếp thành viên theo MSSV.</Text><Text style={ui.text}>✓ Quản lý trạng thái và bàn giao vai trò trong nhóm.</Text></Card>
      <Card style={{ backgroundColor: '#1E1B18', borderColor: '#1E1B18' }}><Text style={[ui.eyebrow, { color: '#FB923C' }]}>Chưa muốn làm Leader?</Text><Text style={[ui.heading, { color: 'white' }]}>Tìm kiếm nhóm đang tuyển thành viên</Text><Text style={[ui.text, { color: '#D1D5DB' }]}>Khám phá các nhóm đang mở tuyển theo môn học và kỹ năng của bạn.</Text><Button title="Xem danh sách nhóm đang mở →" secondary onPress={() => router.push('/(tabs)/members')} /></Card>
    </>} />;
}
