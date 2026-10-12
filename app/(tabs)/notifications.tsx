import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { Notification } from '@/types/models';

export default function NotificationsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications({ size: 50 }),
  });

  const notifications: Notification[] = data?.content || data || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return '📅';
      case 'EVALUATION': return '📝';
      case 'PROGRESS': return '📈';
      case 'DOCUMENT': return '📂';
      case 'ROSTER': return '👥';
      default: return '🔔';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.card, !item.read && styles.cardUnread]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getTypeIcon(item.type)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.message, !item.read && styles.messageUnread]}>
          {item.message}
        </Text>
        {item.details && (
          <Text style={styles.details} numberOfLines={2}>
            {item.details}
          </Text>
        )}
        <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <Text>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>Không có thông báo nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  iconContainer: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 22 },
  content: { flex: 1 },
  message: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  messageUnread: { fontWeight: '700' },
  details: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  time: { fontSize: 12, color: colors.textSecondary },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary, marginLeft: spacing.sm,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: spacing['3xl'] * 2,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});
