import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useFormation } from '@/contexts/FormationContext';
import { Button, Card, Field, SectionHeading, ui, useAction } from './FormationUI';
import { authService } from '@/services/authService';
import { colors } from '@/constants/colors';
import type { ProfileRequest } from '@/types/auth';

export function ProfileEditor() {
  const { user, refreshUser } = useAuth();
  const f = useFormation();
  const action = useAction();
  const [form, setForm] = useState<ProfileRequest>({ phone: '', skills: '', strengths: '', weaknesses: '', profilePrivate: false });
  useEffect(() => { if (user) setForm({ phone: user.phone ?? '', skills: user.skills ?? '', strengths: user.strengths ?? '', weaknesses: user.weaknesses ?? '', profilePrivate: user.profilePrivate }); }, [user]);
  const editable = !(f.semesters[0]?.subjects ?? []).some(s => s.phase === 'FINALIZED' || s.eligibility === 'INELIGIBLE');
  return <Card>
    <SectionHeading eyebrow="📄 Hồ sơ năng lực" title="Giới thiệu bản thân & Kỹ năng" subtitle="Ghi rõ thế mạnh kỹ năng, ưu điểm và nhược điểm để các Trưởng nhóm xem xét khi bạn gửi đơn ứng tuyển." />
    <View style={ui.divider} />
    {action.feedback}
    {(['skills', 'strengths', 'weaknesses', 'phone'] as const).map(field => <View key={field} style={{ gap: 5 }}><Field label={{ phone: 'SỐ ĐIỆN THOẠI', skills: 'THẾ MẠNH KỸ NĂNG', strengths: 'ƯU ĐIỂM', weaknesses: 'NHƯỢC ĐIỂM' }[field]}
      value={form[field]} onChangeText={value => setForm(old => ({ ...old, [field]: value }))} editable={editable && !action.busy}
      placeholder={{ phone: 'Nhập số điện thoại liên hệ', skills: 'VD: Thành thạo ReactJS, Tailwind CSS, REST API...', strengths: 'Điểm mạnh khi làm việc trong nhóm...', weaknesses: 'Những điểm bạn đang cải thiện...' }[field]}
      keyboardType={field === 'phone' ? 'phone-pad' : 'default'} maxLength={field === 'phone' ? 20 : 1000} multiline={field !== 'phone'} />{field !== 'phone' && <Text style={[ui.text, { alignSelf: 'flex-end', fontSize: 10 }]}>{form[field].length}/1000 ký tự</Text>}</View>)}
    <View style={[ui.inset, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}><View style={{ flex: 1, gap: 4 }}><Text style={ui.strong}>Hồ sơ riêng tư</Text><Text style={[ui.text, { fontSize: 11 }]}>Người ngoài chỉ thấy tên và MSSV. Quyền xem chi tiết do hệ thống xác định.</Text></View><Switch accessibilityLabel="Hồ sơ riêng tư" value={form.profilePrivate} onValueChange={value => setForm(old => ({ ...old, profilePrivate: value }))} trackColor={{ true: colors.primary, false: colors.gray[300] }} disabled={!editable || action.busy} /></View>
    {!editable && <Text style={ui.notice}>Danh sách đã chốt hoặc bạn không đủ điều kiện ở học kỳ hiện tại. Hồ sơ chỉ được xem.</Text>}
    <Button title="💾  LƯU PROFILE CÁ NHÂN" disabled={!editable} busy={action.busy} onPress={() => action.run(async () => { await authService.updateProfile(form); await refreshUser(); })} />
  </Card>;
}
