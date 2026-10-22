import { useState, useEffect, useCallback } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { groupService } from '@/services/groupService';
import { documentService } from '@/services/documentService';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function DocumentsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [userGroup, setUserGroup] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const fetchGroupAndDocs = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const groupsRes = await groupService.getGroups({ memberId: user.id });
      const groupList = groupsRes?.content || groupsRes || [];

      if (groupList.length > 0) {
        const group = groupList[0];
        setUserGroup(group);

        const docRes = await documentService.getGroupDocuments(group.id).catch(() => []);
        const docList = docRes?.content || docRes || [];
        setDocuments(docList);
      } else {
        setUserGroup(null);
        setDocuments([]);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGroupAndDocs();
  }, [fetchGroupAndDocs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroupAndDocs();
    setRefreshing(false);
  }, [fetchGroupAndDocs]);

  const handleSubmitDoc = async () => {
    if (!userGroup?.id) {
      Alert.alert('Chưa có nhóm', 'Bạn cần tham gia nhóm để nộp tài liệu.');
      return;
    }

    if (!title.trim() || !url.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tiêu đề và đường dẫn URL!');
      return;
    }

    setSubmitting(true);
    try {
      await documentService.submitDocumentLink(userGroup.id, {
        title: title.trim(),
        url: url.trim(),
      });

      Alert.alert('Thành công', 'Nộp liên kết tài liệu thành công!');
      setShowForm(false);
      setTitle('');
      setUrl('');
      await fetchGroupAndDocs();
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể nộp tài liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenUrl = (docUrl?: string) => {
    if (!docUrl) return;
    Linking.openURL(docUrl).catch(() => {
      Alert.alert('Không thể mở liên kết', 'Đường dẫn URL không hợp lệ hoặc thiết bị không hỗ trợ.');
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Đã duyệt', bg: colors.success50, color: colors.success, border: colors.successBorder };
      case 'REJECTED':
        return { label: 'Từ chối', bg: colors.error50, color: colors.error, border: colors.errorBorder };
      default:
        return { label: 'Chờ duyệt', bg: colors.warning50, color: colors.warning, border: colors.warningBorder };
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải tài liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>Documents / Artifacts · Nộp tài liệu</Text>
        </View>
        <Text style={styles.bannerTitle}>Quản lý Tài liệu & Báo cáo Đồ án</Text>
        <Text style={styles.bannerDesc}>
          Nộp liên kết mã nguồn GitHub, bản vẽ thiết kế Figma hoặc tài liệu báo cáo qua các cột mốc.
        </Text>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Toggle form button */}
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
                {showForm ? 'Ẩn form nộp tài liệu' : '+ Nộp liên kết tài liệu mới'}
              </Text>
            </TouchableOpacity>

            {/* Submission Form */}
            {showForm && (
              <View style={styles.formCard}>
                <Text style={styles.formCardTitle}>Nộp liên kết tài liệu mới</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tiêu đề tài liệu *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Báo cáo Sprint 1 / Link GitHub Repository"
                    placeholderTextColor={colors.textMuted}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Đường dẫn (URL) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="https://github.com/..."
                    placeholderTextColor={colors.textMuted}
                    value={url}
                    onChangeText={setUrl}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmitDoc}
                  disabled={submitting}
                >
                  <Text style={styles.submitBtnText}>
                    {submitting ? 'Đang nộp...' : '+ Nộp tài liệu'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.historyTitle}>
              Danh sách tài liệu đã nộp ({documents.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusConfig = getStatusBadge(item.status);
          const docUrl = item.url || item.fileUrl;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name="document-text" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.docTitle}>{item.title}</Text>
                    <Text style={styles.docDate}>
                      {item.submittedAt || item.createdAt
                        ? new Date(item.submittedAt || item.createdAt).toLocaleDateString('vi-VN')
                        : 'Mới nộp'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              {docUrl ? (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleOpenUrl(docUrl)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="link-outline" size={14} color={colors.blue} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>
                    {docUrl}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>Chưa có tài liệu nào</Text>
            <Text style={styles.emptySubtitle}>
              Tài liệu và báo cáo đồ án của nhóm sẽ xuất hiện ở đây.
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
    paddingVertical: 9,
    fontSize: 12.5,
    color: colors.text,
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
    padding: spacing.md,
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
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  docDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.blue50,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
  },
  linkButtonText: {
    fontSize: 11.5,
    color: colors.blue,
    fontWeight: '600',
    flex: 1,
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
