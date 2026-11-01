import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Field, SectionHeading, ui, useAction } from './FormationUI';
import { authService } from '@/services/authService';
export const profileSchema = z.object({ bio: z.string().max(1000, 'Giới thiệu tối đa 1000 ký tự.'), skills: z.string().max(500, 'Kỹ năng tối đa 500 ký tự.') });
export function ProfileEditor() {
  const { user, refreshUser } = useAuth();
  const action = useAction();
  const [bio, setBio] = useState(user?.bio ?? '');
  const [skills, setSkills] = useState(user?.skills ?? '');
  useEffect(() => { setBio(user?.bio ?? ''); setSkills(user?.skills ?? ''); }, [user?.id, user?.bio, user?.skills]);
  return <Card><SectionHeading title="Hồ sơ năng lực" subtitle="Thông tin được hiển thị theo quyền xem hồ sơ ứng tuyển do hệ thống xác định." />
    {action.feedback}
    <Field label="Giới thiệu bản thân" value={bio} onChangeText={setBio} maxLength={1000} multiline editable={!action.busy} />
    <Text style={ui.text}>{bio.length}/1000 ký tự</Text>
    <Field label="Kỹ năng" value={skills} onChangeText={setSkills} maxLength={500} multiline editable={!action.busy} />
    <Text style={ui.text}>{skills.length}/500 ký tự</Text>
    <Button title="Lưu hồ sơ" busy={action.busy} onPress={() => action.run(async () => { await authService.updateProfile(profileSchema.parse({ bio, skills })); await refreshUser(); })} />
  </Card>;
}
