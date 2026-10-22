import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export function SessionStatus() {
  const { isLoading, startupError, restoreSession, logout } = useAuth();
  return (
    <View style={styles.container}>
      {isLoading ? <>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Đang xác minh phiên đăng nhập...</Text>
      </> : <>
        <Text accessibilityRole="alert" style={styles.message}>{startupError}</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => void restoreSession()}>
          <Text style={styles.buttonText}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => void logout()}>
          <Text style={styles.link}>Về đăng nhập</Text>
        </TouchableOpacity>
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  message: { color: colors.text, textAlign: 'center', fontSize: 14, lineHeight: 22 },
  button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  buttonText: { color: colors.textLight, fontWeight: '700' },
  link: { color: colors.primary, fontWeight: '700', padding: spacing.sm },
});
