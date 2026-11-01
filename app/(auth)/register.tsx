import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Field, ui } from '@/components/FormationUI';
import { CampusPicker } from '@/components/CampusPicker';
import { registrationSchema } from '@/core/validation/auth';
import { authService } from '@/services/authService';
import { getErrorMessage, getFieldErrors } from '@/services/apiError';
import type { Campus } from '@/types/auth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ fullName: '', studentCode: '', email: '', password: '', confirmPassword: '' });
  const [campus, setCampus] = useState<Campus>();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState('');
  const fields = getFieldErrors(error);
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const parsed = registrationSchema.parse({ ...form, campus, agreeTerms });
      await authService.register({ fullName: parsed.fullName, studentCode: parsed.studentCode, email: parsed.email, password: parsed.password, campus: parsed.campus });
      setSuccess('Đã nhận đăng ký. Vui lòng chờ quản trị viên phê duyệt trước khi đăng nhập.');
      setForm(old => ({ ...old, password: '', confirmPassword: '' }));
    } catch (failure) { setError(failure); }
    finally { setBusy(false); }
  };
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 16 }}><Card>
    <Text style={ui.title}>Đăng ký tài khoản Sinh viên</Text><Text style={ui.text}>Dùng email cá nhân và MSSV nếu bạn chưa có tài khoản Google của trường.</Text>
    {success ? <Text style={ui.notice}>{success}</Text> : <>
      {(['fullName', 'studentCode', 'email', 'password', 'confirmPassword'] as const).map(key => <Field key={key} label={{ fullName: 'Họ và tên', studentCode: 'Mã số sinh viên (MSSV)', email: 'Email', password: 'Mật khẩu', confirmPassword: 'Xác nhận mật khẩu' }[key]} value={form[key]} error={fields[key]} onChangeText={value => setForm(old => ({ ...old, [key]: value }))} editable={!busy} secureTextEntry={key === 'password' || key === 'confirmPassword'} autoCapitalize={key === 'studentCode' ? 'characters' : 'none'} keyboardType={key === 'email' ? 'email-address' : 'default'} maxLength={key === 'password' || key === 'confirmPassword' ? 100 : 255} />)}
      <CampusPicker value={campus} onChange={setCampus} />{fields.campus && <Text style={ui.error}>Vui lòng chọn cơ sở.</Text>}
      <View style={ui.row}><Switch value={agreeTerms} onValueChange={setAgreeTerms} accessibilityLabel="Đồng ý Điều khoản sử dụng" /><Text style={[ui.text, { flex: 1 }]}>Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Nhà trường.</Text></View>
      {!!error && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text>}
      <Button title="Tạo tài khoản" busy={busy} onPress={() => void submit()} />
    </>}
    <Link href="/(auth)/login" style={ui.tag}>Đã có tài khoản? Đăng nhập</Link>
  </Card></ScrollView>;
}
