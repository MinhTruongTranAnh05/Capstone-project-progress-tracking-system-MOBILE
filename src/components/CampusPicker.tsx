import { Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { campusLabels } from '@/core/validation/auth';
import type { Campus } from '@/types/auth';
import { Button, ui } from './FormationUI';
import { getErrorMessage } from '@/services/apiError';

export function CampusPicker({ value, onChange }: { value?: Campus; onChange: (value: Campus) => void }) {
  const query = useQuery({ queryKey: ['public', 'campuses'], queryFn: authService.getCampuses });
  return <View style={{ gap: 8 }}><Text style={ui.label}>Cơ sở *</Text>
    {query.isPending && <Text style={ui.text}>Đang tải cơ sở...</Text>}
    {query.isError && <><Text style={ui.error}>{getErrorMessage(query.error)}</Text><Button title="Thử lại" secondary onPress={() => void query.refetch()} /></>}
    <View style={ui.row}>{query.data?.map(campus => <TouchableOpacity key={campus} accessibilityRole="radio" accessibilityState={{ checked: value === campus }} onPress={() => onChange(campus)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={ui.tag}>{value === campus ? '● ' : '○ '}{campusLabels[campus] ?? campus}</Text></TouchableOpacity>)}</View>
  </View>;
}
