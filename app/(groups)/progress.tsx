import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function ProgressScreen() {
  const { user } = useAuth();
  const isLeader = user?.role === 'GROUP_LEADER';

  // Placeholder data - sẽ connect với API thực tế
  const progressReports = [
    {
      id: '1',
      week: 1,
      progress: 25,
      summary: 'Hoàn thành phân tích yêu cầu và thiết kế UI',
      submittedAt: '2026-01-15',
    },
    {
      id: '2',
      week: 2,
      progress: 45,
      summary: 'Phát triển backend API và database',
      submittedAt: '2026-01-22',
      feedback: 'Tiến độ tốt, cần tập trung vào documentation',
    },
  ];

  const renderReport = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.weekBadge}>
          <Text style={styles.weekText}>Tuần {item.week}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      </View>
      <Text style={styles.summary} numberOfLines={2}>
        {item.summary}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          📅 {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
        </Text>
        {item.feedback && (
          <View style={styles.feedbackBadge}>
            <Text style={styles.feedbackText}>Có phản hồi</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLeader && (
        <TouchableOpacity style={styles.addBanner}>
          <Text style={styles.addBannerText}>+ Nộp báo cáo tuần này</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={progressReports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>Chưa có báo cáo nào</Text>
            <Text style={styles.emptyDesc}>
              Báo cáo tiến độ sẽ xuất hiện sau khi nhóm nộp
            </Text>
          </View>
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
  addBanner: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
  },
  addBannerText: {
    color: '#fff',
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
    marginBottom: spacing.md,
  },
  weekBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  weekText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 80,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  summary: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  feedbackBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  feedbackText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'] * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
