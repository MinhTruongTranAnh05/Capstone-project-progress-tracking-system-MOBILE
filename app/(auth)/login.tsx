import { ImageBackground, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthSection } from '@/components/GoogleAuthSection';
import { AuthPromoBanner } from '@/components/AuthPromoBanner';
import { ui } from '@/components/FormationUI';

export default function LoginScreen() {
  const { sessionNotice } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return <ImageBackground source={require('../../assets/fpt-bg.jpg')} style={{ flex: 1 }} resizeMode="cover">
    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23,23,23,0.5)' }} />
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 896, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', flexDirection: width >= 880 ? 'row' : 'column', elevation: 6, boxShadow: '0 16px 48px rgba(44,40,37,0.18)' }}>
        <View style={{ flex: 1, padding: width >= 640 ? 36 : 28, gap: 28, justifyContent: 'space-between' }}>
          <View style={ui.row}><Text style={{ color: '#FFFFFF', backgroundColor: '#E65100', padding: 9, borderRadius: 12, fontWeight: '800' }}>✓</Text><Text style={ui.heading}>MatchPoint FPT</Text></View>
          <View style={{ gap: 10 }}><Text style={ui.title}>Đăng nhập hệ thống</Text><Text style={ui.text}>Sinh viên xác thực bằng Google để tìm nhóm và quản lý nhóm trong học kỳ.</Text></View>
          {!!sessionNotice && <Text accessibilityRole="alert" style={ui.error}>{sessionNotice}</Text>}
          <View style={{ gap: 18 }}><View style={[ui.row, { flexWrap: 'nowrap' }]}><View style={[ui.divider, { flex: 1 }]} /><Text style={{ fontSize: 10, color: '#9E958C', fontWeight: '700' }}>ĐĂNG NHẬP BẰNG GOOGLE</Text><View style={[ui.divider, { flex: 1 }]} /></View><GoogleAuthSection /></View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#E8E2D9', paddingTop: 16, gap: 12 }}>
            <Text style={ui.text}>Quản trị viên và Điều phối viên: vui lòng dùng phiên bản Web.</Text>
            <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={{ color: '#9E958C', fontSize: 11 }}>© 2026 Đại học FPT</Text><Text style={{ color: '#9E958C', fontSize: 11 }}>Phiên bản v2.9</Text></View>
          </View>
        </View>
        <AuthPromoBanner />
      </View>
    </ScrollView>
  </ImageBackground>;
}
