import { Tabs } from 'expo-router';
import { studentPages } from '@/core/navigation';
export default function TabsLayout() {
  return <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
    {studentPages.map(page => <Tabs.Screen key={page.name} name={page.name} options={{ title: page.label }} />)}
    <Tabs.Screen name="notifications" options={{ href: null }} />
  </Tabs>;
}
