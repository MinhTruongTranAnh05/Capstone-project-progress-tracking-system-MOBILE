import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useFormation } from '@/contexts/FormationContext';
import { Badge, Button, Card, ConfirmButton, Field, ProfileDetails, ui, useAction } from './FormationUI';
import { groupService } from '@/services/groupService';
import { canInvite, formatDate, isPending, STATUS_LABELS } from '@/constants/formation';
import type { JoinRequest } from '@/types/models';

export function RequestCard({ request: r, action, inset = false }: { request: JoinRequest; action: ReturnType<typeof useAction>; inset?: boolean }) {
  const f = useFormation();
  const { user } = useAuth();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const own = r.student.userId === user?.id;
  const pending = isPending(r);
  const canAnswer = f.canAct && pending && (r.type === 'APPLY' ? f.isLeader : own);
  const canWithdraw = f.canAct && pending && (r.type === 'APPLY' ? own : f.isLeader);
  const body = <>
    <View style={ui.row}><Badge tone={pending ? 'warning' : r.status === 'ACCEPTED' ? 'success' : 'neutral'}>{r.type === 'APPLY' ? 'Đơn Apply' : 'Lời mời'} · {STATUS_LABELS[r.status] ?? r.status}{r.status === 'PENDING' && !pending ? ' · Hết hạn' : ''}</Badge></View>
    {!f.group && <Text style={ui.heading}>{r.groupName} · {r.groupCode}</Text>}
    <ProfileDetails profile={r.student} />
    <Text style={[ui.text, { fontSize: 11 }]}>Thời gian gửi: {formatDate(r.createdAt)}</Text>
    {!!r.message && <View style={[ui.inset, { backgroundColor: 'white', padding: 12 }]}><Text style={ui.text}><Text style={ui.strong}>Hồ sơ năng lực / Lời nhắn: </Text>{r.message}</Text></View>}
    <Text style={[ui.text, { fontSize: 11 }]}>Hạn phản hồi: {formatDate(r.expiresAt)}</Text>
    {!!r.rejectReason && <Text style={ui.notice}>Lý do từ chối: {r.rejectReason}</Text>}
    {canAnswer && <>
      <ConfirmButton title={r.type === 'APPLY' ? 'Duyệt' : 'Chấp nhận lời mời'} tone="success" secondary={false} message={r.type === 'APPLY' ? 'Duyệt đơn và thêm sinh viên này vào nhóm?' : `Chấp nhận lời mời tham gia nhóm ${r.groupCode}?`} disabled={r.type === 'APPLY' && !canInvite(f.group)} busy={action.busy} onConfirm={() => action.run(() => groupService.answer(r.id, 'accept'))} />
      {!rejecting ? <Button title="Từ chối" secondary tone="danger" disabled={action.busy} onPress={() => setRejecting(true)} /> : <View style={{ gap: 10 }}><Field label="Lý do từ chối *" value={reason} onChangeText={setReason} maxLength={1000} multiline /><Button title="Xác nhận từ chối" tone="danger" disabled={!reason.trim()} busy={action.busy} onPress={() => action.run(async () => { await groupService.answer(r.id, 'reject', reason.trim()); setRejecting(false); })} /><Button title="Hủy" secondary onPress={() => setRejecting(false)} /></View>}
    </>}
    {canWithdraw && <ConfirmButton title={r.type === 'INVITE' ? 'Thu hồi lời mời' : 'Rút đơn Apply'} tone="danger" message="Bạn có chắc chắn muốn thu hồi yêu cầu này không?" busy={action.busy} onConfirm={() => action.run(() => groupService.answer(r.id, 'withdraw'))} />}
    {f.group && r.type === 'APPLY' && <Button title={`${r.likedByMe ? '♥ Bỏ Like' : '♡ Like ứng viên'} (${r.likes ?? 0})`} secondary disabled={!f.canAct || !pending} busy={action.busy} onPress={() => action.run(() => groupService.like(r.id, !r.likedByMe))} />}
    {pending && f.group && !f.isLeader && <Text style={[ui.text, { fontSize: 11 }]}>Chờ Nhóm Trưởng xử lý</Text>}
  </>;
  return inset ? <View style={[ui.inset, { gap: 12 }]}>{body}</View> : <Card>{body}</Card>;
}
