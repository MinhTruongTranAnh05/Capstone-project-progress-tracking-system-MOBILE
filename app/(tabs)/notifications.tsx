import { useState } from 'react';
import { Text, View } from 'react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Badge, Button, Card, Empty, ErrorState, FormationPage, SectionHeading, ui, useAction } from '@/components/FormationUI';
import { colors } from '@/constants/colors';
import { notificationService } from '@/services/notificationService';
import { formatDate } from '@/constants/formation';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(false);
  const action = useAction();
  const count = useQuery({ queryKey: ['formation', user?.id, 'unread'], queryFn: () => notificationService.getUnreadCount(), enabled: !!user });
  const query = useInfiniteQuery({ queryKey: ['formation', user?.id, 'notifications', unread], initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => notificationService.getNotifications({ page: pageParam, size: 20, unreadOnly: unread }, signal),
    getNextPageParam: page => page.last ? undefined : page.number + 1, enabled: !!user });
  const items = query.data?.pages.flatMap(page => page.content) ?? [];
  return <FormationPage requiresFormation={false} title="Trung tâm thông báo">
    {action.feedback}
    <Card><SectionHeading title="Trung tâm Thông báo" subtitle="Cập nhật thông tin ghép nhóm và các yêu cầu mới nhất từ hệ thống." />{!!count.data?.unread && <Badge tone="danger">{count.data.unread} chưa đọc</Badge>}
      <Button title="✓ Đọc tất cả" secondary busy={action.busy} onPress={() => action.run(() => notificationService.markAllAsRead())} />
      <Button title={unread ? 'Xem tất cả' : 'Chỉ xem chưa đọc'} secondary onPress={() => setUnread(value => !value)} />
    </Card>
    {query.isPending && <Empty text="Đang tải thông báo..." />}
    {query.error && <ErrorState error={query.error} retry={() => void query.refetch()} />}
    {query.isSuccess && items.length === 0 && <Empty text="Chưa có thông báo phù hợp." />}
    {!!items.length && <Card>{items.map(item => <View key={item.id} style={[ui.inset, { borderWidth: 0, backgroundColor: item.read ? 'white' : colors.primary50, opacity: item.read ? 0.65 : 1 }]}><View style={ui.row}><Text style={ui.heading}>🔔 Thông báo hệ thống</Text>{!item.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />}</View><Text style={ui.text}>{item.message}</Text>
      {!!item.details && <Text style={ui.text}>{item.details}</Text>}<Text style={[ui.text, { fontSize: 10 }]}>{formatDate(item.createdAt)}</Text>
      {!item.read && <Button title="Đã đọc" busy={action.busy} onPress={() => action.run(() => notificationService.markAsRead(item.id))} />}
    </View>)}</Card>}
    {query.hasNextPage && <Button title="Tải thêm" secondary busy={query.isFetchingNextPage} onPress={() => void query.fetchNextPage()} />}
  </FormationPage>;
}
