import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { passwordLoginSchema } from '@/core/validation/auth';
import { getErrorMessage, getFieldErrors } from '@/services/apiError';
import type { PasswordLoginRequest } from '@/types/auth';
import { colors } from '@/constants/colors';
import { ui } from '@/core/ui/primitives';
import { authStyles } from './authStyles';

export function PasswordLoginForm({ disabled, onBusyChange }: { disabled: boolean; onBusyChange: (busy: boolean) => void }) {
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PasswordLoginRequest, string>>>({});
  const unavailable = disabled || busy;
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const submit = async () => {
    if (disabled || pending.current) return;
    setError(null);
    const result = passwordLoginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    pending.current = true;
    setBusy(true);
    onBusyChange(true);
    try {
      await loginWithPassword(result.data);
    } catch (failure) {
      if (mounted.current) setError(failure);
    } finally {
      pending.current = false;
      if (mounted.current) { setBusy(false); onBusyChange(false); }
    }
  };

  return <View style={{ gap: 12 }}>
    <View style={{ gap: 4 }}><Text style={authStyles.label}>Email</Text>
      <TextInput accessibilityLabel="Email" accessibilityHint={fieldErrors.email} value={email} onChangeText={value => { setEmail(value); setFieldErrors(old => ({ ...old, email: undefined })); setError(null); }} placeholder="Nhập email tài khoản" placeholderTextColor={colors.textMuted}
        autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" textContentType="username"
        editable={!unavailable} style={[authStyles.input, fieldErrors.email && { borderColor: colors.error }]} />
      {!!fieldErrors.email && <Text accessibilityRole="alert" style={authStyles.fieldError}>{fieldErrors.email}</Text>}
    </View>
    <View style={{ gap: 4 }}><Text style={authStyles.label}>Mật khẩu</Text>
      <View style={[authStyles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0, paddingRight: 0 }, fieldErrors.password && { borderColor: colors.error }]}>
        <TextInput accessibilityLabel="Mật khẩu" accessibilityHint={fieldErrors.password} value={password} onChangeText={value => { setPassword(value); setFieldErrors(old => ({ ...old, password: undefined })); setError(null); }} placeholder="Nhập mật khẩu" placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password"
          editable={!unavailable} returnKeyType="go" onSubmitEditing={() => void submit()}
          style={{ flex: 1, minWidth: 0, minHeight: 46, color: colors.authText, fontSize: 13, paddingVertical: 12 }} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} disabled={unavailable}
          onPress={() => setVisible(value => !value)} style={{ minWidth: 52, minHeight: 46, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[authStyles.label, { color: colors.authBody }]}>{visible ? 'Ẩn' : 'Hiện'}</Text>
        </TouchableOpacity>
      </View>
      {!!fieldErrors.password && <Text accessibilityRole="alert" style={authStyles.fieldError}>{fieldErrors.password}</Text>}
    </View>
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text>}
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: unavailable, busy }} disabled={unavailable} onPress={() => void submit()}
      style={[authStyles.primaryButton, unavailable && { opacity: 0.55 }]}>
      {busy ? <ActivityIndicator color={colors.textLight} /> : <Text style={authStyles.primaryButtonText}>Đăng nhập Quản trị / Điều phối</Text>}
    </TouchableOpacity>
  </View>;
}
