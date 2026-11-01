import type { ReactNode } from 'react';
import { ImageBackground, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthPromoBanner } from '@/components/AuthPromoBanner';
import { colors, borderRadius, spacing } from '@/constants/colors';

export function AuthFrame({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return <ImageBackground source={require('../../../assets/fpt-bg.jpg')} style={{ flex: 1 }} resizeMode="cover">
    <View style={{ position: 'absolute', inset: 0, backgroundColor: colors.overlayDark }} />
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, padding: spacing.xl, paddingTop: insets.top + spacing['2xl'], paddingBottom: insets.bottom + spacing['2xl'], justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 896, borderRadius: borderRadius['2xl'], overflow: 'hidden', backgroundColor: colors.surface, flexDirection: width >= 880 ? 'row' : 'column', boxShadow: '0 16px 48px rgba(44,40,37,0.18)' }}>
        <View style={{ flex: 1, padding: width >= 640 ? 36 : 28, gap: spacing['2xl'], justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}><View style={{ width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.textLight, fontSize: 20, fontWeight: '800' }}>✓</Text></View><Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>MatchPoint FPT</Text></View>
          {children}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg }}><Text style={{ color: colors.textMuted, fontSize: 11 }}>© 2026 Đại học FPT · Cổng sinh viên</Text></View>
        </View>
        <AuthPromoBanner />
      </View>
    </ScrollView>
  </ImageBackground>;
}
