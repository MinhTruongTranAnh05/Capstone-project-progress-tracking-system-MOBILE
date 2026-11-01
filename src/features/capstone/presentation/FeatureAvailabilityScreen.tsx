import { Text } from 'react-native';
import { Badge, Card, FormationPage, SectionHeading, ui } from '@/components/FormationUI';
import { unavailableFeatures } from '../domain/availability';

export function FeatureAvailabilityScreen({ feature }: { feature: keyof typeof unavailableFeatures }) {
  const item = unavailableFeatures[feature];
  return <FormationPage title={item.title} requiresFormation={false}>
    <Card><SectionHeading title={item.title} /><Badge tone="warning">Chưa khả dụng</Badge>
      <Text style={ui.text}>{item.description}</Text>
      <Text style={ui.text}>Vui lòng liên hệ Người điều phối để biết khi nào chức năng được mở.</Text>
    </Card>
  </FormationPage>;
}
