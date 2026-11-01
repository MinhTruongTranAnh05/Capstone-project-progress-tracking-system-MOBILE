import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Button, ui } from './FormationUI';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { getErrorMessage, SessionError } from '@/services/apiError';
import type { Campus, GoogleLoginConfig } from '@/types/auth';
import { colors } from '@/constants/colors';
import axios from 'axios';

export function GoogleAuthSection({ campus }: { campus?: Campus }) {
  const { loginWithGoogle } = useAuth();
  const [settings, setSettings] = useState<GoogleLoginConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [configError, setConfigError] = useState('');
  const mounted = useRef(false);
  const load = async () => {
    setLoading(true); setConfigError('');
    try { const result = await authService.getGoogleConfig(); if (mounted.current) setSettings(result); }
    catch (error) { if (mounted.current) setConfigError(getErrorMessage(error)); }
    finally { if (mounted.current) setLoading(false); }
  };
  useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; }; }, []);
  return <View style={{ gap: 14 }}>
    {loading ? <><ActivityIndicator color={colors.primary} /><Text style={ui.text}>Đang kiểm tra đăng nhập Google...</Text></>
      : configError ? <><Text accessibilityRole="alert" style={ui.error}>{configError}</Text><Button title="Thử lại" secondary onPress={() => void load()} /></>
      : settings?.enabled && settings.clientId ? <GoogleSignInButton clientId={process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || settings.clientId}
          disabled={busy || !campus} onBusyChange={value => { if (mounted.current) { setBusy(value); if (value) setError(''); } }}
          onCredential={async idToken => { if (!campus) throw new Error('Vui lòng chọn cơ sở.'); await loginWithGoogle({ idToken, campus }); }}
          onError={error => {
            if (!mounted.current) return;
            setError(axios.isAxiosError(error) || error instanceof SessionError ? getErrorMessage(error) : error instanceof Error ? error.message : 'Đăng nhập Google thất bại. Vui lòng thử lại.');
          }} />
      : <Text style={ui.notice}>Đăng nhập Google chưa được bật trên hệ thống. Vui lòng liên hệ quản trị viên.</Text>}
    {busy && <ActivityIndicator color={colors.primary} />}
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    <Text style={ui.text}>Chọn cơ sở và dùng tài khoản Google Workspace của trường đã được cấp. Tài khoản email cá nhân cần đăng ký và được quản trị viên phê duyệt trước.</Text>
  </View>;
}
