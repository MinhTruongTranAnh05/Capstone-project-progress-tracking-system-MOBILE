import { useState } from 'react';
import { Text } from 'react-native';
import { useFormation } from '@/contexts/FormationContext';
import { Button, Card, Field, ui, useAction } from './FormationUI';
import { groupService } from '@/services/groupService';
import { canInvite } from '@/constants/formation';

export function GroupInvitationForm() {
  const f = useFormation();
  const action = useAction();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  return <Card><Text style={ui.eyebrow}>Mời thành viên vào nhóm bằng MSSV</Text>
    {action.feedback}
    <Field label="Mã số sinh viên" placeholder={f.isLeader ? 'Vui lòng nhập MSSV' : 'Chỉ Trưởng nhóm mới được phép mời thành viên'} value={code} onChangeText={setCode} autoCapitalize="characters" editable={f.isLeader && !action.busy} />
    <Field label="Lời nhắn (tùy chọn)" value={message} onChangeText={setMessage} maxLength={1000} multiline editable={f.isLeader && !action.busy} />
    <Button title="Gửi lời mời" disabled={!f.isLeader || !f.canAct || !canInvite(f.group) || !code.trim()} busy={action.busy} onPress={() => action.run(async () => { await groupService.invite(f.group!.id, code.trim().toUpperCase(), message.trim()); setCode(''); setMessage(''); })} />
    <Text style={[ui.text, { fontSize: 11, fontStyle: 'italic' }]}>* Chỉ Nhóm Trưởng mới có quyền mời. Sinh viên chỉ được tính vào sĩ số sau khi chấp nhận lời mời; hệ thống kiểm tra lại sức chứa khi chấp nhận.</Text>
    {f.group && !canInvite(f.group) && <Text style={ui.notice}>Nhóm đã đủ 5 thành viên hoặc đã chốt. Không thể mời thêm.</Text>}
  </Card>;
}
