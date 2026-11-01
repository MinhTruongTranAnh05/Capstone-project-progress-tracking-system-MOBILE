import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '800', fontSize: 16 },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Nhóm của tôi' }} />
      <Stack.Screen name="create" options={{ title: 'Tạo nhóm mới' }} />
    </Stack>
  );
}
