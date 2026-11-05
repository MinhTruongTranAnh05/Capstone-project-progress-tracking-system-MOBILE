import { Text, View } from 'react-native';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, SectionHeading, ui } from '@/core/ui/primitives';
import { colors } from '@/constants/colors';
import { getErrorMessage } from '@/services/apiError';
import { staffApi } from '../data/staffApi';
import { exportReport } from '../data/reportExport';
import { useStaff } from './StaffContext';
import { LoadState, Stat, useStaffAction } from './controls';

export function MonitoringPanel() {
  const f = useStaff();
  const action = useStaffAction();
  const stats = useQuery({ queryKey: [...f.key, 'statistics', f.semester], queryFn: ({ signal }) => staffApi.statistics(f.semester, undefined, signal), enabled: !!f.semester });
  const accounts = useQuery({ queryKey: [...f.key, 'users', 'count'], queryFn: ({ signal }) => staffApi.users({ size: 1 }, signal) });
  const roleCounts = useQueries({ queries: (['STUDENT', 'LECTURER', 'ADMIN'] as const).map(role => ({ queryKey: [...f.key, 'users', 'count', role], queryFn: ({ signal }: { signal: AbortSignal }) => staffApi.users({ role, size: 1 }, signal) })) });
  const exportCheck = useQuery({ queryKey: [...f.key, 'exportCheck', f.semester], queryFn: () => staffApi.exportCheck(f.semester), enabled: false });
  return <>{action.feedback}
    <Card><SectionHeading eyebrow="Giám sát hệ thống" title="Tổng quan hệ thống" subtitle="Theo dõi tài khoản, tiến độ ghép nhóm và điều kiện sinh viên theo học kỳ." /></Card>
    <LoadState pending={accounts.isPending} error={accounts.error} retry={() => void accounts.refetch()}>{accounts.data && <View style={ui.row}><Stat label="Tổng tài khoản" value={accounts.data.totalElements} /></View>}</LoadState>
    <Card><SectionHeading title="Giảng viên hướng dẫn và quản lý nhóm theo học kỳ" />{!f.semesters.length && <Empty text="Chưa có dữ liệu học kỳ." />}{f.semesters.map(semester => <View key={semester.code} style={ui.inset}><Text style={ui.strong}>{semester.code} — {semester.name}</Text><Text style={ui.text}>{semester.groupCount} nhóm</Text><Text style={ui.text}>{semester.moderator ? `${semester.moderator.fullName} · ${semester.moderator.email}` : 'Chưa phân công giảng viên'}</Text></View>)}</Card>
    <Card><SectionHeading title="Tỷ lệ phân bổ vai trò tài khoản hệ thống" />{roleCounts.map((query, index) => <LoadState key={index} pending={query.isPending} error={query.error} retry={() => void query.refetch()}>{query.data && <Distribution label={['Sinh viên', 'Giảng viên', 'Quản trị viên'][index]} count={query.data.totalElements} total={accounts.data?.totalElements} />}</LoadState>)}</Card>
    {!f.semester ? <Empty text="Chưa có học kỳ. Tạo học kỳ tại mục Quản lý học kỳ." /> : <LoadState pending={stats.isPending} error={stats.error} retry={() => void stats.refetch()}>
      {stats.data && <><View style={ui.row}>
        {([
          ['Tổng số nhóm đồ án', stats.data.total.totalGroups], ['Sinh viên', stats.data.total.totalStudents], ['Đã có nhóm', stats.data.total.withGroup], ['Chưa có nhóm', stats.data.total.withoutGroup],
          ['Chưa đủ điều kiện', stats.data.total.ineligible], ['Nhóm dưới 3 thành viên', stats.data.total.groupsUnderMinimum], ['Nhóm đã khóa', stats.data.total.lockedGroups], ['Nhóm đã chốt', stats.data.total.finalizedGroups],
        ] as const).map(([label, value]) => <Stat key={label} label={label} value={value} />)}
      </View><Card><SectionHeading title="Thống kê sĩ số nhóm đồ án (3 - 5 người)" /><Distribution label="Nhóm đạt chuẩn sĩ số (3 - 5 người)" count={[3, 4, 5].reduce((sum, size) => sum + (stats.data!.total.groupsBySize?.[size] ?? 0), 0)} total={stats.data.total.totalGroups} /><Distribution label="Nhóm chưa đạt chuẩn (< 3 hoặc > 5)" count={stats.data.total.totalGroups - [3, 4, 5].reduce((sum, size) => sum + (stats.data!.total.groupsBySize?.[size] ?? 0), 0)} total={stats.data.total.totalGroups} />{Object.entries(stats.data.total.groupsBySize ?? {}).map(([size, count]) => <Distribution key={size} label={`${size} thành viên`} count={count} total={stats.data!.total.totalGroups} />)}</Card>
      <Card><SectionHeading title="Thống kê theo ngành & môn học" />{stats.data.scopes.map(scope => <View key={scope.scopeId} style={ui.inset}><Text style={ui.strong}>{scope.subjectCode} · {scope.majorName}</Text><Text style={ui.text}>{scope.counts.totalStudents} sinh viên · {scope.counts.totalGroups} nhóm · {scope.counts.withoutGroup} chưa có nhóm</Text><Text style={ui.text}>{scope.phase}</Text></View>)}</Card></>}
    </LoadState>}
    <Card><SectionHeading title="Xuất Excel Báo cáo" /><Button title="Kiểm tra trước khi xuất" secondary disabled={!f.semester} busy={exportCheck.isFetching} onPress={() => void exportCheck.refetch()} />
      {exportCheck.error && <Text style={ui.error}>{getErrorMessage(exportCheck.error)}</Text>}{exportCheck.data?.warnings.map((warning, i) => <Text key={i} style={ui.notice}>{warning}</Text>)}
      <Button title="Tải báo cáo Excel" disabled={!f.semester} busy={action.busy} onPress={() => action.run(() => exportReport(f.semester))} />
    </Card>
  </>;
}
function Distribution({ label, count, total }: { label: string; count: number; total?: number }) {
  const percent = total === undefined ? undefined : total > 0 ? Math.min(100, Math.round(count / total * 100)) : 0;
  return <View style={{ gap: 6 }}><View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={ui.text}>{label}</Text><Text style={ui.strong}>{count}{percent === undefined ? '' : ` (${percent}%)`}</Text></View>{percent !== undefined && <View style={{ height: 10, backgroundColor: colors.primary50, borderRadius: 5 }}><View style={{ width: `${percent}%`, height: 10, backgroundColor: colors.primary, borderRadius: 5 }} /></View>}</View>;
}
