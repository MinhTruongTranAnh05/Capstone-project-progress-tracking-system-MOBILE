import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { AuthFrame } from '@/core/ui/AuthFrame';
import { Badge, ui } from '@/components/FormationUI';

export default function AccountAccessScreen() {
  return <AuthFrame><View style={{ gap: 18 }}>
    <Badge>Tài khoản sinh viên</Badge>
    <Text style={ui.title}>Tạo tài khoản mới</Text>
    <Text style={ui.text}>Thông tin truy cập hệ thống ghép nhóm đồ án tốt nghiệp.</Text>
    <View style={ui.inset}>
      <Text accessibilityRole="header" style={ui.heading}>Nhà trường cấp tài khoản từ danh sách sinh viên</Text>
      <Text style={ui.text}>Chức năng tự đăng ký chưa được mở. Bạn không cần tạo mật khẩu hoặc nhập thông tin cá nhân tại đây.</Text>
      <Text style={ui.text}>Dùng email Google cá nhân đã có trong danh sách của phòng đào tạo. Nếu chưa được cấp quyền, hãy liên hệ Người điều phối để kiểm tra email và MSSV của bạn.</Text>
    </View>
    <Text style={ui.notice}>Tài khoản chỉ hoạt động sau khi nhà trường cập nhật danh sách. Ứng dụng chưa thể gửi yêu cầu tạo tài khoản.</Text>
    <Link href="/(auth)/login" style={ui.tag}>Về trang đăng nhập bằng Google</Link>
  </View></AuthFrame>;
}
