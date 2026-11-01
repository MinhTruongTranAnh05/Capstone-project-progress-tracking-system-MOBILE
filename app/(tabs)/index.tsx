import { useState } from 'react';
import { Text, View } from 'react-native';
import { useFormation } from '@/contexts/FormationContext';
import { Badge, Button, Card, Empty, FormationPage, InfoTile, TileGrid, ui } from '@/components/FormationUI';
import { CreateGroupContent } from '@/screens/CreateGroupContent';
import { MembersBody } from '@/screens/MembersScreen';
import { PHASE_LABELS } from '@/constants/formation';
import { colors } from '@/constants/colors';

export default function OverviewScreen() {
  const f = useFormation();
  const [mode, setMode] = useState<'create' | 'find'>('create');
  const valid = !!f.group && f.group.size >= 3 && f.group.size <= 5;
  return <FormationPage title="Tổng quan nhóm">
    {!f.subject ? <Empty text="Bạn chưa có học kỳ/môn học trong danh sách. Vui lòng liên hệ quản trị viên để kiểm tra dữ liệu import." />
      : f.group ? <Card>
        <View style={ui.row}><Badge>Học kỳ: {f.semester?.semesterName}</Badge><Badge tone="neutral">Mã nhóm: {f.group.code}</Badge><Badge tone="neutral">{f.semester?.majorName}</Badge></View>
        <Badge tone={valid ? 'success' : 'warning'}>{valid ? '✓ NHÓM ĐẠT SĨ SỐ HỢP LỆ (3–5 NGƯỜI)' : '⚠ SĨ SỐ CHƯA ĐẠT CHUẨN (CẦN 3–5 NGƯỜI)'}</Badge>
        <View style={ui.divider} />
        <Text style={ui.eyebrow}>Thông tin quản lý đầu kỳ</Text>
        <TileGrid basis={170}><InfoTile label="Quy mô nhóm" value={`${f.group.size} / 5 thành viên`} />
        <InfoTile label="Vai trò của bạn" value={f.isLeader ? '👑 Trưởng nhóm' : '👤 Thành viên'} />
        <InfoTile label="Trạng thái hệ thống" value={PHASE_LABELS[f.subject.phase]} /></TileGrid>
        <View style={[ui.inset, { backgroundColor: colors.primary50, borderColor: colors.primary100 }]}><Text style={[ui.strong, { color: colors.primary }]}>Lưu ý quan trọng giai đoạn đầu kỳ:</Text>
          <Text style={ui.text}>• Mỗi sinh viên chỉ thuộc tối đa một nhóm chính thức tại một thời điểm trong cùng môn học.</Text>
          <Text style={ui.text}>• Trưởng nhóm có quyền xét duyệt đơn gửi yêu cầu hoặc gửi lời mời trực tiếp cho các thành viên.</Text>
          <Text style={ui.text}>• Hãy đảm bảo nhóm đạt từ 3 đến 5 thành viên trước thời điểm khóa danh sách của Admin.</Text>
        </View>
      </Card> : <>
        <View style={[ui.card, { flexDirection: 'row', gap: 8, padding: 6, maxWidth: 448, width: '100%', alignSelf: 'center' }]}><View style={{ flex: 1 }}><Button title="🚀 Tạo nhóm mới" secondary={mode !== 'create'} onPress={() => setMode('create')} /></View><View style={{ flex: 1 }}><Button title="🔍 Tìm nhóm" secondary={mode !== 'find'} onPress={() => setMode('find')} /></View></View>
        {mode === 'create' ? <CreateGroupContent /> : <MembersBody key={f.subject.scopeId} />}
      </>}
  </FormationPage>;
}
