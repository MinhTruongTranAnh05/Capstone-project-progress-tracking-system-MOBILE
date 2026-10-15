import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { groupService } from '@/services/groupService';
import { progressService } from '@/services/progressService';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function ProgressScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [userGroup, setUserGroup] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [weekNumber, setWeekNumber] = useState('1');
  const [percentage, setPercentage] = useState('20');
  const [summary, setSummary] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [pendingTasks, setPendingTasks] = useState('');

  const fetchGroupAndProgress = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const groupsRes = await groupService.getGroups({ memberId: user.id });
      const groupList = groupsRes?.content || groupsRes || [];

      if (groupList.length > 0) {
        const group = groupList[0];
        setUserGroup(group);

        // Fetch reports
        const repRes = await progressService.getProgressReports(group.id).catch(() => []);
        const repList = repRes?.content || repRes || [];
        setReports(repList);
        setWeekNumber(String(repList.length + 1));
      } else {
        setUserGroup(null);
        setReports([]);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGroupAndProgress();
  }, [fetchGroupAndProgress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroupAndProgress();
    setRefreshing(false);
  }, [fetchGroupAndProgress]);

  const handleSubmitReport = async () => {
    if (!userGroup?.id) {
      Alert.alert('Chưa có nhóm', 'Bạn cần tham gia nhóm để nộp báo cáo tiến độ.');
      return;
    }

    if (!summary.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tóm tắt công việc trong tuần!');
      return;
    }

    const pctNum = Number(percentage);
    if (isNaN(pctNum) || pctNum < 0 || pctNum > 100) {
      Alert.alert('Giá trị không hợp lệ', 'Tỷ lệ hoàn thành phải từ 0% đến 100%!');
      return;
    }

    setSubmitting(true);
    try {
      await progressService.submitProgress(userGroup.id, {
        weekNumber: Number(weekNumber) || 1,
        progressPercentage: pctNum,
        summary: summary.trim(),
        blockers: pendingTasks.trim(),
        nextWeekPlan: completedTasks.trim(),
      });

      Alert.alert('Thành công', 'Nộp báo cáo tiến độ tuần thành công!');
      setShowForm(false);
      setSummary('');
      setCompletedTasks('');
      setPendingTasks('');
      await fetchGroupAndProgress();
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể gửi báo cáo tiến độ.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLeader =
    user?.role === 'GROUP_LEADER' ||
    userGroup?.members?.some((m: any) => (m.userId === user?.id || m.id === user?.id) && m.isLeader);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải tiến độ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>Group Progress · Báo cáo tuần & Tiến độ</Text>
        </View>
        <Text style={styles.bannerTitle}>Quản lý Tiến độ Hàng Tuần</Text>
        <Text style={styles.bannerDesc}>
          Cập nhật công việc đã làm, việc tồn đọng và tỷ lệ hoàn thành đồ án qua từng tuần.
        </Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Toggle form button */}
            {isLeader && (
              <TouchableOpacity
                style={styles.toggleFormBtn}
                onPress={() => setShowForm(!showForm)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={showForm ? 'chevron-up-circle' : 'add-circle'}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.toggleFormBtnText}>
                  {showForm ? 'Ẩn form nộp báo cáo' : '+ Nộp báo cáo tuần mới'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Submission Form */}
            {showForm && (
              <View style={styles.formCard}>
                <Text style={styles.formCardTitle}>Gửi báo cáo tiến độ tuần mới</Text>

                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Tuần số *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={weekNumber}
                      onChangeText={setWeekNumber}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Tiến độ (%) *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={percentage}
                      onChangeText={setPercentage}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tóm tắt công việc trong tuần *</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    placeholder="Đã hoàn thành các chức năng đăng nhập, đăng ký..."
                    placeholderTextColor={colors.textMuted}
                    value={summary}
                    onChangeText={setSummary}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Công việc đã hoàn thành</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Thiết kế DB, Viết test API..."
                    placeholderTextColor={colors.textMuted}
                    value={completedTasks}
                    onChangeText={setCompletedTasks}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Việc tồn đọng / Kế hoạch tuần tới</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Tích hợp thanh toán, deploy..."
                    placeholderTextColor={colors.textMuted}
                    value={pendingTasks}
                    onChangeText={setPendingTasks}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmitReport}
                  disabled={submitting}
                >
                  <Text style={styles.submitBtnText}>
                    {submitting ? 'Đang gửi...' : 'Nộp báo cáo tuần'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.historyTitle}>
              Lịch sử báo cáo ({reports.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const pct = item.progressPercentage ?? item.percentage ?? 0;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.weekBadge}>
                  <Text style={styles.weekBadgeText}>
                    Tuần {item.weekNumber || item.week || 1}
                  </Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
                  </View>
                  <Text style={styles.progressPercent}>{pct}%</Text>
                </View>
              </View>

              <Text style={styles.cardSummary}>{item.summary || 'Không có mô tả'}</Text>

              {item.nextWeekPlan || item.completedTasks ? (
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                  <Text style={styles.detailText}>
                    {item.nextWeekPlan || item.completedTasks}
                  </Text>
                </View>
              ) : null}

              {item.instructorFeedback || item.feedback ? (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackTitle}>Nhận xét của GVHD:</Text>
                  <Text style={styles.feedbackText}>{item.instructorFeedback || item.feedback}</Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                  📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                </Text>
                {item.submittedByName && (
                  <Text style={styles.submitterText}>Bởi: {item.submittedByName}</Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>Chưa có báo cáo tiến độ nào</Text>
            <Text style={styles.emptySubtitle}>
              Trưởng nhóm hãy nộp báo cáo tiến độ hàng tuần để GVHD theo dõi.
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
  banner: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerTagText: {
    color: colors.primary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  toggleFormBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: borderRadius.md,
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleFormBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  formCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formCol: {
    flex: 1,
    gap: 4,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 12.5,
    color: colors.text,
  },
  formTextarea: {
    minHeight: 55,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: borderRadius.md,
    marginTop: 2,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  historyTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
  },
  weekBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  weekBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 90,
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  cardSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    flex: 1,
  },
  feedbackBox: {
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: 2,
  },
  feedbackTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  feedbackText: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  cardDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  submitterText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
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
