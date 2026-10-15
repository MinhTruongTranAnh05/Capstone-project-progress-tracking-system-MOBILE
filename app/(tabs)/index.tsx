import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { groupService } from '@/services/groupService';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { Platform } from 'react-native';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [groupData, setGroupData] = useState<any>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoadingGroup(true);
      const groupsRes = await groupService.getGroups({ memberId: user.id });
      const groupList = groupsRes?.content || groupsRes || [];
      if (groupList.length > 0) {
        // Fetch detailed group info
        const detail = await groupService.getGroupById(groupList[0].id).catch(() => groupList[0]);
        setGroupData(detail);
      } else {
        setGroupData(null);
      }
    } catch {
      // fallback
    } finally {
      setLoadingGroup(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroup();
    setRefreshing(false);
  }, [fetchGroup]);

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'ADMIN':
        return {
          label: '🛡️ ADMIN',
          bg: colors.error50,
          color: colors.error,
          border: colors.errorBorder,
        };
      case 'INSTRUCTOR':
        return {
          label: '👨‍🏫 INSTRUCTOR',
          bg: colors.blue50,
          color: colors.blue,
          border: colors.blueLight,
        };
      case 'GROUP_LEADER':
        return {
          label: '👑 GROUP LEADER',
          bg: colors.success50,
          color: colors.success,
          border: colors.successBorder,
        };
      default:
        return {
          label: '🎓 STUDENT',
          bg: colors.primary50,
          color: colors.primary,
          border: colors.primary100,
        };
    }
  };

  const roleConfig = getRoleConfig();

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: TAB_BAR_HEIGHT + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* 1. Brand & Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.brandGroup}>
          <View style={styles.logoBadge}>
            <View style={styles.logoInnerCheck}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>
          <View>
            <Text style={styles.brandTitle}>Lịch Đồ Án</Text>
            <Text style={styles.brandSub}>Khoa Công nghệ thông tin</Text>
          </View>
        </View>

        <View style={styles.semesterPill}>
          <Text style={styles.semesterText}>Spring 2026</Text>
        </View>
      </View>

      {/* 2. Welcome & Role Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeInfo}>
          <Text style={styles.greetingText}>Xin chào,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Sinh viên'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: roleConfig.bg, borderColor: roleConfig.border },
          ]}
        >
          <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>
            {roleConfig.label}
          </Text>
        </View>
      </View>

      {/* 3. Group Status Summary (Mirroring Website Overview) */}
      <View style={styles.groupCard}>
        <View style={styles.groupCardHeader}>
          <View style={styles.tagGroup}>
            <Text style={styles.sectionSubtitle}>Trạng thái đồ án tốt nghiệp</Text>
          </View>
          {groupData ? (
            <View
              style={[
                styles.statusTag,
                groupData.status === 'ACTIVE'
                  ? styles.statusTagApproved
                  : styles.statusTagPending,
              ]}
            >
              <Text
                style={[
                  styles.statusTagText,
                  groupData.status === 'ACTIVE'
                    ? styles.statusTextApproved
                    : styles.statusTextPending,
                ]}
              >
                {groupData.status === 'ACTIVE' ? '✓ ĐÃ PHÊ DUYỆT' : '⏳ CHỜ DUYỆT'}
              </Text>
            </View>
          ) : null}
        </View>

        {loadingGroup ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
        ) : groupData ? (
          <View style={styles.groupDetails}>
            <Text style={styles.topicTitle}>
              {groupData.topicTitle || groupData.topic?.title || 'Chưa chọn đề tài chính thức'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Mã nhóm:</Text>
                <Text style={styles.metaValueHighlight}>
                  {groupData.groupCode || 'G-2026'}
                </Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Thành viên:</Text>
                <Text style={styles.metaValue}>
                  {groupData.members ? `${groupData.members.length}/6 người` : '4/6 người'}
                </Text>
              </View>
            </View>

            <View style={styles.supervisorRow}>
              <Ionicons name="person-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.supervisorText}>
                GVHD: <Text style={styles.supervisorName}>{groupData.supervisorName || groupData.supervisor?.fullName || 'Chờ Admin phân công'}</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewGroupBtn}
              onPress={() => router.push('/(groups)')}
              activeOpacity={0.8}
            >
              <Text style={styles.viewGroupBtnText}>Chi tiết nhóm & Thành viên</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noGroupContainer}>
            <View style={styles.noGroupIconContainer}>
              <Ionicons name="people-outline" size={28} color={colors.warning} />
            </View>
            <Text style={styles.noGroupTitle}>Chưa tham gia nhóm đồ án</Text>
            <Text style={styles.noGroupDesc}>
              Tham gia hoặc tạo nhóm mới (yêu cầu 4-6 người) để đăng ký đề tài chính thức.
            </Text>
            <View style={styles.noGroupActions}>
              <TouchableOpacity
                style={styles.createGroupBtn}
                onPress={() => router.push('/(groups)/create')}
              >
                <Text style={styles.createGroupBtnText}>+ Tạo nhóm mới</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.joinGroupBtn}
                onPress={() => router.push('/(groups)')}
              >
                <Text style={styles.joinGroupBtnText}>Tìm nhóm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 4. Quick Actions Hub (Aligned with Web Navigation) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chức năng đồ án</Text>
        <Text style={styles.sectionHint}>Thao tác nhanh theo tiến trình</Text>
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(groups)')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: colors.primary50 }]}>
            <Ionicons name="people" size={22} color={colors.primary} />
          </View>
          <Text style={styles.actionCardTitle}>Nhóm của tôi</Text>
          <Text style={styles.actionCardDesc}>Thành viên & mã mời</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(groups)/topics')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: colors.blue50 }]}>
            <Ionicons name="book" size={22} color={colors.blue} />
          </View>
          <Text style={styles.actionCardTitle}>Đề tài đồ án</Text>
          <Text style={styles.actionCardDesc}>Xem danh mục đề tài</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/schedule')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: colors.warning50 }]}>
            <Ionicons name="calendar" size={22} color={colors.warning} />
          </View>
          <Text style={styles.actionCardTitle}>Lịch hẹn GVHD</Text>
          <Text style={styles.actionCardDesc}>Đặt & quản lý lịch hẹn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(groups)/progress')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: colors.success50 }]}>
            <Ionicons name="trending-up" size={22} color={colors.success} />
          </View>
          <Text style={styles.actionCardTitle}>Tiến độ tuần</Text>
          <Text style={styles.actionCardDesc}>Báo cáo & Milestones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(groups)/documents')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: colors.purpleLight }]}>
            <Ionicons name="folder-open" size={22} color={colors.purple} />
          </View>
          <Text style={styles.actionCardTitle}>Tài liệu nộp</Text>
          <Text style={styles.actionCardDesc}>Link GitHub & Báo cáo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/notifications')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: colors.gray[100] }]}>
            <Ionicons name="notifications" size={22} color={colors.textSecondary} />
          </View>
          <Text style={styles.actionCardTitle}>Thông báo</Text>
          <Text style={styles.actionCardDesc}>Tin tức & đánh giá</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Weekly Schedule Widget (Mirroring Website Preview) */}
      <View style={styles.scheduleWidget}>
        <View style={styles.widgetHeader}>
          <View style={styles.widgetHeaderLeft}>
            <View style={styles.widgetDot} />
            <Text style={styles.widgetTitle}>Lịch hẹn tuần này (Calendar)</Text>
          </View>
          <View style={styles.widgetBadge}>
            <Text style={styles.widgetBadgeText}>Spring 2026</Text>
          </View>
        </View>

        <View style={styles.widgetCardsRow}>
          <View style={[styles.dayCard, styles.dayCardOrange]}>
            <Text style={[styles.dayCardTitle, { color: colors.primary }]}>Thứ Hai</Text>
            <Text style={styles.dayCardTime}>09:00</Text>
            <Text style={styles.dayCardDesc} numberOfLines={2}>
              Duyệt đề cương
            </Text>
          </View>

          <View style={[styles.dayCard, styles.dayCardNeutral]}>
            <Text style={[styles.dayCardTitle, { color: colors.textSecondary }]}>Thứ Tư</Text>
            <Text style={styles.dayCardTime}>14:00</Text>
            <Text style={styles.dayCardDesc} numberOfLines={2}>
              Báo cáo tiến độ
            </Text>
          </View>

          <View style={[styles.dayCard, styles.dayCardGreen]}>
            <Text style={[styles.dayCardTitle, { color: colors.success }]}>Thứ Sáu</Text>
            <Text style={styles.dayCardTime}>10:30</Text>
            <Text style={styles.dayCardDesc} numberOfLines={2}>
              Chấm hội đồng
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    // paddingTop & paddingBottom are applied dynamically via insets (see render)
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoInnerCheck: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    lineHeight: 11,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  semesterPill: {
    backgroundColor: colors.primary50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary100,
  },
  semesterText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  welcomeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  userEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tagGroup: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  statusTag: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusTagApproved: {
    backgroundColor: colors.success50,
    borderColor: colors.successBorder,
  },
  statusTagPending: {
    backgroundColor: colors.warning50,
    borderColor: colors.warningBorder,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextApproved: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  groupDetails: {
    gap: spacing.sm,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 4,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  metaLabel: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaValueHighlight: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.primary,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  metaDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  supervisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  supervisorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  supervisorName: {
    fontWeight: '700',
    color: colors.text,
  },
  viewGroupBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 6,
    marginTop: 4,
  },
  viewGroupBtnText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  noGroupContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  noGroupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.warning50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  noGroupDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  noGroupActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  createGroupBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  createGroupBtnText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  joinGroupBtn: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  joinGroupBtnText: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  scheduleWidget: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  widgetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widgetDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  widgetTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.text,
  },
  widgetBadge: {
    backgroundColor: colors.primary50,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  widgetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  widgetCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  dayCardOrange: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary100,
  },
  dayCardNeutral: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderLight,
  },
  dayCardGreen: {
    backgroundColor: colors.success50,
    borderColor: colors.successBorder,
  },
  dayCardTitle: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  dayCardTime: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayCardDesc: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
});
