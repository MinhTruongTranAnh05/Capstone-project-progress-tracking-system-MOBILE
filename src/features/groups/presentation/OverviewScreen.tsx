import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useFormation } from '@/contexts/FormationContext';
import { Avatar, Badge, Button, Card, Empty, ErrorState, FormationPage, InfoTile, SectionHeading, TileGrid, ui } from '@/components/FormationUI';
import { CreateGroupContent } from './CreateGroupContent';
import { MembersBody } from './MembersScreen';
import { GroupWorkspaceTabs } from './GroupWorkspaceTabs';
import { PHASE_LABELS } from '../domain/rules';
import { getGroupOverviewCounts } from '../domain/overview';
import type { StudentGroup } from '../domain/models';
import { groupApi } from '../data/groupApi';
import { MAX_GROUP_MEMBERS, isValidGroupSize } from '@/constants/group';
import { colors } from '@/constants/colors';

export default function OverviewScreen() {
  const f = useFormation();
  const { mode: requestedMode } = useLocalSearchParams<{ mode?: string }>();
  const mode = requestedMode === 'find' ? 'find' : 'create';
  return <FormationPage title={f.group ? 'Tổng quan nhóm' : mode === 'find' ? 'Tìm nhóm đang tuyển' : 'Tạo nhóm mới'}>
    {!f.subject ? <Empty text="Bạn chưa có học kỳ/môn học trong danh sách. Vui lòng liên hệ quản trị viên để kiểm tra dữ liệu import." />
      : f.group ? <GroupOverview group={f.group} /> : <>
        <GroupWorkspaceTabs mode={mode} />
        {mode === 'create' ? <CreateGroupContent /> : <MembersBody key={f.subject.scopeId} />}
      </>}
  </FormationPage>;
}

