import { useState } from 'react';
import { Link } from 'expo-router';
import { ImageBackground, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthSection } from '@/components/GoogleAuthSection';
import { AuthPromoBanner } from '@/components/AuthPromoBanner';
import { Button, Field, ui } from '@/components/FormationUI';
import { CampusPicker } from '@/components/CampusPicker';
import { loginSchema } from '@/core/validation/auth';
import { getErrorMessage, getFieldErrors } from '@/services/apiError';
import type { Campus } from '@/types/auth';

export default function LoginScreen() {
  const { sessionNotice, login } = useAuth();
  const [campus, setCampus] = useState<Campus>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const fields = getFieldErrors(error);
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try { await login(loginSchema.parse({ email, password })); }
    catch (failure) { setError(failure); }
    finally { setBusy(false); }
  };
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return <ImageBackground source={require('../../assets/fpt-bg.jpg')} style={{ flex: 1 }} resizeMode="cover">
    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23,23,23,0.5)' }} />
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 896, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', flexDirection: width >= 880 ? 'row' : 'column', elevation: 6, boxShadow: '0 16px 48px rgba(44,40,37,0.18)' }}>
        <View style={{ flex: 1, padding: width >= 640 ? 36 : 28, gap: 28, justifyContent: 'space-between' }}>
          <View style={ui.row}><Text style={{ color: '#FFFFFF', backgroundColor: '#E65100', padding: 9, borderRadius: 12, fontWeight: '800' }}>✓</Text><Text style={ui.heading}>Lịch Đồ Án</Text></View>
          <View style={{ gap: 10 }}><Text style={ui.title}>Chào mừng trở lại</Text><Text style={ui.text}>Đăng nhập để quản lý nhóm, lịch hẹn và tiến độ đồ án.</Text></View>
          {!!sessionNotice && <Text accessibilityRole="alert" style={ui.error}>{sessionNotice}</Text>}
          <View style={{ gap: 18 }}><View style={[ui.row, { flexWrap: 'nowrap' }]}><View style={[ui.divider, { flex: 1 }]} /><Text style={{ fontSize: 10, color: '#9E958C', fontWeight: '700' }}>ĐĂNG NHẬP BẰNG GOOGLE</Text><View style={[ui.divider, { flex: 1 }]} /></View><CampusPicker value={campus} onChange={setCampus} /><GoogleAuthSection campus={campus} /></View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#E8E2D9', paddingTop: 16, gap: 12 }}>
            <Text style={ui.heading}>Đăng nhập bằng mật khẩu</Text>
            <Text style={ui.text}>Dành cho tài khoản tự đăng ký đã được phê duyệt hoặc tài khoản được hệ thống cho phép đăng nhập mật khẩu.</Text>
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!busy} error={fields.email} />
            <Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} editable={!busy} error={fields.password} />
            <Button title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} secondary onPress={() => setShowPassword(value => !value)} />
            {!!error && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text>}
            <Button title="Đăng nhập" busy={busy} onPress={() => void submit()} />
            <Link href="/(auth)/register" style={ui.tag}>Chưa có tài khoản trường? Đăng ký bằng MSSV</Link>
            <Text style={ui.text}>Ứng dụng dành cho Sinh viên và Trưởng nhóm. Giảng viên và Quản trị viên sử dụng Web.</Text>
            <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={{ color: '#9E958C', fontSize: 11 }}>© 2026 Đại học FPT</Text><Text style={{ color: '#9E958C', fontSize: 11 }}>Cổng sinh viên</Text></View>
          </View>
        </View>
        <AuthPromoBanner />
      </View>
    </ScrollView>
  </ImageBackground>;
}
