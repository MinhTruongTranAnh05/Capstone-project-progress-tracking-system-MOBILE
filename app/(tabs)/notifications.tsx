import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '@/services/notificationService';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { Notification } from '@/types/models';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [notifsRes, countRes] = await Promise.all([
        notificationService.getNotifications({ size: 50 }).catch(() => []),
        notificationService.getUnreadCount().catch(() => ({ unread: 0 })),
      ]);

      const list = notifsRes?.content || notifsRes || [];
      setNotifications(list);
      setUnreadCount(countRes?.unread || list.filter((n: any) => !n.read).length || 0);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // fallback
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc!');
    } catch {
      Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc.');
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'MEETING':
        return { name: 'calendar' as const, color: colors.warning };
      case 'EVALUATION':
        return { name: 'ribbon' as const, color: colors.success };
      case 'PROGRESS':
        return { name: 'trending-up' as const, color: colors.blue };
      case 'DOCUMENT':
        return { name: 'folder' as const, color: colors.purple };
      case 'ROSTER':
        return { name: 'people' as const, color: colors.primary };
      default:
        return { name: 'notifications' as const, color: colors.primary };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Vừa xong';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTopRow}>
          <View style={styles.bannerTitleGroup}>
            <View style={styles.titleRow}>
              <Text style={styles.bannerTitle}>Trung tâm Thông báo</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} chưa đọc</Text>
                </View>
              )}
            </View>
            <Text style={styles.bannerDesc}>
              Cập nhật tin tức, lịch hẹn và đánh giá từ GVHD và hệ thống.
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity style={styles.readAllBtn} onPress={handleMarkAllRead}>
              <Ionicons name="checkmark-done" size={15} color={colors.primary} />
              <Text style={styles.readAllBtnText}>Đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => {
            const iconConfig = getTypeIcon(item.type);

            return (
              <View style={[styles.card, !item.read && styles.cardUnread]}>
                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                  <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
                      {item.message || 'Thông báo hệ thống'}
                    </Text>
                    {!item.read && <View style={styles.dot} />}
                  </View>

                  {item.details ? (
                    <Text style={styles.cardDetails} numberOfLines={2}>
                      {item.details}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                    {!item.read && (
                      <TouchableOpacity
                        style={styles.markReadBtn}
                        onPress={() => handleMarkAsRead(item.id)}
                      >
                        <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>Không có thông báo nào</Text>
              <Text style={styles.emptySubtitle}>
                Các cập nhật mới từ hệ thống sẽ xuất hiện tại đây.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  banner: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  bannerTitleGroup: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  unreadBadge: {
    backgroundColor: colors.error50,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.error,
  },
  bannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary100,
  },
  readAllBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnread: {
    borderLeftWidth: 3.5,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surface,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  cardTitleUnread: {
    fontWeight: '800',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  cardDetails: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  markReadBtn: {
    paddingVertical: 2,
  },
  markReadText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