function GroupOverview({ group }: { group: StudentGroup }) {
  const f = useFormation();
  const router = useRouter();
  const requests = useQuery({ queryKey: [...f.key, 'groupRequests', group.id], queryFn: ({ signal }) => groupApi.requests(group.id, signal) });
  const leaves = useQuery({ queryKey: [...f.key, 'leaves', group.id], queryFn: ({ signal }) => groupApi.groupLeaves(group.id, signal) });
  const counts = getGroupOverviewCounts(group.id, requests.data ?? [], leaves.data ?? []);
  const valid = isValidGroupSize(group.size);
  const sizeLabel = group.size === MAX_GROUP_MEMBERS ? 'Đạt chuẩn' : valid ? 'Đủ sĩ số, nhóm đang hoạt động' : 'Sĩ số chưa đạt chuẩn (Cần 3-5 người)';
  return <>
    {group.locked && <Card style={{ backgroundColor: colors.error50, borderColor: colors.errorBorder }}>
      <Text style={[ui.strong, { color: colors.errorDark }]}>🔒 Nhóm đã được Trưởng nhóm khóa lại!</Text>
      <Text style={ui.text}>Hệ thống hiện đang tạm ngưng nhận đơn ứng tuyển mới từ các sinh viên khác.</Text><Badge tone="danger">ĐÃ KHÓA</Badge>
    </Card>}
    <Card>
      <SectionHeading title={group.code} subtitle={group.name} />
      <View style={ui.row}><Badge>Học kỳ: {f.semester?.semesterName ?? group.semesterCode}</Badge><Badge tone="neutral">Ngành: {f.semester?.majorName ?? group.majorName}</Badge><Badge tone={f.isLeader ? 'success' : 'neutral'}>Bạn là {f.isLeader ? 'Trưởng nhóm' : 'Thành viên'}</Badge></View>
      <Badge tone={valid ? 'success' : 'warning'}>{sizeLabel}</Badge>
      <TileGrid basis={140}>
        {group.members.map(member => <View key={member.userId} style={[ui.inset, { alignItems: 'center', borderColor: member.leader ? colors.primary : colors.border }]}>
          <Avatar name={member.fullName} /><Text style={[ui.strong, { textAlign: 'center' }]}>{member.fullName}</Text><Badge tone={member.leader ? 'orange' : 'neutral'}>{member.leader ? 'Trưởng nhóm' : 'Thành viên'}</Badge>
        </View>)}
        {Array.from({ length: Math.max(0, MAX_GROUP_MEMBERS - group.members.length) }, (_, index) => <View key={`vacancy-${index}`} style={[ui.inset, { alignItems: 'center', borderStyle: 'dashed' }]}><Text style={ui.heading}>＋</Text><Text style={ui.text}>Vị trí trống</Text></View>)}
      </TileGrid>
      <Text style={ui.text}><Text style={ui.strong}>{group.size}/{MAX_GROUP_MEMBERS} thành viên.</Text> Nhóm hợp lệ khi có từ 3 đến 5 thành viên chính thức.</Text>
      <TileGrid basis={170}><InfoTile label="Vai trò của bạn" value={f.isLeader ? 'Trưởng nhóm' : 'Thành viên'} /><InfoTile label="Trạng thái hệ thống" value={f.subject ? PHASE_LABELS[f.subject.phase] : undefined} /></TileGrid>
    </Card>
    <TileGrid basis={280}>
      <Card><View style={ui.row}><Text style={[ui.heading, { flex: 1 }]}>Đơn ứng tuyển & Lời mời</Text>{requests.isSuccess && <Badge>{counts.applications}</Badge>}</View>
        <Text style={ui.text}>Quản lý danh sách sinh viên xin gia nhập nhóm. Xét duyệt đơn ứng tuyển hoặc gửi lời mời trực tiếp cho các thành viên tiềm năng.</Text>
        {requests.isPending && <Text style={ui.text}>Đang tải số đơn ứng tuyển...</Text>}
        {requests.error && <ErrorState error={requests.error} retry={() => void requests.refetch()} />}
        <Button title="Xem chi tiết danh sách đơn →" secondary onPress={() => router.push('/(tabs)/requests')} />
      </Card>
      <Card><View style={ui.row}><Text style={[ui.heading, { flex: 1 }]}>Trạng thái nhóm & Rời nhóm</Text>{leaves.isSuccess && <Badge tone="warning">{counts.leaves}</Badge>}</View>
        <Text style={ui.text}>Mỗi sinh viên chỉ thuộc một nhóm chính thức trong cùng môn học. Quản lý việc khóa nhóm hoặc gửi yêu cầu rời nhóm tại đây.</Text>
        <Text style={ui.text}>{f.isLeader ? 'Yêu cầu rời nhóm đang chờ xử lý' : 'Yêu cầu rời nhóm của bạn đang chờ xử lý'}</Text>
        {leaves.isPending && <Text style={ui.text}>Đang tải số yêu cầu rời nhóm...</Text>}
        {leaves.error && <ErrorState error={leaves.error} retry={() => void leaves.refetch()} />}
        <Button title="Quản lý trạng thái nhóm →" secondary onPress={() => router.push('/(tabs)/management')} />
      </Card>
    </TileGrid>
    <Card style={{ backgroundColor: colors.warning50, borderColor: colors.warningBorder }}><Text style={[ui.eyebrow, { color: colors.warningDark }]}>Lưu ý trước khi quản trị viên khóa danh sách nhóm</Text>
      <Text style={ui.text}>• Mỗi sinh viên chỉ thuộc tối đa một nhóm chính thức trong cùng môn học.</Text>
      <Text style={ui.text}>• Trưởng nhóm có quyền xét duyệt đơn ứng tuyển hoặc gửi lời mời trực tiếp cho các thành viên tiềm năng.</Text>
      <Text style={ui.text}>• Hãy đảm bảo duy trì từ 3 đến 5 thành viên chính thức trước thời điểm khóa danh sách của bộ môn.</Text>
    </Card>
  </>;
}
