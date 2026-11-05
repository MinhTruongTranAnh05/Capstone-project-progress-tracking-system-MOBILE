import { FormationPage } from '@/features/groups/presentation/FormationShell';
import { NotificationsContent } from './NotificationsContent';

export default function NotificationsScreen() {
  return <FormationPage requiresFormation={false} title="Trung tâm thông báo">
    <NotificationsContent />
  </FormationPage>;
}
