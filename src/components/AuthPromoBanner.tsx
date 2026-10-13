import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/colors';

interface AuthPromoBannerProps {
  type?: 'login' | 'register';
  title?: string;
  subtitle?: string;
}

export const AuthPromoBanner: React.FC<AuthPromoBannerProps> = ({
  type = 'register',
  title,
  subtitle,
}) => {
  const isLogin = type === 'login';

  const defaultTitle = isLogin
    ? 'Quản lý lịch trình & tiến độ đồ án tốt nghiệp dễ dàng.'
    : 'Một tài khoản, theo dõi trọn hành trình đồ án.';

  const defaultSubtitle = isLogin
    ? 'Đăng nhập để theo dõi lịch hẹn với giảng viên, kiểm tra các mốc thời gian và quản lý đề tài của nhóm bạn.'
    : 'Đăng ký ngay để kết nối với giảng viên hướng dẫn, chủ động đặt lịch hẹn và nộp tài liệu đúng hạn.';

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  return (
    <View style={styles.bannerContainer}>
      {/* Decorative ambient background circle */}
      <View style={styles.ambientCircle} />

      {/* Header section */}
      <View style={styles.headerSection}>
        <Text style={styles.headline}>{displayTitle}</Text>
        <Text style={styles.subheadline}>{displaySubtitle}</Text>
      </View>

      {/* Outer translucent card wrapper */}
      <View style={styles.outerCard}>
        {/* Inner white card */}
        <View style={styles.innerCard}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={styles.titleWithDot}>
              <View style={styles.dot} />
              <Text style={styles.cardTitle}>
                {isLogin ? 'Lịch hẹn tuần này (Calendar)' : 'Tiến độ đồ án tốt nghiệp'}
              </Text>
            </View>
            <View style={styles.semesterBadge}>
              <Text style={styles.semesterText}>Spring 2026</Text>
            </View>
          </View>

          {/* Body Content */}
          {isLogin ? (
            /* Login Calendar Slots (horizontal or responsive row) */
            <View style={styles.calendarList}>
              <View style={styles.calendarItemOrange}>
                <Text style={styles.calendarDayOrange}>Thứ Hai</Text>
                <Text style={styles.calendarTimeOrange}>09:00 - Duyệt đề cương</Text>
              </View>
              <View style={styles.calendarItemNormal}>
                <Text style={styles.calendarDayNormal}>Thứ Tư</Text>
                <Text style={styles.calendarTimeNormal}>14:00 - Báo cáo tiến độ</Text>
              </View>
              <View style={styles.calendarItemEmerald}>
                <Text style={styles.calendarDayEmerald}>Thứ Sáu</Text>
                <Text style={styles.calendarTimeEmerald}>10:30 - Chấm hội đồng</Text>
              </View>
            </View>
          ) : (
            /* Register Progress Rows */
            <View style={styles.rowsList}>
              <View style={styles.stepRow}>
                <Text style={styles.stepLabelActive}>1. Đăng ký đề tài & Nhóm</Text>
                <Text style={styles.statusCompleted}>Hoàn thành ✓</Text>
              </View>

              <View style={styles.stepRowHighlight}>
                <Text style={styles.stepLabelHighlight}>2. Đặt lịch hẹn với GVHD</Text>
                <Text style={styles.statusOngoing}>Đang diễn ra</Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepLabelUpcoming}>3. Bảo vệ hội đồng</Text>
                <Text style={styles.statusUpcoming}>Sắp tới</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Bottom department text */}
      <Text style={styles.footerText}>
        Khoa Công nghệ thông tin · Đại học FPT TP.HCM
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 28,
    marginBottom: 6,
  },
  subheadline: {
    color: 'rgba(255, 245, 235, 0.9)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  outerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginVertical: spacing.sm,
  },
  innerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 10,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
    marginRight: 7,
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  semesterBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  semesterText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  // Calendar items for Login
  calendarList: {
    gap: 7,
  },
  calendarItemOrange: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarDayOrange: {
    fontWeight: '800',
    fontSize: 11.5,
    color: colors.primary,
  },
  calendarTimeOrange: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  calendarItemNormal: {
    backgroundColor: '#FBF9F5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3EFEA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarDayNormal: {
    fontWeight: '700',
    fontSize: 11.5,
    color: '#374151',
  },
  calendarTimeNormal: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  calendarItemEmerald: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarDayEmerald: {
    fontWeight: '800',
    fontSize: 11.5,
    color: '#059669',
  },
  calendarTimeEmerald: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  // Progress rows for Register
  rowsList: {
    gap: 7,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FBF9F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#F3EFEA',
  },
  stepRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  stepLabelActive: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#374151',
  },
  statusCompleted: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  stepLabelHighlight: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  statusOngoing: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  stepLabelUpcoming: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  statusUpcoming: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  footerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 245, 235, 0.85)',
    marginTop: 10,
  },
});
