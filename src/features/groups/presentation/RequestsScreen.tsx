import { Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useFormation } from '@/contexts/FormationContext';
import { Card, Empty, ErrorState, FormationPage, ui, useAction } from '@/components/FormationUI';
import { GroupInvitationForm } from '@/components/GroupInvitationForm';
import { RequestCard } from '@/components/JoinRequestCard';
import { groupService } from '@/services/groupService';
import { isPending } from '@/constants/formation';

export default function RequestsScreen() {
  const f = useFormation();
  return <FormationPage title="Đơn Apply & Vote">{f.subject ? <RequestsBody key={f.subject.scopeId} /> : <Empty text="Chưa có môn học." />}</FormationPage>;
}
function RequestsBody() {
  const f = useFormation();
  const action = useAction();
  const requests = useQuery({ queryKey: [...f.key, f.group ? 'groupRequests' : 'myRequests', f.group?.id ?? f.subject!.subjectId],
    queryFn: ({ signal }) => f.group ? groupService.requests(f.group.id, signal) : groupService.myRequests(f.subject!.subjectId, signal) });
  const pendingApplications = requests.data?.filter(r => r.type === 'APPLY' && isPending(r)) ?? [];
  const pendingInvitations = requests.data?.filter(r => r.type === 'INVITE' && isPending(r)) ?? [];
  const history = requests.data?.filter(r => !isPending(r)) ?? [];
  return <>{action.feedback}
    {f.group && <GroupInvitationForm />}
    {requests.isPending && <Empty text="Đang tải danh sách ứng tuyển..." />}
    {requests.error && <ErrorState error={requests.error} retry={() => void requests.refetch()} />}
    {requests.isSuccess && <>
      <Card><Text style={ui.eyebrow}>{f.group ? 'Các lời mời đang chờ' : 'Lời mời tham gia nhóm từ Trưởng nhóm'} ({pendingInvitations.length})</Text>{!pendingInvitations.length && <Text style={ui.text}>Chưa có lời mời đang chờ.</Text>}{pendingInvitations.map(r => <RequestCard key={r.id} request={r} action={action} inset />)}</Card>
      <Card><Text style={ui.eyebrow}>{f.group ? 'Danh sách đơn Apply chờ xét duyệt' : 'Đơn Apply của tôi'} ({pendingApplications.length})</Text><Text style={[ui.text, { fontSize: 11 }]}>{f.isLeader ? 'Bạn có quyền duyệt hoặc từ chối đơn' : f.group ? 'Bạn đang xem ở chế độ Thành viên' : 'Tối đa 3 đơn Apply đang chờ.'}</Text>
        {!pendingApplications.length && <Text style={[ui.text, { fontStyle: 'italic' }]}>{f.group ? 'Chưa có sinh viên nào nộp đơn apply vào nhóm.' : 'Bạn chưa có đơn Apply đang chờ.'}</Text>}
        {pendingApplications.map(r => <RequestCard key={r.id} request={r} action={action} inset />)}
        {f.group && <Text style={[ui.text, { fontSize: 11 }]}>Like là ý kiến tham khảo của thành viên. Trưởng nhóm quyết định đơn Apply; đơn hết hạn hoặc đợt lập nhóm đóng sẽ không thể xử lý.</Text>}
      </Card>
      {!!history.length && <Card><Text style={ui.eyebrow}>Lịch sử yêu cầu</Text>{history.map(r => <RequestCard key={r.id} request={r} action={action} inset />)}</Card>}
    </>}
  </>;
}
