import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { passwordLoginSchema } from '@/core/validation/auth';
import { getErrorMessage } from '@/services/apiError';
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
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const submit = async () => {
    if (disabled || pending.current) return;
    pending.current = true;
    setBusy(true);
    onBusyChange(true);
    setError(null);
    try {
      await loginWithPassword(passwordLoginSchema.parse({ email, password }));
    } catch (failure) {
      if (mounted.current) setError(failure);
    } finally {
      pending.current = false;
      if (mounted.current) { setBusy(false); onBusyChange(false); }
    }
  };

  return <View style={{ gap: 12 }}>
    <View style={{ gap: 4 }}><Text style={authStyles.label}>Email</Text>
      <TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} placeholder="admin@fpt.edu.vn" placeholderTextColor={colors.textMuted}
        autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" textContentType="username"
        editable={!disabled} style={authStyles.input} />
    </View>
    <View style={{ gap: 4 }}><Text style={authStyles.label}>Mật khẩu</Text>
      <View style={[authStyles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0, paddingRight: 0 }]}>
        <TextInput accessibilityLabel="Mật khẩu" value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password"
          editable={!disabled} returnKeyType="go" onSubmitEditing={() => void submit()}
          style={{ flex: 1, minWidth: 0, minHeight: 46, color: colors.authText, fontSize: 13, paddingVertical: 12 }} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} disabled={disabled}
          onPress={() => setVisible(value => !value)} style={{ minWidth: 52, minHeight: 46, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[authStyles.label, { color: colors.authBody }]}>{visible ? 'Ẩn' : 'Hiện'}</Text>
        </TouchableOpacity>
      </View>
    </View>
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text>}
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled, busy }} disabled={disabled} onPress={() => void submit()}
      style={[authStyles.primaryButton, disabled && { opacity: 0.55 }]}>
      {busy ? <ActivityIndicator color={colors.textLight} /> : <Text style={authStyles.primaryButtonText}>Đăng nhập Quản trị / Điều phối</Text>}
    </TouchableOpacity>
  </View>;
}
