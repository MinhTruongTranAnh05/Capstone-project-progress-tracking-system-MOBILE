import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services';
import { GoogleLoginConfig } from '@/types/auth';
import { Campus } from '@/types/models';
import { colors, borderRadius, spacing } from '@/constants/colors';

const CAMPUSES: { label: string; value: Campus }[] = [
  { label: 'TP. HCM', value: 'HO_CHI_MINH' },
  { label: 'Hà Nội', value: 'HA_NOI' },
  { label: 'Đà Nẵng', value: 'DA_NANG' },
  { label: 'Cần Thơ', value: 'CAN_THO' },
  { label: 'Quy Nhơn', value: 'QUY_NHON' },
];

const ERROR_MESSAGES: Record<string, string> = {
  REGISTRATION_REQUIRED: 'Vui lòng đăng ký tài khoản với MSSV và chờ quản trị viên duyệt trước khi đăng nhập Google.',
  ACCOUNT_PENDING_APPROVAL: 'Tài khoản đang chờ quản trị viên phê duyệt.',
  ACCOUNT_NOT_PROVISIONED: 'Tài khoản chưa được cấp. Vui lòng liên hệ quản trị viên.',
  CAMPUS_MISMATCH: 'Cơ sở đã chọn không khớp với tài khoản. Vui lòng chọn lại cơ sở.',
  WORKSPACE_REQUIRED: 'Vui lòng sử dụng tài khoản Google Workspace của trường.',
  GOOGLE_NOT_CONFIGURED: 'Hệ thống chưa cấu hình đăng nhập Google. Vui lòng liên hệ quản trị viên.',
  PLAY_SERVICES_NOT_AVAILABLE: 'Thiết bị cần Google Play Services để đăng nhập Google.',
};

export function GoogleAuthSection({ campus, disabled, onBusyChange }: {
  campus?: Campus;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [settings, setSettings] = useState<GoogleLoginConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const effectiveCampus = campus ?? selectedCampus;

  const loadSettings = async () => {
    setConfigLoading(true);
    setConfigError('');
    try {
      const result = await authService.getGoogleConfig();
      if (mounted.current) setSettings(result);
    } catch {
      if (mounted.current) setConfigError('Không thể tải cấu hình Google.');
    } finally {
      if (mounted.current) setConfigLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    void loadSettings();
    return () => { mounted.current = false; };
  }, []);

  const handleBusyChange = (value: boolean) => {
    if (!mounted.current) return;
    setBusy(value);
    onBusyChange(value);
    if (value) setError('');
  };

  const handleError = (error: unknown) => {
    if (!mounted.current) return;
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      setError(ERROR_MESSAGES[data?.errorCode] || data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } else {
      const nativeError = error as { code?: string; message?: string };
      setError(ERROR_MESSAGES[nativeError?.code ?? ''] || nativeError?.message || 'Không thể đăng nhập Google. Vui lòng thử lại.');
    }
  };

  return <View style={styles.section}>
    <View style={styles.divider}><View style={styles.line} /><Text style={styles.muted}>hoặc</Text><View style={styles.line} /></View>
    {!campus && <>
      <Text style={styles.label}>Chọn cơ sở để đăng nhập Google</Text>
      <View style={styles.campuses}>{CAMPUSES.map((item) => <TouchableOpacity key={item.value}
        accessibilityRole="radio" accessibilityState={{ checked: selectedCampus === item.value, disabled: disabled || busy }}
        disabled={disabled || busy} onPress={() => { setSelectedCampus(item.value); setError(''); }}
        style={[styles.chip, selectedCampus === item.value && styles.selected]}>
        <Text style={[styles.chipText, selectedCampus === item.value && { color: colors.primary }]}>{item.label}</Text>
      </TouchableOpacity>)}</View>
    </>}
    {configLoading ? <ActivityIndicator color={colors.primary} /> : configError ?
      <TouchableOpacity accessibilityRole="button" onPress={loadSettings}><Text style={styles.error}>{configError} Nhấn để thử lại.</Text></TouchableOpacity>
      : settings?.enabled && settings.clientId ?
        <GoogleSignInButton clientId={process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || settings.clientId}
          disabled={disabled || busy || !effectiveCampus} onBusyChange={handleBusyChange} onError={handleError}
          onCredential={async (idToken) => {
            if (!effectiveCampus) throw new Error('Vui lòng chọn cơ sở đào tạo.');
            await loginWithGoogle({ idToken, campus: effectiveCampus });
            if (mounted.current) router.replace('/(tabs)');
          }} />
      : <Text style={styles.muted}>Đăng nhập Google chưa được bật trên hệ thống.</Text>}
    {busy && <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Text style={styles.hint}>Dùng tài khoản trường hoặc tài khoản đã được phê duyệt. Tài khoản cá nhân mới cần đăng ký và chờ duyệt trước.</Text>
  </View>;
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg, gap: spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  muted: { fontSize: 12, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '700', color: colors.text },
  campuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  selected: { borderColor: colors.primary, backgroundColor: colors.primary50 },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  error: { color: colors.error, fontSize: 12, lineHeight: 18 },
  hint: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
});
