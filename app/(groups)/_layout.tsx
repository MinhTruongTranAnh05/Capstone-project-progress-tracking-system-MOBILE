import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '800', fontSize: 16 },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Nhóm của tôi' }} />
      <Stack.Screen name="create" options={{ title: 'Tạo nhóm mới' }} />
      <Stack.Screen name="topics" options={{ title: 'Danh mục đề tài' }} />
      <Stack.Screen name="progress" options={{ title: 'Tiến độ đồ án' }} />
      <Stack.Screen name="documents" options={{ title: 'Tài liệu & Báo cáo' }} />
    </Stack>
  );
}
