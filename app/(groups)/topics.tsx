import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { topicService } from '@/services/topicService';
import { groupService } from '@/services/groupService';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { Topic } from '@/types/models';

export default function TopicsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userGroup, setUserGroup] = useState<any>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const fetchTopicsAndGroup = useCallback(async () => {
    try {
      setLoading(true);
      const res = await topicService.getTopics({ status: 'PUBLISHED' });
      const list = res?.content || res || [];
      setTopics(list);

      if (user?.id) {
        const groupsRes = await groupService.getGroups({ memberId: user.id });
        const groupList = groupsRes?.content || groupsRes || [];
        if (groupList.length > 0) {
          const detail = await groupService.getGroupById(groupList[0].id).catch(() => groupList[0]);
          setUserGroup(detail);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTopicsAndGroup();
  }, [fetchTopicsAndGroup]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTopicsAndGroup();
    setRefreshing(false);
  }, [fetchTopicsAndGroup]);

  const isLeader =
    user?.role === 'GROUP_LEADER' ||
    userGroup?.members?.some((m: any) => (m.userId === user?.id || m.id === user?.id) && m.isLeader);

  const handleSelectTopic = async (topic: Topic) => {
    if (!userGroup) {
      Alert.alert('Chưa có nhóm', 'Bạn cần tham gia hoặc tạo nhóm đồ án trước khi đăng ký đề tài.');
      return;
    }

    if (!isLeader) {
      Alert.alert('Thông báo', 'Chỉ có Trưởng nhóm mới có quyền chọn/đổi đề tài cho nhóm.');
      return;
    }

    if (userGroup.status === 'ACTIVE') {
      Alert.alert('Đã phê duyệt', 'Đề tài hiện tại của nhóm đã được phê duyệt chính thức (ACTIVE). Không thể thay đổi!');
      return;
    }

    Alert.alert(
      'Xác nhận đăng ký đề tài',
      `Bạn có muốn chọn đề tài "${topic.title}" cho nhóm ${userGroup.groupCode || ''}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận chọn',
          onPress: async () => {
            setSelectingId(topic.id);
            try {
              await groupService.updateGroup(userGroup.id, {
                topicId: topic.id,
                status: 'PENDING',
              } as any);

              Alert.alert('Thành công', 'Đã gửi yêu cầu đăng ký đề tài! Vui lòng chờ Admin/GVHD phê duyệt.');
              await fetchTopicsAndGroup();
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể đăng ký đề tài.');
            } finally {
              setSelectingId(null);
            }
          },
        },
      ]
    );
  };

  const categories = ['Tất cả', 'Phần mềm', 'AI & Data', 'Bảo mật', 'IoT & Web'];

  const filteredTopics = topics.filter((t: Topic) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.topicCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Tất cả' ||
      t.category?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>Đề tài đồ án tốt nghiệp · BR-TOPIC</Text>
        </View>
        <Text style={styles.bannerTitle}>Danh mục Đề tài Capstone</Text>
        <Text style={styles.bannerDesc}>
          Khám phá danh sách đề tài đã được thẩm định và chọn đề tài phù hợp với định hướng nhóm.
        </Text>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên đề tài, mã đề tài..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoriesRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Topics List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải đề tài...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTopics}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => {
            const isCurrentTopic =
              userGroup?.topicId === item.id || userGroup?.topic?.id === item.id;

            return (
              <View style={[styles.card, isCurrentTopic && styles.cardActiveGroup]}>
                <View style={styles.cardHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.topicCode || 'TOPIC'}</Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category || 'Chung'}</Text>
                  </View>
                  {isCurrentTopic && (
                    <View style={styles.currentTopicBadge}>
                      <Text style={styles.currentTopicText}>✓ Đề tài hiện tại</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.title}>{item.title}</Text>

                {item.description ? (
                  <Text style={styles.desc} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  {isCurrentTopic ? (
                    <View style={styles.chosenTag}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.chosenTagText}>Đã được nhóm bạn chọn</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        selectingId === item.id && { opacity: 0.6 },
                      ]}
                      onPress={() => handleSelectTopic(item)}
                      disabled={selectingId === item.id}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkbox-outline" size={15} color="#fff" />
                      <Text style={styles.selectButtonText}>
                        {selectingId === item.id ? 'Đang xử lý...' : 'Đăng ký đề tài này'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>Không tìm thấy đề tài</Text>
              <Text style={styles.emptySubtitle}>
                Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
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
    gap: spacing.sm,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
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
  },
  bannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    gap: 8,
    marginTop: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: colors.text,
    padding: 0,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
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
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardActiveGroup: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  codeBadge: {
    backgroundColor: colors.primary50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  codeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  categoryBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  currentTopicBadge: {
    backgroundColor: colors.success50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  currentTopicText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 20,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginTop: 2,
  },
  selectButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  chosenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  chosenTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
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
