import { Text, View } from 'react-native';
import type { ProfileView } from '@/types/models';
import { ui } from '@/core/ui/primitives';
export function ProfileDetails({ profile }: { profile: ProfileView }) {
  return <View style={{ gap: 4 }}><Text style={ui.heading}>{profile.fullName}</Text><Text style={ui.text}>{profile.studentCode || 'Chưa có MSSV'}</Text>
    {profile.full ? <><Text style={ui.text}>{profile.email}</Text>{[['Kỹ năng', profile.skills], ['Điểm mạnh', profile.strengths], ['Điểm yếu', profile.weaknesses], ['Điện thoại', profile.phone]].map(([label, value]) => value ? <Text key={label} style={ui.text}>{label}: {value}</Text> : null)}</>
      : <Text style={ui.text}>Hồ sơ riêng tư</Text>}</View>;
}
