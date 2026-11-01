import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthSection } from '@/components/GoogleAuthSection';
import { AuthFrame } from '@/core/ui/AuthFrame';
import { ui } from '@/components/FormationUI';

export default function LoginScreen() {
  const { sessionNotice } = useAuth();
  return <AuthFrame><View style={{ gap: 16 }}>
    <Text style={ui.title}>Đăng nhập hệ thống</Text>
    <Text style={ui.text}>Sinh viên xác thực bằng Google để tìm nhóm và quản lý nhóm trong học kỳ.</Text>
    {!!sessionNotice && <Text accessibilityRole="alert" style={ui.error}>{sessionNotice}</Text>}
    <GoogleAuthSection />
    <Link href="/(auth)/register" style={ui.tag}>Thông tin tạo tài khoản</Link>
    <Text style={ui.text}>Quản trị viên và Người điều phối sử dụng phiên bản Web.</Text>
  </View></AuthFrame>;
}
