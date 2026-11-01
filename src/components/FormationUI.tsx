import { Children, ReactNode, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useFormation } from '@/contexts/FormationContext';
import { getErrorMessage } from '@/services/apiError';
import { notificationService } from '@/services/notificationService';
import { colors } from '@/constants/colors';
import { PHASE_LABELS, formatDate } from '@/constants/formation';
import type { ProfileView } from '@/types/models';

export const ui = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: colors.text, lineHeight: 28 },
  heading: { fontSize: 15, fontWeight: '800', color: colors.text, lineHeight: 22 },
  text: { fontSize: 13, color: colors.textSecondary, lineHeight: 21 },
  strong: { fontSize: 13, fontWeight: '700', color: colors.text, lineHeight: 21 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 22, gap: 16, boxShadow: '0 1px 3px rgba(44,40,37,0.06)' },
  inset: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8 },
  eyebrow: { fontSize: 10, lineHeight: 16, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  tag: { fontSize: 11, fontWeight: '700', color: colors.primary, backgroundColor: colors.primary50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, overflow: 'hidden' },
  error: { color: colors.error, backgroundColor: colors.error50, borderRadius: 12, padding: 12, lineHeight: 21, fontSize: 13 },
  notice: { color: colors.warningDark, backgroundColor: colors.warning50, borderRadius: 12, padding: 12, lineHeight: 21, fontSize: 13 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, minHeight: 46, color: colors.text, fontSize: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 12, minHeight: 44, padding: 12, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: 13, fontWeight: '700', color: colors.textLight, textAlign: 'center' },
});
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) { return <View style={[ui.card, style]}>{children}</View>; }
export function Button({ title, onPress, disabled = false, busy = false, secondary = false, tone }: { title: string; onPress: () => void; disabled?: boolean; busy?: boolean; secondary?: boolean; tone?: 'success' | 'danger' }) {
  const tint = tone === 'success' ? colors.success : tone === 'danger' ? colors.error : undefined;
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }} onPress={onPress} disabled={disabled || busy}
    style={[ui.button, secondary && ui.secondary, tint && { backgroundColor: secondary ? (tone === 'danger' ? colors.error50 : colors.success50) : tint, borderColor: secondary ? 'transparent' : tint }, (disabled || busy) && { opacity: 0.45 }]}>
    {busy ? <ActivityIndicator color={secondary ? colors.primary : colors.textLight} /> : <Text style={[ui.buttonText, secondary && { color: tint ?? colors.text }]}>{title}</Text>}
  </TouchableOpacity>;
}
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 6 }}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.textMuted}
    {...props} style={[ui.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, props.style]} />{error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}</View>;
}
export function ConfirmButton({ title, message, onConfirm, disabled = false, busy = false, tone, secondary = true }: { title: string; message: string; onConfirm: () => void; disabled?: boolean; busy?: boolean; tone?: 'success' | 'danger'; secondary?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><Button title={title} onPress={() => setOpen(true)} secondary={secondary} tone={tone} disabled={disabled} busy={busy} />
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(44,40,37,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}><Card style={{ width: '100%', maxWidth: 448 }}>
        <Text style={ui.heading}>{title}</Text><Text style={ui.text}>{message}</Text>
        <Button title="Xác nhận" tone={tone} disabled={disabled || busy} onPress={() => { setOpen(false); onConfirm(); }} />
        <Button title="Hủy" secondary onPress={() => setOpen(false)} />
      </Card></View>
    </Modal>
  </>;
}
export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  return <Card><Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text><Button title="Thử lại" onPress={retry} secondary /></Card>;
}
export function Empty({ text }: { text: string }) { return <Card><Text style={ui.text}>{text}</Text></Card>; }
export function ProfileDetails({ profile }: { profile: ProfileView }) {
  return <View style={{ gap: 4 }}><Text style={ui.heading}>{profile.fullName}</Text><Text style={ui.text}>{profile.studentCode || 'Chưa có MSSV'}</Text>
    {profile.full ? <><Text style={ui.text}>{profile.email}</Text>{[['Kỹ năng', profile.skills], ['Điểm mạnh', profile.strengths], ['Điểm yếu', profile.weaknesses], ['Điện thoại', profile.phone]].map(([label, value]) => value ? <Text key={label} style={ui.text}>{label}: {value}</Text> : null)}</>
      : <Text style={ui.text}>Hồ sơ riêng tư</Text>}</View>;
}
export function useAction() {
  const { refresh } = useFormation();
  const [message, setMessage] = useState('');
  const mutation = useMutation({ mutationFn: (action: () => Promise<unknown>) => action(), onSuccess: async () => {
    setMessage('Thao tác thành công. Dữ liệu đã được cập nhật.'); await refresh();
  }, onError: () => { void refresh(); } });
  return {
    run: (action: () => Promise<unknown>) => { if (!mutation.isPending) { setMessage(''); mutation.mutate(action); } },
    busy: mutation.isPending,
    feedback: mutation.isError ? <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(mutation.error)}</Text> : message ? <Text accessibilityRole="alert" style={ui.notice}>{message}</Text> : null,
  };
}
export function Avatar({ name, uri, size = 40 }: { name?: string; uri?: string | null; size?: number }) {
  const words = name?.trim().split(/\s+/) ?? [];
  const initials = words.length > 1 ? words.slice(-2).map(word => word[0]).join('').toUpperCase() : (words[0]?.slice(0, 2).toUpperCase() || 'SV');
  return <View style={{ width: size, height: size, borderRadius: size >= 80 ? size / 2 : 12, backgroundColor: '#FCEBDD', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
    {uri ? <Image source={{ uri }} accessibilityLabel={`Ảnh đại diện ${name ?? ''}`} style={{ width: size, height: size }} /> : <Text style={{ color: '#C94A08', fontWeight: '900', fontSize: size * 0.3 }}>{initials}</Text>}
  </View>;
}
export function Badge({ children, tone = 'orange' }: { children: ReactNode; tone?: 'orange' | 'success' | 'warning' | 'neutral' | 'danger' }) {
  const palette = { orange: [colors.primary50, colors.primary, colors.primary100], success: [colors.success50, colors.successDark, colors.successBorder], warning: [colors.warning50, colors.warningDark, colors.warningBorder], neutral: [colors.gray[100], colors.textSecondary, colors.border], danger: [colors.error50, colors.error, colors.errorBorder] }[tone];
  return <View style={{ alignSelf: 'flex-start', borderRadius: 10, borderWidth: 1, borderColor: palette[2], paddingHorizontal: 10, paddingVertical: 6 }}><Text style={{ fontSize: 10, lineHeight: 16, fontWeight: '800', color: palette[1] }}>{children}</Text></View>;
}
export function SectionHeading({ title, subtitle, eyebrow, icon }: { title: string; subtitle?: string; eyebrow?: string; icon?: string }) {
  return <View style={{ gap: 5 }}>{eyebrow && <Text style={[ui.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>}<Text style={ui.title}>{icon ? `${icon}  ` : ''}{title}</Text>{subtitle && <Text style={ui.text}>{subtitle}</Text>}</View>;
}
export function InfoTile({ label, value, icon }: { label: string; value?: string | null; icon?: string }) {
  return <View style={[ui.inset, { flexDirection: 'row', gap: 12 }]}>{icon && <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#FCEBDD', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary, fontSize: 18 }}>{icon}</Text></View>}<View style={{ flex: 1, gap: 5 }}><Text style={[ui.text, { fontSize: 11 }]}>{label}</Text><Text style={ui.strong}>{value || 'Chưa cập nhật'}</Text></View></View>;
}
export function TileGrid({ children, basis = 200 }: { children: ReactNode; basis?: number }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>{Children.toArray(children).map((child, index) => <View key={index} style={{ flexBasis: basis, flexGrow: 1, minWidth: 0 }}>{child}</View>)}</View>;
}
export function Columns({ main, aside, asideFirst = false }: { main: ReactNode; aside: ReactNode; asideFirst?: boolean }) {
  const { width } = useWindowDimensions();
  const horizontal = width >= 1180;
  const mainColumn = <View style={{ flex: horizontal ? 2 : undefined, minWidth: 0, gap: 24 }}>{main}</View>;
  const asideColumn = <View style={{ flex: horizontal ? 1 : undefined, minWidth: 0, gap: 24 }}>{aside}</View>;
  return <View style={{ flexDirection: horizontal ? 'row' : 'column', gap: 24, alignItems: 'stretch' }}>{asideFirst ? <>{asideColumn}{mainColumn}</> : <>{mainColumn}{asideColumn}</>}</View>;
}
function DashboardSidebar({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuth();
  const f = useFormation();
  const router = useRouter();
  const pathname = usePathname();
  const groupNav = [
    { href: '/(tabs)', path: '/', label: 'Tổng quan nhóm', icon: '📊' },
    { href: '/(tabs)/members', path: '/members', label: f.group ? 'Thành viên nhóm (3–5 người)' : 'Hồ sơ & Đăng ký vào nhóm', icon: '👥' },
    { href: '/(tabs)/requests', path: '/requests', label: 'Đơn Apply & Vote', icon: '📝' },
    { href: '/(tabs)/management', path: '/management', label: 'Quản lý trạng thái & Rời nhóm', icon: '🔒' },
    { href: '/(tabs)/profile', path: '/profile', label: 'Hồ sơ cá nhân', icon: '⚙️' },
  ] as const;
  const nav = f.group ? groupNav : [{ href: '/(tabs)', path: '/', label: 'Tạo nhóm', icon: '🚀' }, groupNav[4]] as const;
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
export function FormationPage({ title, children, back = false }: { title: string; children: ReactNode; back?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const { user } = useAuth();
  const f = useFormation();
  const [menu, setMenu] = useState(false);
  const [scopes, setScopes] = useState(false);
  const unread = useQuery({ queryKey: ['formation', user?.id, 'unread'], queryFn: () => notificationService.getUnreadCount(), enabled: !!user, refetchInterval: 30000 });
  const validSize = !!f.group && f.group.size >= 3 && f.group.size <= 5;
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
        <Text accessibilityRole="header" style={ui.eyebrow}>{title}</Text>
        {f.loading ? <ActivityIndicator size="large" color={colors.primary} /> : f.error ? <ErrorState error={f.error} retry={() => void f.refresh()} /> : children}
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
