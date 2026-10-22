import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/colors';

interface AuthPromoBannerProps {
  type?: 'login' | 'register';
  title?: string;
  subtitle?: string;
}

const FEATURES = [
  {
    title: 'Bắt đầu hành trình đồ án',
    description: 'Đăng ký tài khoản sinh viên và theo dõi trạng thái phê duyệt',
  },
  {
    title: 'Tạo nhóm & quản lý thành viên',
    description: 'Tạo nhóm · Tham gia nhóm · Theo dõi thông tin thành viên',
  },
  {
    title: 'Tuyển thành viên vào nhóm',
    description: 'Apply vào nhóm · Gửi lời mời · Duyệt hoặc từ chối · Chấp nhận hoặc thu hồi',
  },
  {
    title: 'Theo dõi đồ án',
    description: 'Xem danh mục đề tài, tiến độ tuần và tài liệu của nhóm',
  },
];

export const AuthPromoBanner: React.FC<AuthPromoBannerProps> = ({ title, subtitle }) => (
  <View style={styles.panel}>
    <View style={styles.badge}>
      <Text style={styles.badgeText}>HỆ THỐNG QUẢN LÝ ĐỒ ÁN</Text>
    </View>
    <Text style={styles.heading}>{title || 'Quản lý sinh viên'}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

    <View style={styles.features}>
      {FEATURES.map((feature, index) => (
        <View key={feature.title} style={styles.feature}>
          <View style={styles.numberBadge}>
            <Text style={styles.number}>{index + 1}</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.description}>{feature.description}</Text>
          </View>
        </View>
      ))}
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>Khoa Công nghệ thông tin</Text>
      <Text style={styles.footerText}>Đại học FPT TP.HCM</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: spacing.xl,
    paddingTop: 24,
    paddingBottom: 32,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  badgeText: {
    color: colors.textLight,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heading: {
    color: colors.textLight,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    marginTop: 10,
  },
  subtitle: {
    color: colors.textLight,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  features: {
    marginTop: 24,
    gap: 10,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.23)',
    borderRadius: 14,
    minHeight: 82,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },
  numberBadge: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  featureContent: {
    flex: 1,
    minWidth: 0,
  },
  featureTitle: {
    color: colors.textLight,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'column',
    rowGap: 4,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    lineHeight: 16,
  },
});
