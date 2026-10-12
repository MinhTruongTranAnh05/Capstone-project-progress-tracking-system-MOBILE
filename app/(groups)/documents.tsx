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

export default function DocumentsScreen() {
  const { user } = useAuth();
  const isLeader = user?.role === 'GROUP_LEADER';

  // Placeholder data - sẽ connect với API thực tế
  const documents = [
    {
      id: '1',
      title: 'Báo cáo tuần 1',
      type: 'PDF',
      size: '2.5 MB',
      submittedAt: '2026-01-15',
      status: 'PENDING',
    },
    {
      id: '2',
      title: 'Tài liệu thiết kế',
      type: 'DOCX',
      size: '1.2 MB',
      submittedAt: '2026-01-10',
      status: 'APPROVED',
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { bg: colors.successLight, color: colors.success, text: 'Đã duyệt' };
      case 'REJECTED':
        return { bg: colors.errorLight, color: colors.error, text: 'Bị từ chối' };
      default:
        return { bg: colors.warningLight, color: colors.warning, text: 'Chờ duyệt' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return '📄';
      case 'DOCX':
      case 'DOC':
        return '📝';
      case 'XLSX':
      case 'XLS':
        return '📊';
      case 'ZIP':
        return '📦';
      default:
        return '📎';
    }
  };

  const renderDocument = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getTypeIcon(item.type)}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{item.type} • {item.size}</Text>
            <Text style={styles.dateText}>
              {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {statusStyle.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLeader && (
        <TouchableOpacity style={styles.addBanner}>
          <Text style={styles.addBannerText}>+ Tải lên tài liệu mới</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>Chưa có tài liệu nào</Text>
            <Text style={styles.emptyDesc}>
              Tài liệu và báo cáo của nhóm sẽ xuất hiện ở đây
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
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
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
