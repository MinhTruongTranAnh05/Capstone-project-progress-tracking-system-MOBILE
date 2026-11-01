import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
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
  return <FormationPage title="Quản lý trạng thái & Rời nhóm">{f.subject ? <ManagementBody key={f.subject.scopeId} /> : <Empty text="Chưa có môn học." />}</FormationPage>;
}
function ManagementBody() {
  const f = useFormation();
  const { user } = useAuth();
  const action = useAction();
  const [name, setName] = useState(f.group?.name ?? '');
  const [skills, setSkills] = useState(f.group?.wantedSkills ?? '');
  const [reason, setReason] = useState('');
  const [leaveAfter, setLeaveAfter] = useState(false);
  useEffect(() => { setName(f.group?.name ?? ''); setSkills(f.group?.wantedSkills ?? ''); }, [f.group?.id, f.group?.name, f.group?.wantedSkills]);
  const leaves = useQuery({ queryKey: [...f.key, 'leaves', f.group?.id ?? 'mine'], queryFn: ({ signal }) => f.group ? groupService.groupLeaves(f.group.id, signal) : groupService.myLeaves(signal) });
  const transfers = useQuery({ queryKey: [...f.key, 'transfers'], queryFn: ({ signal }) => groupService.transfers(signal) });
  const canLeave = f.canParticipate && !f.group?.finalized && (f.subject?.phase === 'OPEN' || f.subject?.phase === 'LOCKED')
    && !(f.isLeader && f.group?.locked && f.canAct);
  const canTransfer = f.canParticipate && f.subject?.phase !== 'PREPARING';
  return <>{action.feedback}
    {f.group ? <>
      <Card><Text style={ui.eyebrow}>Thông tin tổng quan trạng thái nhóm</Text><View style={ui.inset}><Text style={ui.heading}>Mã nhóm: {f.group.code}</Text><Text style={ui.text}>Sĩ số hiện tại: <Text style={[ui.strong, { color: colors.primary }]}>{f.group.size}/5 thành viên</Text></Text><Text style={ui.text}>Vai trò của bạn: <Text style={ui.strong}>{f.isLeader ? '👑 Trưởng nhóm (Leader)' : '👤 Thành viên (Member)'}</Text></Text></View></Card>
      {f.isLeader && <Card><Text style={ui.eyebrow}>Quản lý trạng thái khóa nhóm</Text><Text style={ui.text}>Trạng thái hiện tại:</Text><Badge tone={f.group.locked ? 'danger' : 'success'}>{f.group.locked ? '🔒 Đang khóa (Không nhận đơn mới)' : '🔓 Đang mở (Cho phép nhận đơn)'}</Badge>
        <ConfirmButton title={f.group.locked ? 'Mở khóa nhóm (Unlock)' : 'Khóa nhóm (Lock)'} tone={f.group.locked ? 'success' : 'danger'} secondary={false} message={f.group.locked ? 'Mở lại nhóm để nhận đơn Apply mới?' : 'Khóa nhóm sẽ ngừng nhận đơn Apply mới. Bạn có muốn tiếp tục?'} disabled={!f.canAct || f.group.finalized} busy={action.busy} onConfirm={() => action.run(() => groupService.lock(f.group!.id, !f.group!.locked))} />
        <Text style={ui.text}>Khóa nhóm ngừng nhận đơn Apply. Đủ 5 thành viên hoặc hết hạn vẫn do hệ thống kiểm tra.</Text>
      </Card>}
      <Card><Text style={[ui.eyebrow, { color: colors.error }]}>Yêu cầu rời khỏi nhóm</Text><Text style={ui.text}>{f.isLeader ? 'Khi được phép rời ngay, hệ thống tự động chuyển giao quyền Leader cho thành viên tiếp theo để nhóm không bị gián đoạn.' : 'Nếu bạn muốn rời khỏi nhóm, hãy điền lý do và gửi yêu cầu.'}</Text><Text style={ui.text}>Nếu cần duyệt, hệ thống chuyển yêu cầu tới Trưởng nhóm hoặc Điều phối viên. Trưởng nhóm của nhóm đang khóa cần chuyển vai trò hoặc mở khóa trước.</Text>
        <Field label="Lý do rời nhóm (tùy chọn)" value={reason} onChangeText={setReason} multiline maxLength={1000} placeholder="Nhập lý do bạn muốn rời nhóm..." />
        <ConfirmButton title="Yêu cầu rời khỏi nhóm" tone="danger" message="Bạn có chắc muốn rời nhóm? Hệ thống sẽ áp dụng quy trình phù hợp với trạng thái nhóm." disabled={!canLeave} busy={action.busy}
          onConfirm={() => action.run(() => groupService.leave(f.group!.id, reason.trim()))} />
      </Card>
      {f.isLeader && <Card><Text style={ui.eyebrow}>Thông tin nhóm</Text><Field label="Tên nhóm *" value={name} onChangeText={setName} maxLength={100} />
        <Field label="Kỹ năng đang tìm" value={skills} onChangeText={setSkills} maxLength={500} multiline />
        <Button title="Lưu thông tin nhóm" disabled={!f.canParticipate || !name.trim() || f.group.finalized} busy={action.busy} onPress={() => action.run(() => groupService.updateGroup(f.group!.id, { name: name.trim(), wantedSkills: skills.trim() }))} />
      </Card>}
      {f.isLeader && <Card><Text style={ui.heading}>Quản lý thành viên</Text>{f.group.members.filter(m => !m.leader).map(m => <View key={m.userId} style={{ gap: 8 }}>
        <Text style={ui.strong}>{m.fullName} · {m.studentCode}</Text>
        <ConfirmButton title="Mời ra khỏi nhóm" message={`Xóa ${m.fullName} khỏi nhóm?`} disabled={!f.canAct || f.group?.finalized} busy={action.busy} onConfirm={() => action.run(() => groupService.kick(f.group!.id, m.userId))} />
      </View>)}</Card>}
      {f.isLeader && <Card><Text style={ui.heading}>Chuyển trưởng nhóm</Text><Text style={ui.text}>Thành viên nhận đề nghị phải chấp nhận. Khi đã chốt danh sách, chỉ chuyển vai trò, không tự rời nhóm.</Text>
        <View style={ui.row}><Switch value={leaveAfter} onValueChange={setLeaveAfter} disabled={!f.canAct} accessibilityLabel="Rời nhóm sau khi chuyển trưởng nhóm" /><Text style={ui.text}>Chuyển vai trò và rời nhóm</Text></View>
        {f.group.members.filter(m => !m.leader).map(m => <Button key={m.userId} title={`Đề nghị ${m.fullName} làm trưởng nhóm`} secondary disabled={!canTransfer || (leaveAfter && !f.canAct)} busy={action.busy}
          onPress={() => action.run(() => groupService.offerTransfer(f.group!.id, m.userId, leaveAfter))} />)}
      </Card>}
    </> : <Empty text="Bạn chưa có nhóm trong môn học đã chọn. Các yêu cầu cũ vẫn có thể xem bên dưới." />}
    <Card><Text style={ui.heading}>Đề nghị chuyển trưởng nhóm</Text>
      {transfers.isPending && <Text style={ui.text}>Đang tải...</Text>}
      {transfers.error && <ErrorState error={transfers.error} retry={() => void transfers.refetch()} />}
      {transfers.data?.filter(t => t.groupId === (f.group?.id ?? '')).map(t => <View key={t.id} style={{ gap: 8 }}>
        <Text style={ui.strong}>{t.fromName} → {t.toName}</Text><Text style={ui.text}>{STATUS_LABELS[t.status]}{t.leaveAfter ? ' · Chuyển vai trò và rời nhóm' : ''}</Text>
        {t.status === 'PENDING' && <>{t.toUserId === user?.id && <>
          <Button title="Chấp nhận vai trò" disabled={!canTransfer || (t.leaveAfter && !f.canAct)} busy={action.busy} onPress={() => action.run(() => groupService.answerTransfer(t.id, 'accept'))} />
          <Button title="Từ chối vai trò" disabled={!canTransfer} secondary busy={action.busy} onPress={() => action.run(() => groupService.answerTransfer(t.id, 'decline'))} />
        </>}{t.fromUserId === user?.id && <Button title="Hủy đề nghị" disabled={!canTransfer} secondary busy={action.busy} onPress={() => action.run(() => groupService.answerTransfer(t.id, 'cancel'))} />}</>}
      </View>)}
      {transfers.isSuccess && !transfers.data.some(t => t.groupId === f.group?.id) && <Text style={ui.text}>Chưa có đề nghị chuyển vai trò.</Text>}
    </Card>
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
