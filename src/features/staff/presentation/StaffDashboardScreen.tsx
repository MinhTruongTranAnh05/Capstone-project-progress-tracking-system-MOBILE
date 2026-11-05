import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Badge, ConfirmButton, ui } from '@/core/ui/primitives';
import { colors } from '@/constants/colors';
import { canUseStaffSession } from '@/core/auth/access';
import { notificationService } from '@/services/notificationService';
import { NotificationsPopup } from '@/features/notifications/presentation/NotificationsPopup';
import { AccountProfile } from '@/features/profile/presentation/AccountProfile';
import { getStaffNavigation, getStaffSection, type StaffSection } from '../domain/navigation';
import { StaffProvider, useStaff } from './StaffContext';
import { LoadState, SemesterPicker, useStaffAction } from './controls';
import { staffApi } from '../data/staffApi';
import { MonitoringPanel, MajorsPanel, SemestersPanel, AccountsPanel, EligibilityPanel } from './AdminPanels';
import { GroupsPanel, ScopesPanel, LeaveRequestsPanel } from './CoordinationPanels';

export default function StaffDashboardScreen() {
  const { user } = useAuth();
  if (!canUseStaffSession(user)) return null;
  return <StaffProvider><StaffDashboard /></StaffProvider>;
}
function StaffDashboard() {
  const { user, logout } = useAuth();
  const f = useStaff();
  const { section: requested } = useLocalSearchParams<{ section?: string }>();
  const [section, setSection] = useState<StaffSection>(() => getStaffSection(user!.role, requested)!);
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | undefined>();
  const headerAction = useStaffAction();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const queryClient = useQueryClient();
  const pages = getStaffNavigation(user!.role);
  const currentSection = getStaffSection(user!.role, section)!;
  const needsSemester = !['profile', 'majors', 'accounts', 'semesters'].includes(currentSection);
  const current = pages.find(p => p.key === currentSection)!;
  const unread = useQuery({ queryKey: ['formation', user?.id, 'unread'], queryFn: () => notificationService.getUnreadCount(), refetchInterval: 30000 });
  const role = f.admin ? 'Quản trị viên' : 'Điều phối viên';
  const navigate = (key: StaffSection) => { setSection(key); setMenu(false); };
  const sidebar = <View style={{ flex: 1, backgroundColor: 'white', borderRightWidth: 1, borderColor: colors.border }}>
    <ScrollView contentContainerStyle={{ padding: 24, gap: 20, flexGrow: 1 }}>
      <View style={[ui.row, { flexWrap: 'nowrap' }]}><View style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>✓</Text></View><View style={{ flex: 1 }}><Text style={ui.strong}>{f.admin ? 'Quản trị Hệ Thống' : 'Quản lý Điều phối'}</Text><Text style={[ui.text, { fontSize: 10 }]}>Hệ thống Quản lý Đồ án FPT</Text></View></View>
      <View style={{ gap: 6 }}>{pages.map(page => <View key={page.key}>
        {'section' in page && <Text style={[ui.eyebrow, { paddingVertical: 12 }]}>{page.section}</Text>}
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: page.key === currentSection }} onPress={() => navigate(page.key)} style={{ padding: 14, minHeight: 48, flexDirection: 'row', gap: 12, borderRadius: 16, backgroundColor: page.key === currentSection ? colors.primary : 'transparent' }}><Text>{page.icon}</Text><Text style={[ui.strong, { flex: 1, color: page.key === currentSection ? 'white' : colors.textSecondary, fontSize: 12 }]}>{page.label}</Text></TouchableOpacity>
      </View>)}</View><View style={{ flex: 1 }} />
      <View style={{ gap: 16, borderTopWidth: 1, borderColor: colors.border, paddingTop: 20 }}><View style={[ui.row, { flexWrap: 'nowrap' }]}><Avatar name={user?.fullName} uri={user?.avatarUrl} /><View style={{ flex: 1 }}><Text style={ui.strong}>{user?.fullName}</Text><Text style={[ui.text, { fontSize: 10 }]}>{user?.email}</Text></View></View><ConfirmButton title="Đăng xuất" tone="danger" message="Bạn có muốn đăng xuất khỏi MatchPoint FPT?" onConfirm={() => void logout()} /></View>
    </ScrollView>
  </View>;
  return <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
    {wide && <View style={{ width: 288 }}>{sidebar}</View>}
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ minHeight: 72, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'white', borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {!wide && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mở menu điều hướng" onPress={() => setMenu(true)} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}><Ionicons name="menu-outline" size={24} color={colors.text} /></TouchableOpacity>}
        <View style={{ flex: 1 }}><Text style={[ui.label, { color: colors.primary }]}>{role}</Text><Text style={ui.text}>{current.label}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Làm mới dữ liệu" onPress={() => void queryClient.invalidateQueries({ queryKey: f.key })} style={{ padding: 12 }}><Ionicons name="refresh-outline" size={22} color={colors.primary} /></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Thông báo, ${unread.data?.unread ?? 0} chưa đọc`} accessibilityState={{ expanded: notifications }} onPress={() => setNotifications(true)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />{!!unread.data?.unread && <View style={{ position: 'absolute', top: 0, right: 0 }}><Badge>{unread.data.unread > 99 ? '99+' : unread.data.unread}</Badge></View>}</TouchableOpacity>
      </View>
      <ScrollView key={currentSection} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: wide ? 32 : 16, paddingBottom: insets.bottom + 28, gap: 20, width: '100%', maxWidth: 1344, alignSelf: 'center' }}>
        <Text accessibilityRole="header" style={ui.title}>{current.label}</Text>
        {headerAction.feedback}
        {currentSection === 'profile' ? <AccountProfile /> : <LoadState pending={needsSemester && f.loading} error={needsSemester ? f.error : null} retry={f.refresh}>
          {!['majors', 'accounts', 'semesters'].includes(currentSection) && <SemesterPicker />}
          {currentSection === 'monitoring' && <MonitoringPanel key={f.semester} />}
          {currentSection === 'majors' && <MajorsPanel />}
          {currentSection === 'semesters' && <SemestersPanel />}
          {currentSection === 'accounts' && <AccountsPanel />}
          {currentSection === 'eligibility' && <EligibilityPanel key={f.semester} />}
          {currentSection === 'groups' && <GroupsPanel key={f.semester} />}
          {currentSection === 'group-control' && <GroupsPanel key={f.semester} controls />}
          {currentSection === 'scopes' && <ScopesPanel key={f.semester} />}
          {(currentSection === 'leader-leave' || currentSection === 'leave-requests') && <LeaveRequestsPanel key={f.semester} selectedId={selectedRequest} />}
        </LoadState>}
      </ScrollView>
    </View>
    {notifications && <NotificationsPopup onClose={() => setNotifications(false)} onOpenRequest={(requestId, groupId) => {
      setNotifications(false); setSelectedRequest(requestId); navigate(f.admin ? 'leader-leave' : 'leave-requests');
      if (groupId) headerAction.run(async () => { const group = await staffApi.group(groupId); f.selectSemester(group.semesterCode); });
    }} />}
    <Modal visible={menu && !wide} transparent animationType="fade" onRequestClose={() => setMenu(false)}><View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.overlayDark }}><View style={{ width: Math.min(width - 40, 320), paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: 'white' }}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng menu" onPress={() => setMenu(false)} style={{ padding: 16, alignSelf: 'flex-end' }}><Ionicons name="close" size={24} /></TouchableOpacity>{sidebar}</View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng menu" style={{ flex: 1 }} onPress={() => setMenu(false)} /></View></Modal>
  </View>;
}
