import { useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { FontAwesome } from '@expo/vector-icons';
import { colors, borderRadius } from '@/constants/colors';

export interface GoogleSignInButtonProps {
  clientId: string;
  disabled: boolean;
  onCredential: (idToken: string) => Promise<void>;
  onError: (error: unknown) => void;
  onBusyChange: (busy: boolean) => void;
}

export function GoogleSignInButton({ clientId, disabled, onCredential, onError, onBusyChange }: GoogleSignInButtonProps) {
  const pending = useRef(false);
  const signIn = async () => {
    if (disabled || pending.current) return;
    pending.current = true;
    onBusyChange(true);
    try {
      if (Constants.appOwnership === 'expo') {
        throw new Error('Đăng nhập Google cần bản development build. Vui lòng dùng bản cài Android/iOS của ứng dụng.');
      }
      if (Platform.OS === 'ios' && !process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
        throw new Error('Chưa cấu hình Google cho iOS. Vui lòng liên hệ quản trị viên.');
      }
      // Load only after the Expo Go check; its binary does not contain this native module.
      const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin');
      GoogleSignin.configure({ webClientId: clientId, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID });
      if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Offer account selection again, including after an app logout or a failed backend login.
      if (GoogleSignin.hasPreviousSignIn()) await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();
      if (isSuccessResponse(result)) {
        if (!result.data.idToken) throw new Error('Google không trả về mã xác thực. Vui lòng thử lại.');
        await onCredential(result.data.idToken);
      }
    } catch (error) {
      onError(error);
    } finally {
      pending.current = false;
      onBusyChange(false);
    }
  };

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đăng nhập bằng Google"
      accessibilityState={{ disabled }} disabled={disabled} onPress={signIn}
      style={[styles.button, disabled && styles.disabled]} activeOpacity={0.8}>
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
