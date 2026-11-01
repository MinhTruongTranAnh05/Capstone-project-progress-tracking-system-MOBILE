import { Text, View } from 'react-native';

export function AuthPromoBanner() {
  return <View style={{ backgroundColor: '#E65100', experimental_backgroundImage: 'linear-gradient(135deg, #E65100 0%, #D84315 100%)', padding: 28, gap: 20, flex: 1, overflow: 'hidden' }}>
    <View style={{ position: 'absolute', right: -40, bottom: -40, width: 192, height: 192, borderRadius: 96, backgroundColor: 'rgba(255,255,255,0.08)' }} />
    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' }}>CỔNG THÔNG TIN CAPSTONE</Text>
    <Text style={{ color: '#FFFFFF', fontSize: 24, lineHeight: 33, fontWeight: '800' }}>Hệ thống ghép nhóm Đồ án tốt nghiệp chuyên ngành</Text>
    {['Ghép nhóm chuyên ngành khép kín đảm bảo tính chính xác cao.', 'Quy mô nhóm chuẩn mực từ 3 đến 5 thành viên chính thức.', 'Điều phối và kiểm duyệt minh bạch toàn bộ học kỳ bởi người điều phối.'].map(text => <View key={text}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
      <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#E65100', fontWeight: '900', fontSize: 12 }}>✓</Text></View><Text style={{ color: '#FFFFFF', flex: 1, fontSize: 12, lineHeight: 20 }}>{text}</Text>
    </View>)}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginTop: 8 }}><Text style={{ color: '#FFEDD5', fontSize: 10 }}>MatchPoint FPT University</Text><Text style={{ color: '#FFEDD5', fontSize: 10 }}>Hệ thống quản lý khép kín</Text></View>
  </View>;
}
