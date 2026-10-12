import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup, useGroups } from '@/hooks';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function GroupsIndexScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const isLeader = user?.role === 'GROUP_LEADER';

  // Lấy thông tin nhóm của user hiện tại
  const { data: myGroups, isLoading, refetch, isRefetching } = useGroups({
    memberId: user?.id,
  });

  const groups = myGroups?.content || myGroups || [];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Chưa có nhóm
  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>Chưa tham gia nhóm nào</Text>
          <Text style={styles.emptyDesc}>
            Tạo nhóm mới hoặc tìm nhóm để tham gia
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(groups)/create')}
            >
              <Text style={styles.primaryButtonText}>+ Tạo nhóm mới</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(groups)/join')}
            >
              <Text style={styles.secondaryButtonText}>Tìm nhóm tham gia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const renderGroup = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(groups)/group/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.groupCode}>
          <Text style={styles.groupCodeText}>{item.groupCode}</Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === 'ACTIVE' ? colors.successLight :
                          item.status === 'FORMED' ? colors.warningLight : colors.background,
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === 'ACTIVE' ? colors.success :
                   item.status === 'FORMED' ? colors.warning : colors.textSecondary,
          }]}>
            {item.status === 'ACTIVE' ? 'Hoạt động' :
             item.status === 'FORMED' ? 'Đã tạo' : item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.topic}>{item.topicTitle || 'Chưa chọn đề tài'}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.memberCount}>
          <Text style={styles.memberIcon}>👥</Text>
          <Text style={styles.memberText}>{item.memberCount || 0} thành viên</Text>
        </View>
        {item.supervisorName && (
          <View style={styles.supervisor}>
            <Text style={styles.supervisorIcon}>👨‍🏫</Text>
            <Text style={styles.supervisorText}>{item.supervisorName}</Text>
          </View>
        )}
      </View>

      {isLeader && (
        <View style={styles.leaderBadge}>
          <Text style={styles.leaderText}>Bạn là trưởng nhóm</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLeader && (
        <TouchableOpacity
          style={styles.createBanner}
          onPress={() => router.push('/(groups)/create')}
        >
          <Text style={styles.createBannerText}>+ Tạo nhóm mới</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyActions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  createBanner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    alignItems: 'center',
  },
  createBannerText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
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
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  groupCode: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  groupCodeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
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
  topic: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  memberText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  supervisor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supervisorIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  supervisorText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  leaderBadge: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  leaderText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
