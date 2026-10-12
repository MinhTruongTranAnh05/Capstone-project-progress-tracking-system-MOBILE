import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSlots } from '@/hooks';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { Slot } from '@/types/models';

export default function ScheduleScreen() {
  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  const { data, isLoading, refetch, isRefetching } = useSlots(
    isInstructor ? { instructorId: user?.id } : undefined
  );

  const slots = data?.content || data || [];
  const [filter, setFilter] = useState<'all' | 'available' | 'booked'>('all');

  const filteredSlots = slots.filter((slot: Slot) => {
    if (filter === 'available') return slot.status === 'AVAILABLE';
    if (filter === 'booked') return slot.bookedCount > 0;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: '#D1FAE5', color: '#059669' };
      case 'BOOKED':
        return { bg: '#FEF3C7', color: '#D97706' };
      default:
        return { bg: '#E5E7EB', color: '#6B7280' };
    }
  };

  const renderSlot = ({ item }: { item: Slot }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.startTime)}</Text>
            <Text style={styles.timeText}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status === 'AVAILABLE' ? 'Còn trống' : 'Đã đặt'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giảng viên:</Text>
            <Text style={styles.infoValue}>{item.instructorName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời lượng:</Text>
            <Text style={styles.infoValue}>{item.durationMinutes} phút</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hình thức:</Text>
            <Text style={styles.infoValue}>
              {item.locationType === 'ONLINE' ? '📹 Online' :
               item.locationType === 'OFFLINE' ? '🏢 Offline' : '🔄 Hybrid'}
            </Text>
          </View>
          {item.meetingUrl && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Link:</Text>
              <Text style={styles.linkText} numberOfLines={1}>
                {item.meetingUrl}
              </Text>
            </View>
          )}
        </View>

        {!isInstructor && item.status === 'AVAILABLE' && (
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Đặt lịch hẹn</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterContainer}>
        {(['all', 'available', 'booked'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Tất cả' : f === 'available' ? 'Còn trống' : 'Đã đặt'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slot List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSlots}
          renderItem={renderSlot}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Không có lịch hẹn nào</Text>
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
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dateContainer: {},
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {},
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
