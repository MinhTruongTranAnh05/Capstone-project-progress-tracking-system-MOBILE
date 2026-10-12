import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: () => <TabIcon icon="🏠" />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Lịch hẹn',
          tabBarIcon: () => <TabIcon icon="📅" />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: () => <TabIcon icon="🔔" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: () => <TabIcon icon="👤" />,
        }}
      />
    </Tabs>
  );
}
