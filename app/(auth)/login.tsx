import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthSection } from '@/components/GoogleAuthSection';
import { AuthFrame } from '@/core/ui/AuthFrame';
import { ui } from '@/components/FormationUI';
import { authStyles } from '@/features/auth/presentation/authStyles';
import { PasswordLoginForm } from '@/features/auth/presentation/PasswordLoginForm';

export default function LoginScreen() {
  const { sessionNotice } = useAuth();
  const [busy, setBusy] = useState(false);
  return <AuthFrame><View style={{ gap: 14 }}>
    <View style={{ gap: 3 }}><Text accessibilityRole="header" style={authStyles.heading}>Đăng nhập hệ thống</Text>
    <Text style={authStyles.body}>Sinh viên xác thực bằng Google; Quản trị viên và Điều phối viên dùng mật khẩu hệ thống.</Text></View>
    {!!sessionNotice && <Text accessibilityRole="alert" style={ui.error}>{sessionNotice}</Text>}
    <PasswordLoginForm disabled={busy} onBusyChange={setBusy} />
    <View style={[authStyles.separator, { marginTop: 2 }]}><View style={authStyles.separatorLine} /><Text style={authStyles.separatorText}>Hoặc đăng nhập bằng Google</Text><View style={authStyles.separatorLine} /></View>
    <GoogleAuthSection compact disabled={busy} onBusyChange={setBusy} />
    <Link href="/(auth)/register" style={[authStyles.footnote, { alignSelf: 'flex-start' }]} disabled={busy}>Thông tin tạo tài khoản sinh viên</Link>
  </View></AuthFrame>;
}
