import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { groupService } from '@/services/groupService';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function GroupsIndexScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupData, setGroupData] = useState<any>(null);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [memberInput, setMemberInput] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroupDetails = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const myGroupsRes = await groupService.getGroups({ memberId: user.id });
      const groupList = myGroupsRes?.content || myGroupsRes || [];

      if (groupList.length > 0) {
        const detailed = await groupService.getGroupById(groupList[0].id).catch(() => groupList[0]);
        setGroupData(detailed);
      } else {
        setGroupData(null);
        // Load available groups for joining (< 6 members)
        const allRes = await groupService.getGroups();
        const allList = allRes?.content || allRes || [];
        const valid = allList.filter((g: any) => (g.memberCount || g.members?.length || 0) < 6);
        setAvailableGroups(valid);
      }
    } catch (err) {
      console.warn('Lỗi tải thông tin nhóm:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroupDetails();
    setRefreshing(false);
  }, [fetchGroupDetails]);

  const isLeader =
    user?.role === 'GROUP_LEADER' ||
    groupData?.members?.some((m: any) => (m.userId === user?.id || m.id === user?.id) && m.isLeader);

  const handleCopyCode = () => {
    if (groupData?.groupCode) {
      Alert.alert('Đã sao chép mã nhóm', `Mã nhóm: ${groupData.groupCode}`);
    }
  };

  const handleAddMember = async () => {
    if (!isLeader) {
      Alert.alert('Thông báo', 'Chỉ có Trưởng nhóm mới có quyền thêm thành viên!');
      return;
    }
    if (!memberInput.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập Email hoặc MSSV của thành viên!');
      return;
    }

    if (groupData?.members && groupData.members.length >= 6) {
      Alert.alert('Giới hạn thành viên', 'Nhóm đã đạt số lượng tối đa (6 thành viên). Không thể thêm mới!');
      return;
    }

    setAddingMember(true);
    try {
      await groupService.addGroupMember(groupData.id, {
        userId: memberInput.trim(),
        email: memberInput.trim(),
        isLeader: false,
      });
      Alert.alert('Thành công', 'Thêm thành viên vào nhóm thành công!');
      setMemberInput('');
      await fetchGroupDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Thêm thành viên thất bại. Vui lòng kiểm tra lại Email/MSSV.';
      Alert.alert('Lỗi', msg);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!isLeader) {
      Alert.alert('Thông báo', 'Chỉ có Trưởng nhóm mới có quyền xóa thành viên!');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa "${memberName}" khỏi nhóm?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa thành viên',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupService.removeGroupMember(groupData.id, memberId);
              Alert.alert('Thành công', 'Đã xóa thành viên khỏi nhóm.');
              await fetchGroupDetails();
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa thành viên.');
            }
          },
        },
      ]
    );
  };

  const handleJoinGroup = async (groupId: string) => {
    Alert.alert('Xác nhận tham gia', 'Bạn có chắc chắn muốn tham gia nhóm này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Tham gia',
        onPress: async () => {
          setJoiningId(groupId);
          try {
            await groupService.joinGroup(groupId);
            Alert.alert('Thành công', 'Tham gia nhóm thành công!');
            await fetchGroupDetails();
          } catch (err: any) {
            Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tham gia nhóm.');
          } finally {
            setJoiningId(null);
          }
        },
      },
    ]);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SV';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? parts[parts.length - 2][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin nhóm...</Text>
      </View>
    );
  }

  // SCREEN A: USER HAS GROUP
  if (groupData) {
    const memberCount = groupData.members?.length || 4;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Top Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerSubtitle}>Thông tin nhóm đồ án</Text>
              <Text style={styles.headerTitle}>
                {groupData.topicTitle || groupData.topic?.title || 'Đồ án tốt nghiệp Capstone'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                groupData.status === 'ACTIVE' ? styles.statusBadgeActive : styles.statusBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  groupData.status === 'ACTIVE' ? styles.statusTextActive : styles.statusTextPending,
                ]}
              >
                {groupData.status === 'ACTIVE' ? '✓ ACTIVE' : '⏳ PENDING'}
              </Text>
            </View>
          </View>

          {/* Group Code Copy Pill */}
          <View style={styles.codeRow}>
            <View style={styles.codeInfo}>
              <Text style={styles.codeLabel}>MÃ NHÓM / MÃ MỜI</Text>
              <Text style={styles.codeValue}>{groupData.groupCode || 'G-2026'}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode} activeOpacity={0.8}>
              <Ionicons name="copy-outline" size={14} color={colors.primary} />
              <Text style={styles.copyBtnText}>Sao chép mã</Text>
            </TouchableOpacity>
          </View>

          {/* Supervisor & Semester */}
          <View style={styles.metaInfoRow}>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaInfoLabel}>Học kỳ:</Text>
              <Text style={styles.metaInfoValue}>{groupData.semester || 'Spring 2026'}</Text>
            </View>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaInfoLabel}>GVHD:</Text>
              <Text style={styles.metaInfoValue} numberOfLines={1}>
                {groupData.supervisorName || groupData.supervisor?.fullName || 'Chưa phân công'}
              </Text>
            </View>
          </View>
        </View>

        {/* Member List Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Thành viên nhóm ({memberCount}/6 người)
            </Text>
            <Text style={styles.sectionRequirement}>Quy chế: 4-6 thành viên</Text>
          </View>

          <View style={styles.memberList}>
            {groupData.members && groupData.members.length > 0 ? (
              groupData.members.map((member: any) => (
                <View key={member.id || member.userId} style={styles.memberRow}>
                  <View style={styles.memberLeft}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{getInitials(member.fullName || member.userName)}</Text>
                    </View>
                    <View style={styles.memberTextGroup}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.fullName || member.userName || 'Thành viên'}</Text>
                        {member.isLeader && (
                          <View style={styles.leaderBadge}>
                            <Text style={styles.leaderBadgeText}>👑 Leader</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberEmail}>
                        {member.studentCode ? `${member.studentCode} · ` : ''}
                        {member.email || member.userEmail}
                      </Text>
                    </View>
                  </View>

                  {isLeader && !member.isLeader && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemoveMember(member.id || member.userId, member.fullName || member.userName)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.memberRow}>
                <View style={styles.memberLeft}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
                  </View>
                  <View style={styles.memberTextGroup}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{user?.fullName || 'Bạn'}</Text>
                      <View style={styles.leaderBadge}>
                        <Text style={styles.leaderBadgeText}>👑 Leader</Text>
                      </View>
                    </View>
                    <Text style={styles.memberEmail}>{user?.email}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Add member box (Leader only) */}
          {isLeader && (
            <View style={styles.addMemberBox}>
              <Text style={styles.addMemberTitle}>Thêm thành viên mới</Text>
              <View style={styles.addMemberInputRow}>
                <TextInput
                  style={styles.addMemberInput}
                  placeholder="Nhập Email hoặc MSSV..."
                  placeholderTextColor={colors.textMuted}
                  value={memberInput}
                  onChangeText={setMemberInput}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.addMemberBtn, addingMember && { opacity: 0.6 }]}
                  onPress={handleAddMember}
                  disabled={addingMember}
                >
                  <Text style={styles.addMemberBtnText}>
                    {addingMember ? '...' : '+ Thêm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // SCREEN B: USER HAS NO GROUP
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.noGroupBanner}>
        <View style={styles.warningPill}>
          <Text style={styles.warningPillText}>⚠️ Chưa tham gia nhóm</Text>
        </View>
        <Text style={styles.noGroupHeaderTitle}>Vui lòng chọn hoặc tạo nhóm đồ án</Text>
        <Text style={styles.noGroupHeaderDesc}>
          Mỗi nhóm cần từ 4-6 thành viên để chính thức đăng ký đề tài Capstone.
        </Text>

        <TouchableOpacity
          style={styles.createGroupTopBtn}
          onPress={() => router.push('/(groups)/create')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.createGroupTopBtnText}>Tạo nhóm đồ án mới</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Các nhóm đang mở tuyển thành viên</Text>
        <Text style={styles.sectionRequirement}>Hiển thị nhóm chưa đủ 6 người</Text>
      </View>

      <View style={styles.availableList}>
        {availableGroups.length > 0 ? (
          availableGroups.map((g: any) => (
            <View key={g.id} style={styles.availableCard}>
              <View style={styles.availableCardHeader}>
                <View style={styles.availableGroupCodeBadge}>
                  <Text style={styles.availableGroupCodeText}>{g.groupCode || 'GRP-2026'}</Text>
                </View>
                <Text style={styles.availableCountText}>
                  {g.memberCount || g.members?.length || 1}/6 thành viên
                </Text>
              </View>

              <Text style={styles.availableTopicTitle}>
                {g.topicTitle || g.topic?.title || 'Chưa chọn đề tài'}
              </Text>

              {g.supervisorName && (
                <Text style={styles.availableSupervisorText}>
                  GVHD: {g.supervisorName}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.joinBtn, joiningId === g.id && { opacity: 0.6 }]}
                onPress={() => handleJoinGroup(g.id)}
                disabled={joiningId === g.id}
              >
                <Text style={styles.joinBtnText}>
                  {joiningId === g.id ? 'Đang tham gia...' : 'Tham gia nhóm này'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={44} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>Chưa có nhóm nào mở tuyển</Text>
            <Text style={styles.emptySubtitle}>
              Bạn có thể nhấn nút "Tạo nhóm đồ án mới" ở trên để trở thành Trưởng nhóm.
            </Text>
          </View>
        )}
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: 2,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: colors.success50,
    borderColor: colors.successBorder,
  },
  statusBadgePending: {
    backgroundColor: colors.warning50,
    borderColor: colors.warningBorder,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  codeRow: {
    backgroundColor: colors.primary50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary100,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeInfo: {
    gap: 1,
  },
  codeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.5,
  },
  copyBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  metaInfoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: 4,
  },
  metaInfoItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  metaInfoLabel: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaInfoValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  sectionRequirement: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  memberList: {
    gap: spacing.sm,
  },
  memberRow: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.primary,
  },
  memberTextGroup: {
    flex: 1,
    gap: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  leaderBadge: {
    backgroundColor: colors.success50,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.successBorder,
  },
  leaderBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.success,
  },
  memberEmail: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  removeBtn: {
    padding: 6,
  },
  addMemberBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  addMemberTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.text,
  },
  addMemberInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addMemberInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.text,
  },
  addMemberBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  addMemberBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  noGroupBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  warningPill: {
    backgroundColor: colors.warning50,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  warningPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.warning,
  },
  noGroupHeaderTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  noGroupHeaderDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  createGroupTopBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  createGroupTopBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  availableList: {
    gap: spacing.md,
  },
  availableCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  availableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableGroupCodeBadge: {
    backgroundColor: colors.primary50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  availableGroupCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  availableCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  availableTopicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  availableSupervisorText: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  joinBtn: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    marginTop: 6,
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
