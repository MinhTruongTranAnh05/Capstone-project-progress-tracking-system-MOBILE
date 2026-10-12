import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'INSTRUCTOR':
        return 'Giảng viên';
      case 'COUNCIL':
        return 'Hội đồng';
      case 'GROUP_LEADER':
        return 'Trưởng nhóm';
      default:
        return 'Sinh viên';
    }
  };

  const getRoleBadgeStyle = () => {
    switch (user?.role) {
      case 'ADMIN':
        return { backgroundColor: '#FEE2E2', color: '#DC2626' };
      case 'INSTRUCTOR':
        return { backgroundColor: '#DBEAFE', color: '#2563EB' };
      case 'COUNCIL':
        return { backgroundColor: '#F3E8FF', color: '#9333EA' };
      case 'GROUP_LEADER':
        return { backgroundColor: '#D1FAE5', color: '#059669' };
      default:
        return { backgroundColor: '#FFF3E0', color: '#E65100' };
    }
  };

  const roleBadge = getRoleBadgeStyle();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleBadge.backgroundColor }]}>
          <Text style={[styles.roleText, { color: roleBadge.color }]}>
            {getRoleLabel()}
          </Text>
        </View>
      </View>

      {/* Student/Group Leader Content */}
      {(user?.role === 'STUDENT' || user?.role === 'GROUP_LEADER') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(groups)/create')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>👥</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Nhóm của tôi</Text>
              <Text style={styles.cardDesc}>Xem và quản lý nhóm đồ án</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(groups)/topics')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📚</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Đề tài</Text>
              <Text style={styles.cardDesc}>Xem và chọn đề tài đồ án</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(groups)/progress')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📈</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Tiến độ</Text>
              <Text style={styles.cardDesc}>Cập nhật và theo dõi tiến độ</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(groups)/documents')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📂</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Tài liệu</Text>
              <Text style={styles.cardDesc}>Nộp và quản lý tài liệu</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructor Content */}
      {user?.role === 'INSTRUCTOR' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giảng viên</Text>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📅</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Quản lý lịch rảnh</Text>
              <Text style={styles.cardDesc}>Tạo và quản lý khung giờ hẹn</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>👥</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Nhóm hướng dẫn</Text>
              <Text style={styles.cardDesc}>Danh sách nhóm được phân công</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📝</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Đánh giá</Text>
              <Text style={styles.cardDesc}>Đánh giá tiến độ nhóm</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Admin Content */}
      {user?.role === 'ADMIN' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản trị</Text>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>👥</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Quản lý nhóm</Text>
              <Text style={styles.cardDesc}>Duyệt đề tài, phân công GVHD</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>👤</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Quản lý tài khoản</Text>
              <Text style={styles.cardDesc}>Tạo và chỉnh sửa người dùng</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📚</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Quản lý đề tài</Text>
              <Text style={styles.cardDesc}>Thêm và quản lý đề tài</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Semester Info */}
      <View style={styles.semesterCard}>
        <View style={styles.semesterHeader}>
          <Text style={styles.semesterTitle}>Spring 2026</Text>
          <Text style={styles.semesterBadge}>Học kỳ hiện tại</Text>
        </View>
        <Text style={styles.semesterDesc}>Khoa Công nghệ thông tin</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
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
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardArrow: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  semesterCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  semesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginRight: spacing.md,
  },
  semesterBadge: {
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  semesterDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
