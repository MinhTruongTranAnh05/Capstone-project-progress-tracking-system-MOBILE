import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Button, ui } from './FormationUI';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/apiError';
import { colors } from '@/constants/colors';

export function GoogleAuthSection() {
  const { loginWithGoogle } = useAuth();
  const settings = useQuery({ queryKey: ['public', 'googleConfig'], queryFn: authService.getGoogleConfig });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return <View style={{ gap: 14 }}>
    {settings.isPending ? <><ActivityIndicator color={colors.primary} /><Text style={ui.text}>Đang kiểm tra đăng nhập Google...</Text></>
      : settings.isError ? <><Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(settings.error)}</Text><Button title="Thử lại" secondary onPress={() => void settings.refetch()} /></>
      : settings.data?.enabled && settings.data.clientId ? <GoogleSignInButton clientId={process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || settings.data.clientId}
        disabled={busy} onBusyChange={value => { if (mounted.current) { setBusy(value); if (value) setError(null); } }}
        onCredential={async idToken => { await loginWithGoogle({ idToken }); }}
        onError={failure => { if (mounted.current) setError(failure); }} />
      : <Text style={ui.notice}>Đăng nhập Google chưa được bật trên hệ thống. Vui lòng liên hệ Người điều phối.</Text>}
    {busy && <ActivityIndicator color={colors.primary} />}
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text>}
    <Text style={ui.text}>Dùng email Google cá nhân đã có trong danh sách của phòng đào tạo. Tài khoản @fpt.edu.vn không được hỗ trợ cho đăng nhập sinh viên.</Text>
  </View>;
}
