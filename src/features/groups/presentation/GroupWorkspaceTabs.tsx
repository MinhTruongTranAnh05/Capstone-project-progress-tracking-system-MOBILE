import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ui } from '@/core/ui/primitives';

export function GroupWorkspaceTabs({ mode }: { mode: 'create' | 'find' }) {
  const router = useRouter();
  return <View style={[ui.card, { flexDirection: 'row', gap: 8, padding: 6, maxWidth: 448, width: '100%', alignSelf: 'center' }]}>
    <View style={{ flex: 1 }}><Button title="🚀 Tạo nhóm mới" secondary={mode !== 'create'} onPress={() => router.navigate('/(tabs)?mode=create')} /></View>
    <View style={{ flex: 1 }}><Button title="🔍 Tìm nhóm đang tuyển" secondary={mode !== 'find'} onPress={() => router.navigate('/(tabs)?mode=find')} /></View>
  </View>;
}
