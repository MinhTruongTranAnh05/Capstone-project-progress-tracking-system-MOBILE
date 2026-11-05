import { Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Badge, Card, Columns, InfoTile, SectionHeading, TileGrid, ui } from '@/core/ui/primitives';
import { colors } from '@/constants/colors';

export function AccountProfile({ majorName }: { majorName?: string }) {
  const { user } = useAuth();
  const role = user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'LECTURER' ? 'Giảng viên điều phối' : 'Sinh viên';
  return <View style={{ gap: 24 }}>
    <Card style={{ borderBottomWidth: 3, borderBottomColor: '#F3B58C' }}><SectionHeading icon="✓" eyebrow="Tài khoản của tôi" title="Hồ sơ cá nhân" subtitle="Thông tin định danh và vai trò trong hệ thống quản lý đồ án tốt nghiệp." /></Card>
    <Columns asideFirst main={<Card>
      <View style={[ui.row, { justifyContent: 'space-between' }]}><SectionHeading eyebrow="Thông tin tài khoản" title="Thông tin chi tiết" /><Badge tone="neutral">Chỉ xem</Badge></View>
      <View style={[ui.inset, { backgroundColor: '#FFF8F1', borderColor: '#F2D6C2' }]}><Text style={[ui.strong, { color: colors.primary }]}>✦ Thông tin hồ sơ Đồ án tốt nghiệp</Text><Text style={ui.text}>Dữ liệu được đồng bộ trực tiếp từ danh sách do Phòng Đào tạo cung cấp vào hệ thống.</Text></View>
      <TileGrid basis={220}><InfoTile label="Họ và tên" value={user?.fullName} icon="♙" /><InfoTile label="Mã số sinh viên" value={user?.studentCode} icon="🎓" /><InfoTile label="Thư điện tử hệ thống" value={user?.email} icon="✉" /><InfoTile label="Chuyên ngành" value={majorName} icon="🏛" /><InfoTile label="Trạng thái tài khoản" value={user?.status === 'ACTIVE' ? '● Đang hoạt động' : user?.status} icon="●" /><InfoTile label="Vai trò hệ thống" value={role} icon="♛" /></TileGrid>
      <View style={ui.divider} /><Text style={[ui.text, { fontSize: 11 }]}>● Thông tin cấu hình theo phạm vi ngành học đồ án tốt nghiệp.</Text>
    </Card>} aside={<Card style={{ borderTopWidth: 6, borderTopColor: colors.primary }}>
      <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}><View style={{ padding: 5, backgroundColor: '#FFF5EC', borderRadius: 80 }}><Avatar name={user?.fullName} uri={user?.avatarUrl} size={128} /></View><Text style={[ui.title, { textAlign: 'center' }]}>{user?.fullName}</Text><Text style={[ui.text, { textAlign: 'center' }]}>{user?.email}</Text><Badge>{role}</Badge></View>
      <View style={ui.divider} /><InfoTile label="Mã số sinh viên" value={user?.studentCode} icon="🎓" /><InfoTile label="Chuyên ngành" value={majorName} icon="🏛" /><InfoTile label="Vai trò hệ thống" value={role} icon="👥" />
    </Card>} />
  </View>;
}
