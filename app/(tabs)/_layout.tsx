import { Tabs } from 'expo-router';

const pages = [
  { name: 'index', title: 'Tổng quan', icon: 'grid-outline' },
  { name: 'members', title: 'Thành viên', icon: 'people-outline' },
  { name: 'requests', title: 'Đơn Apply', icon: 'document-text-outline' },
  { name: 'management', title: 'Quản lý', icon: 'lock-closed-outline' },
  { name: 'profile', title: 'Hồ sơ', icon: 'person-outline' },
] as const;
export default function TabsLayout() {
  return <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
    {pages.map(page => <Tabs.Screen key={page.name} name={page.name} options={{ title: page.title }} />)}
    <Tabs.Screen name="notifications" options={{ title: 'Thông báo', href: null }} />
  </Tabs>;
}
