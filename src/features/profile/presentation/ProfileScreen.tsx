import { useFormation } from '@/contexts/FormationContext';
import { FormationPage } from '@/features/groups/presentation/FormationShell';
import { AccountProfile } from './AccountProfile';

export default function ProfileScreen() {
  const f = useFormation();
  return <FormationPage requiresFormation={false} title="Hồ sơ cá nhân">
    <AccountProfile majorName={f.semester?.majorName} />
  </FormationPage>;
}
