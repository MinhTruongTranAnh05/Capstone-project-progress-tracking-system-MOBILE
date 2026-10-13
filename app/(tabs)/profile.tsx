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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
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
        return 'Quản trị viên (Admin)';
      case 'INSTRUCTOR':
        return 'Giảng viên hướng dẫn';
      case 'GROUP_LEADER':
        return 'Trưởng nhóm (Group Leader)';
      default:
        return 'Sinh viên (Student)';
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
        return user?.campus || 'TP. Hồ Chí Minh';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SV';
    const words = name.trim().split(' ');
    return words.length > 1
      ? words[words.length - 2][0] + words[words.length - 1][0]
      : words[0].slice(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>Hồ sơ cá nhân · Account Settings</Text>
        </View>
        <Text style={styles.bannerTitle}>Thông tin tài khoản & Chức vụ</Text>
        <Text style={styles.bannerDesc}>
          Xem thông tin định danh và vai trò trong hệ thống đồ án.
        </Text>
      </View>

      {/* Avatar & Role Card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
        </View>

        <View style={styles.avatarInfo}>
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>{user?.role || 'STUDENT'}</Text>
        </View>
      </View>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsCardTitle}>Chi tiết tài khoản</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Họ và tên</Text>
          <Text style={styles.value}>{user?.fullName || 'Chưa cập nhật'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email hệ thống</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        {user?.studentCode ? (
          <View style={styles.row}>
            <Text style={styles.label}>Mã số sinh viên (MSSV)</Text>
            <Text style={styles.valueHighlight}>{user.studentCode}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>Khoa / Chuyên ngành</Text>
          <Text style={styles.value}>{user?.department || 'Kỹ thuật phần mềm'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cơ sở đào tạo</Text>
          <Text style={styles.value}>{getCampusLabel()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Vai trò trong hệ thống</Text>
          <Text style={styles.value}>{getRoleLabel()}</Text>
        </View>

        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.label}>Trạng thái tài khoản</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Hoạt động (ACTIVE)</Text>
          </View>
        </View>
      </View>

      {/* Admin Notice */}
      <View style={styles.noticeCard}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.noticeText}>
          Để thay đổi thông tin cá nhân hoặc vai trò, vui lòng liên hệ Ban Đào tạo hoặc Quản trị viên (Admin).
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <Text style={styles.logoutBtnText}>Đăng xuất khỏi hệ thống</Text>
      </TouchableOpacity>
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
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  banner: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
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
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: colors.primary50,
    borderWidth: 2,
    borderColor: colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  avatarInfo: {
    alignItems: 'center',
    gap: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rolePill: {
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    marginTop: 2,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  detailsCardTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  value: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.text,
  },
  valueHighlight: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.success50,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.success,
  },
  noticeCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  logoutBtn: {
    backgroundColor: colors.error50,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.error,
  },
});
