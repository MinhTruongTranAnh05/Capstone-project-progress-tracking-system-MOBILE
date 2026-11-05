import { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useFormation } from '@/contexts/FormationContext';
import { Badge, Button, Card, ConfirmButton, Empty, ErrorState, Field, FormationPage, ui, useAction } from '@/components/FormationUI';
import { colors } from '@/constants/colors';
import { groupService } from '@/services/groupService';
import { formatDate, STATUS_LABELS } from '@/constants/formation';
import type { LeaveRequest } from '@/types/models';

export default function ManagementScreen() {
  const f = useFormation();
  return <FormationPage title="Quản lý trạng thái & Rời nhóm">{f.subject ? <ManagementBody key={[f.subject.scopeId, f.group?.id, f.group?.name, f.group?.wantedSkills].join(':')} /> : <Empty text="Chưa có môn học." />}</FormationPage>;
}
function ManagementBody() {
  const f = useFormation();
  const { user } = useAuth();
  const action = useAction();
  const [reason, setReason] = useState('');
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const leaves = useQuery({ queryKey: [...f.key, 'leaves', f.group?.id ?? 'mine'], queryFn: ({ signal }) => f.group ? groupService.groupLeaves(f.group.id, signal) : groupService.myLeaves(signal) });
  const canLeave = f.canParticipate && !f.group?.finalized && (f.subject?.phase === 'OPEN' || f.subject?.phase === 'LOCKED')
    && !(f.isLeader && f.group?.locked && f.canAct);
  const pendingLeave = leaves.data?.find(r => r.userId === user?.id && ['PENDING_LEADER', 'PENDING_MODERATOR'].includes(r.status));
  return <>{action.feedback}
    {f.group ? <>
      <Card><Text style={ui.eyebrow}>Tổng quan trạng thái nhóm</Text><View style={ui.inset}><Text style={ui.heading}>Mã nhóm: {f.group.code}</Text><Text style={ui.text}>Sĩ số hiện tại: <Text style={[ui.strong, { color: colors.primary }]}>{f.group.size}/5 thành viên</Text></Text><Text style={ui.text}>Vai trò của bạn: <Text style={ui.strong}>{f.isLeader ? '👑 Trưởng nhóm' : '👤 Thành viên'}</Text></Text></View></Card>
      {f.isLeader && <Card><Text style={ui.eyebrow}>Quản lý trạng thái khóa nhóm</Text><Text style={ui.text}>Trạng thái hiện tại:</Text><Badge tone={f.group.locked ? 'danger' : 'success'}>{f.group.locked ? '🔒 Đang khóa (Không nhận đơn mới)' : '🔓 Đang mở (Cho phép nhận đơn)'}</Badge>
        <ConfirmButton title={f.group.locked ? 'Mở khóa nhóm' : 'Khóa nhóm'} tone={f.group.locked ? 'success' : 'danger'} secondary={false} message={f.group.locked ? 'Mở lại nhóm để nhận đơn Apply mới?' : 'Khóa nhóm sẽ ngừng nhận đơn Apply mới. Bạn có muốn tiếp tục?'} disabled={!f.canAct || f.group.finalized} busy={action.busy} onConfirm={() => action.run(() => groupService.lock(f.group!.id, !f.group!.locked))} />
        <Text style={ui.text}>Khóa nhóm ngừng nhận đơn Apply. Đủ 5 thành viên hoặc hết hạn vẫn do hệ thống kiểm tra.</Text>
      </Card>}
      <Card><Text style={[ui.eyebrow, { color: colors.error }]}>Yêu cầu rời khỏi nhóm</Text>
        {pendingLeave ? <View style={[ui.inset, { backgroundColor: colors.warning50, borderColor: colors.warningBorder }]}><Text style={ui.strong}>⏳ Đang chờ xử lý đơn xin rời nhóm</Text><Text style={ui.text}>Lý do đã gửi: {pendingLeave.reason}</Text><Button title="Thu hồi đơn xin rời nhóm" secondary busy={action.busy} onPress={() => action.run(() => groupService.withdrawLeave(pendingLeave.id))} /></View> : <>
          <Text style={ui.text}>{f.isLeader ? 'Yêu cầu rời nhóm được xử lý theo trạng thái nhóm. Khi được rời nhóm, quyền Trưởng nhóm được chuyển giao theo quy định của hệ thống.' : 'Nếu bạn có nhu cầu rời khỏi nhóm, vui lòng điền lý do chi tiết và gửi yêu cầu.'}</Text>
          {!confirmingLeave ? <Button title={f.isLeader ? 'Gửi đơn rời nhóm' : 'Gửi đơn xin rời nhóm'} tone="danger" secondary disabled={!canLeave || !leaves.isSuccess} onPress={() => setConfirmingLeave(true)} /> : <View style={[ui.inset, { backgroundColor: colors.error50, borderColor: colors.errorBorder }]}>
            <Field label="Nhập lý do xin rời nhóm *" value={reason} onChangeText={setReason} multiline maxLength={1000} placeholder="Nhập lý do chi tiết..." />
            <Button title="Gửi yêu cầu" tone="danger" disabled={!canLeave || !reason.trim()} busy={action.busy} onPress={() => action.run(async () => { await groupService.leave(f.group!.id, reason.trim()); setReason(''); setConfirmingLeave(false); })} />
            <Button title="Hủy" secondary disabled={action.busy} onPress={() => setConfirmingLeave(false)} />
          </View>}
          {!canLeave && <Text style={ui.notice}>{f.isLeader && f.group.locked && f.canAct ? 'Mở khóa nhóm hoặc chuyển vai trò Trưởng nhóm trước khi rời.' : 'Hiện chưa thể gửi yêu cầu rời nhóm trong phạm vi này.'}</Text>}
        </>}
      </Card>
    </> : <Empty text="Bạn chưa có nhóm trong môn học đã chọn. Các yêu cầu cũ vẫn có thể xem bên dưới." />}
    <Text style={ui.heading}>Yêu cầu rời nhóm</Text>
    {leaves.isPending && <Empty text="Đang tải yêu cầu..." />}
    {leaves.error && <ErrorState error={leaves.error} retry={() => void leaves.refetch()} />}
    {leaves.data?.length === 0 && <Empty text="Chưa có yêu cầu rời nhóm." />}
    {leaves.data?.map(request => <LeaveCard key={request.id} request={request} action={action} />)}
  </>;
}
function LeaveCard({ request: r, action }: { request: LeaveRequest; action: ReturnType<typeof useAction> }) {
  const f = useFormation();
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const own = r.userId === user?.id;
  return <Card><Badge tone={r.status.startsWith('PENDING') ? 'warning' : r.status === 'APPROVED' ? 'success' : 'neutral'}>{STATUS_LABELS[r.status]}</Badge><Text style={ui.heading}>{r.fullName} · {r.groupName}</Text>
    <Text style={ui.text}>{formatDate(r.createdAt)}</Text><Text style={ui.text}>Lý do: {r.reason || 'Không có'}</Text>
    {!!r.leaderNote && <Text style={ui.text}>Trưởng nhóm: {r.leaderNote}</Text>}{!!r.decisionNote && <Text style={ui.text}>Kết quả: {r.decisionNote}</Text>}
    {f.canParticipate && f.subject?.phase !== 'FINALIZED' && r.groupId === f.group?.id && <>
      {(f.isLeader && !own && r.groupId === f.group?.id && r.status === 'PENDING_LEADER') && <>
        <Field label="Ghi chú quyết định" value={note} onChangeText={setNote} maxLength={1000} multiline />
        <Button title="Duyệt rời nhóm" disabled={!f.canAct} busy={action.busy} onPress={() => action.run(() => groupService.decideLeave(r.id, true, note.trim()))} />
        <Button title="Từ chối" disabled={!f.canAct} secondary busy={action.busy} onPress={() => action.run(() => groupService.decideLeave(r.id, false, note.trim()))} />
      </>}
      {own && ['PENDING_LEADER', 'PENDING_MODERATOR'].includes(r.status) && <Button title="Thu hồi yêu cầu" secondary busy={action.busy} onPress={() => action.run(() => groupService.withdrawLeave(r.id))} />}
      {own && r.status === 'REJECTED' && <>
        <Field label="Nội dung khiếu nại" value={note} onChangeText={setNote} maxLength={1000} multiline />
        <Button title="Gửi điều phối viên" busy={action.busy} onPress={() => action.run(() => groupService.complain(r.id, note.trim()))} />
      </>}
    </>}
  </Card>;
}
