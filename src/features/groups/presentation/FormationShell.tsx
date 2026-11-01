import { isValidGroupSize } from '@/constants/group';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useFormation } from './GroupContext';
import { notificationService } from '@/services/notificationService';
import { colors } from '@/constants/colors';
import { studentPages } from '@/core/navigation';
import { PHASE_LABELS, formatDate } from '../domain/rules';
import { Avatar, Badge, Card, ConfirmButton, ErrorState, ui } from '@/core/ui/primitives';
function DashboardSidebar({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuth();
  const f = useFormation();
  const router = useRouter();
  const pathname = usePathname();
  const nav = studentPages.filter(page => !page.grouped || !!f.group);
  return <View style={{ flex: 1, backgroundColor: colors.surface, borderRightWidth: 1, borderColor: colors.border }}>
    <ScrollView contentContainerStyle={{ padding: 24, gap: 24, flexGrow: 1 }}>
      <View style={[ui.row, { flexWrap: 'nowrap', gap: 12 }]}><View style={shell.logo}><Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>✓</Text></View><View style={{ flex: 1 }}><Text style={[ui.heading, { fontSize: 14 }]}>Quản Lý Sinh Viên</Text><Text style={[ui.text, { fontSize: 11 }]}>MatchPoint FPT Capstone.</Text></View></View>
      <View style={ui.inset}><View style={shell.between}><Text style={ui.label}>Mã nhóm:</Text><Text style={[ui.strong, { color: colors.primary }]}>{f.group?.code || 'Chưa có'}</Text></View>
        <View style={shell.between}><Text style={ui.label}>Thành viên:</Text><Text style={ui.strong}>{f.group ? `${f.group.size}/5 người` : '0/5 (Cần 3–5 người)'}</Text></View><View style={ui.divider} />
        <View style={shell.between}><Text style={ui.label}>Chức vụ:</Text><Badge tone={!f.group ? 'warning' : f.isLeader ? 'success' : 'orange'}>{!f.group ? 'Chưa tham gia' : f.isLeader ? '👑 Nhóm trưởng' : '👤 Thành viên'}</Badge></View>
      </View>
      <View style={{ gap: 6 }}>{nav.map(item => {
        const active = pathname === item.path || (!f.group && item.path === '/' && ['/create', '/members'].includes(pathname));
        return <TouchableOpacity key={item.path} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => { onNavigate(); router.navigate(item.href); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 48, borderRadius: 16, backgroundColor: active ? colors.primary : 'transparent' }}><Text>{item.icon}</Text><Text style={{ fontSize: 12, lineHeight: 19, fontWeight: '700', color: active ? 'white' : colors.textSecondary, flex: 1 }}>{item.label}</Text></TouchableOpacity>;
      })}</View>
      <View style={{ flex: 1 }} />
      <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 18, gap: 16 }}><View style={[ui.row, { flexWrap: 'nowrap' }]}><Avatar name={user?.fullName} uri={user?.avatarUrl} /><View style={{ flex: 1 }}><Text numberOfLines={1} style={ui.strong}>{user?.fullName}</Text><Text numberOfLines={1} style={[ui.text, { fontSize: 10 }]}>{user?.email}</Text></View></View><ConfirmButton title="Đăng xuất" tone="danger" message="Bạn có muốn đăng xuất khỏi MatchPoint FPT?" onConfirm={() => void logout()} /></View>
    </ScrollView>
  </View>;
}
export function FormationPage({ title, children, back = false, requiresFormation = true }: { title: string; children: ReactNode; back?: boolean; requiresFormation?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const { user } = useAuth();
  const f = useFormation();
  const [menu, setMenu] = useState(false);
  const [scopes, setScopes] = useState(false);
  const unread = useQuery({ queryKey: ['formation', user?.id, 'unread'], queryFn: () => notificationService.getUnreadCount(), enabled: !!user, refetchInterval: 30000 });
  const validSize = !!f.group && isValidGroupSize(f.group.size);
  return <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {wide && <View style={{ width: 288 }}><DashboardSidebar onNavigate={() => undefined} /></View>}
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={shell.header}>
        {!wide && <TouchableOpacity accessibilityLabel="Mở menu điều hướng" accessibilityRole="button" onPress={() => setMenu(true)} style={shell.iconButton}><Ionicons name="menu-outline" size={24} color={colors.text} /></TouchableOpacity>}
        {back && <TouchableOpacity accessibilityLabel="Quay lại" accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={shell.iconButton}><Ionicons name="arrow-back" size={22} color={colors.primary} /></TouchableOpacity>}
        <View style={{ flex: 1, gap: 2 }}><Text style={[ui.label, { color: colors.primary }]}>Đợt Lập Nhóm Đầu Kỳ</Text><Text style={{ fontSize: 10, color: colors.textSecondary }}>Khoa CNTT - Đại học FPT</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Làm mới nhóm" disabled={!!f.refreshing} onPress={() => void f.refresh()} style={shell.iconButton}>{f.refreshing ? <ActivityIndicator color={colors.primary} size="small" /> : <Ionicons name="refresh-outline" size={20} color={colors.primary} />}</TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Thông báo, ${unread.data?.unread ?? 0} chưa đọc`} onPress={() => router.push('/(tabs)/notifications')} style={shell.iconButton}><Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />{!!unread.data?.unread && <View style={shell.counter}><Text style={{ color: 'white', fontSize: 9, fontWeight: '800' }}>{unread.data.unread > 99 ? '99+' : unread.data.unread}</Text></View>}</TouchableOpacity>
        {width >= 650 && <><View style={{ borderLeftWidth: 1, borderColor: colors.border, paddingLeft: 14 }}><Text style={ui.strong}>{user?.fullName}</Text><Text style={{ fontSize: 10, color: colors.textSecondary }}>{user?.email}</Text></View><Badge tone={f.isLeader ? 'success' : 'orange'}>{f.isLeader ? '👑 Nhóm trưởng' : '🎓 STUDENT'}</Badge></>}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: wide ? 32 : 16, paddingBottom: insets.bottom + 28, gap: 20, width: '100%', maxWidth: 1344, alignSelf: 'center' }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" refreshControl={<RefreshControl refreshing={!!f.refreshing} onRefresh={() => void f.refresh()} colors={[colors.primary]} />}>
        {f.group && <View style={[shell.roster, { backgroundColor: validSize ? colors.success50 : colors.warning50, borderColor: validSize ? colors.successBorder : colors.warningBorder }]}><View style={{ gap: 4, flex: 1 }}><Text style={[ui.eyebrow, { color: validSize ? colors.successDark : colors.warningDark }]}>Trạng thái sĩ số nhóm</Text><Text style={[ui.strong, { fontSize: 12, color: validSize ? colors.successDark : colors.warningDark }]}>{validSize ? `Nhóm đã đạt sĩ số hợp lệ (${f.group.size}/5 thành viên)` : `Nhóm hiện có ${f.group.size}/5 thành viên (Yêu cầu tối thiểu 3 thành viên)`}</Text></View><Badge tone={validSize ? 'success' : 'warning'}>{validSize ? '✓ Đạt chuẩn' : 'Cần bổ sung thành viên'}</Badge></View>}
        {f.semesters.length > 0 && <View style={{ gap: 12 }}><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: scopes }} onPress={() => setScopes(!scopes)} style={[ui.inset, { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', gap: 12, paddingVertical: 12 }]}><Ionicons name="calendar-outline" size={18} color={colors.primary} /><View style={{ flex: 1 }}><Text style={ui.label}>{f.semester?.semesterName} · {f.subject?.name}</Text><Text style={{ fontSize: 10, lineHeight: 18, color: colors.textSecondary }}>{f.subject ? `${PHASE_LABELS[f.subject.phase]} · Hạn: ${formatDate(f.subject.deadline)}` : 'Chọn học kỳ / Môn học'}</Text></View><Ionicons name={scopes ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} /></TouchableOpacity>
          {scopes && <Card>{f.semesters.map(sem => <View key={sem.semesterCode} style={{ gap: 10 }}><Text style={ui.strong}>{sem.semesterName} · {sem.majorName}{sem.readOnly ? ' · Chỉ xem' : ''}</Text><View style={ui.row}>{sem.subjects.map(sub => <TouchableOpacity key={sub.scopeId} accessibilityRole="radio" accessibilityState={{ checked: f.subject?.scopeId === sub.scopeId }} onPress={() => { f.selectScope(sub.scopeId); setScopes(false); }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={[ui.tag, f.subject?.scopeId === sub.scopeId && { backgroundColor: colors.primary, color: 'white' }]}>{sub.name}</Text></TouchableOpacity>)}</View></View>)}</Card>}
          {f.subject?.eligibility === 'INELIGIBLE' && <Text style={ui.notice}>Chỉ được xem: {f.subject.eligibilityReason || 'Chưa đủ điều kiện lập nhóm.'}</Text>}{f.semester?.readOnly && <Text style={ui.notice}>Học kỳ trước chỉ được xem.</Text>}
        </View>}
        {!!f.recoveryNotice && requiresFormation && <Text style={ui.notice}>{f.recoveryNotice}</Text>}
        <Text accessibilityRole="header" style={ui.eyebrow}>{title}</Text>
        {requiresFormation && f.loading ? <ActivityIndicator size="large" color={colors.primary} /> : requiresFormation && f.error ? <ErrorState error={f.error} retry={() => void f.refresh()} /> : children}
      </ScrollView>
    </View>
    <Modal visible={menu && !wide} transparent animationType="fade" onRequestClose={() => setMenu(false)}><View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.overlayDark }}><View style={{ width: Math.min(width - 40, 320), paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: 'white' }}><View style={{ alignItems: 'flex-end', paddingRight: 12 }}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng menu" onPress={() => setMenu(false)} style={shell.iconButton}><Ionicons name="close" size={24} color={colors.textSecondary} /></TouchableOpacity></View><DashboardSidebar onNavigate={() => setMenu(false)} /></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng menu" style={{ flex: 1 }} onPress={() => setMenu(false)} /></View></Modal>
  </KeyboardAvoidingView>;
}
const shell = StyleSheet.create({
  logo: { width: 40, height: 40, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(230,81,0,0.2)' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  header: { backgroundColor: 'white', borderBottomWidth: 1, borderColor: colors.border, minHeight: 72, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  counter: { position: 'absolute', right: 0, top: 0, minWidth: 17, height: 17, paddingHorizontal: 3, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  roster: { padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
});
