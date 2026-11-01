import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useFormation } from '@/contexts/FormationContext';
import { Button, Card, ConfirmButton, ErrorState, ui, useAction } from './FormationUI';
import { groupService } from '@/services/groupService';
import { colors } from '@/constants/colors';

export function LeaderTransferRequests() {
  const f = useFormation();
  const { user } = useAuth();
  const action = useAction();
  const transfers = useQuery({ queryKey: [...f.key, 'transfers'], queryFn: ({ signal }) => groupService.transfers(signal) });
  const pending = transfers.data?.filter(t => t.status === 'PENDING' && t.groupId === f.group?.id) ?? [];
  const allowed = f.canParticipate && f.subject?.phase !== 'PREPARING';
  if (transfers.error) return <ErrorState error={transfers.error} retry={() => void transfers.refetch()} />;
  if (!pending.length) return null;
  return <Card style={{ backgroundColor: colors.primary50, borderColor: colors.primary100 }}><Text style={[ui.eyebrow, { color: colors.primary }]}>👑 Yêu cầu chuyển giao quyền Trưởng nhóm đang chờ xử lý</Text>{action.feedback}
    {pending.map(t => <View key={t.id} style={[ui.inset, { backgroundColor: 'white' }]}><Text style={ui.strong}>Trưởng nhóm {t.fromName} muốn bàn giao quyền Leader cho {t.toUserId === user?.id ? 'bạn' : t.toName}.</Text><Text style={ui.text}>Mã nhóm: {t.groupCode}</Text>
      {t.toUserId === user?.id && <><ConfirmButton title="Chấp nhận làm Leader" tone="success" secondary={false} message="Bạn có chắc chắn muốn nhận vai trò Trưởng nhóm này không?" disabled={!allowed || (t.leaveAfter && !f.canAct)} busy={action.busy} onConfirm={() => action.run(() => groupService.answerTransfer(t.id, 'accept'))} /><Button title="Từ chối" tone="danger" secondary disabled={!allowed} busy={action.busy} onPress={() => action.run(() => groupService.answerTransfer(t.id, 'decline'))} /></>}
      {t.fromUserId === user?.id && <Button title="Hủy đề xuất" secondary disabled={!allowed} busy={action.busy} onPress={() => action.run(() => groupService.answerTransfer(t.id, 'cancel'))} />}
    </View>)}
  </Card>;
}
