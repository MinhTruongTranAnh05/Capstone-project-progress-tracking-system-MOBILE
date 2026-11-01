import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthPromoBanner } from '@/components/AuthPromoBanner';
import { colors, borderRadius } from '@/constants/colors';
import { authStyles } from '@/features/auth/presentation/authStyles';

export function AuthFrame({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const showPromo = Platform.OS === 'web' && width >= 880;
  return <View style={{ flex: 1 }}>
    <Image source={require('../../../assets/fpt-bg.jpg')} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={1} />
    <View style={{ position: 'absolute', inset: 0, backgroundColor: colors.authOverlay }} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, padding: width >= 480 ? 24 : 16, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: showPromo ? 896 : 448, borderRadius: borderRadius['2xl'], borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden', backgroundColor: colors.authCard, flexDirection: showPromo ? 'row' : 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <View style={{ flex: 1, padding: width >= 480 ? 36 : 24, gap: 16 }}>
          <View style={authStyles.brandRow}><View style={authStyles.logo}><Text style={authStyles.logoText}>✓</Text></View><Text style={authStyles.brand}>MatchPoint FPT</Text></View>
          {children}
          <View style={authStyles.footer}><Text style={authStyles.footerText}>© 2026 Đại học FPT</Text><Text style={authStyles.footerText}>Hệ thống Đồ án tốt nghiệp Đại học FPT</Text></View>
        </View>
        {showPromo && <AuthPromoBanner />}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
