import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

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

  const getCampusLabel = () => {
    switch (user?.campus) {
      case 'HO_CHI_MINH':
        return 'TP. Hồ Chí Minh';
      case 'HA_NOI':
        return 'Hà Nội';
      case 'DA_NANG':
        return 'Đà Nẵng';
      case 'CAN_THO':
        return 'Cần Thơ';
      case 'QUY_NHON':
        return 'Quy Nhơn';
      default:
        return user?.campus || 'Chưa cập nhật';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.fullName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleLabel()}</Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cơ sở</Text>
            <Text style={styles.infoValue}>{getCampusLabel()}</Text>
          </View>
          {user?.studentCode && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>MSSV</Text>
                <Text style={styles.infoValue}>{user.studentCode}</Text>
              </View>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vai trò</Text>
            <Text style={styles.infoValue}>{getRoleLabel()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>
                {user?.status === 'ACTIVE' ? 'Hoạt động' : user?.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bio & Skills */}
      {(user?.bio || user?.skills) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <View style={styles.infoCard}>
            {user?.bio && (
              <>
                <Text style={styles.bioLabel}>Bio</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </>
            )}
            {user?.skills && (
              <>
                <Text style={styles.bioLabel}>Kỹ năng</Text>
                <Text style={styles.bioText}>{user.skills}</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Cài đặt thông báo</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Hỗ trợ</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Phiên bản 1.0.0</Text>
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
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bioLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bioText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  menuText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.errorLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
