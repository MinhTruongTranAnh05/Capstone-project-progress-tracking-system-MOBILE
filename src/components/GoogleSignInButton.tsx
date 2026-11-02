import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { FontAwesome } from '@expo/vector-icons';
import { colors, borderRadius } from '@/constants/colors';
import { nativeGoogleUnavailableReason } from '@/features/auth/domain/google';
import { getNativeGoogleCredential } from '@/features/auth/data/nativeGoogle';

export function getGoogleSignInUnavailableReason(): string | null {
  return nativeGoogleUnavailableReason(isRunningInExpoGo(), Platform.OS, process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
}

export interface GoogleSignInButtonProps {
  clientId: string;
  disabled: boolean;
  onCredential: (idToken: string) => Promise<void>;
  onError: (error: unknown) => void;
  onBusyChange: (busy: boolean) => void;
}

export function GoogleSignInButton({ clientId, disabled, onCredential, onError, onBusyChange }: GoogleSignInButtonProps) {
  const pending = useRef(false);
  const generation = useRef(0);
  useEffect(() => { generation.current += 1; return () => { generation.current += 1; }; }, []);
  const unavailable = getGoogleSignInUnavailableReason();
  const signIn = async () => {
    if (disabled || unavailable || pending.current) return;
    const attempt = generation.current;
    pending.current = true;
    onBusyChange(true);
    try {
      // Load only after the Expo Go check; its binary does not contain this native module.
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      const idToken = await getNativeGoogleCredential(GoogleSignin, {
        platform: Platform.OS, webClientId: clientId, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });
      if (idToken && generation.current === attempt) await onCredential(idToken);
    } catch (error) {
      if (generation.current === attempt) onError(error);
    } finally {
      pending.current = false;
      if (generation.current === attempt) onBusyChange(false);
    }
  };

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đăng nhập bằng Google"
      accessibilityState={{ disabled: disabled || !!unavailable }} disabled={disabled || !!unavailable} onPress={signIn}
      style={[styles.button, (disabled || !!unavailable) && styles.disabled]} activeOpacity={0.8}>
      <FontAwesome name="google" size={20} color="#4285F4" />
      <Text style={styles.label}>Đăng nhập bằng Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 12 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  disabled: { opacity: 0.5 },
});
