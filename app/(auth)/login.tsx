import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/services/storage';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { AuthPromoBanner } from '@/components/AuthPromoBanner';
import { GoogleAuthSection } from '@/components/GoogleAuthSection';
import { getErrorMessage } from '@/services/apiError';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, sessionNotice } = useAuth();

  useEffect(() => {
    storage.getRememberedEmail().then((savedEmail) => {
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (loading || googleLoading) return;
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);

      // Remembering the email is optional and must not turn a successful sign-in into an error.
      void storage.setRememberedEmail(rememberMe ? email.trim().toLowerCase() : null).catch(() => undefined);
    } catch (error) {
      Alert.alert('Lỗi đăng nhập', getErrorMessage(error, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Quên mật khẩu?',
      'Vui lòng liên hệ Phòng Đào tạo hoặc Quản trị viên (Admin) qua email trường để được cấp lại mật khẩu.'
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/fpt-bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Dark overlay with slight blur feel */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.keyboardContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Unified Card Container */}
          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              {/* Header / Logo */}
            <View style={styles.headerRow}>
              <View style={styles.logoBadge}>
                <View style={styles.logoInnerCheck}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.appName}>Lịch Đồ Án</Text>
                <Text style={styles.appSub}>Khoa Công nghệ thông tin</Text>
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Chào mừng trở lại</Text>
              <Text style={styles.subtitle}>
                Nhập email và mật khẩu của bạn để truy cập hệ thống đồ án tốt nghiệp.
              </Text>
            </View>

            {/* Form Fields */}
            {!!sessionNotice && <Text accessibilityRole="alert" style={styles.sessionNotice}>{sessionNotice}</Text>}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email trường (FPT)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@fpt.edu.vn"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Options row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={13} color="#fff" />}
                  </View>
                  <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, (loading || googleLoading) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading || googleLoading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Đăng nhập</Text>
                )}
              </TouchableOpacity>

              <GoogleAuthSection disabled={loading} onBusyChange={setGoogleLoading} />

              {/* Register Link */}
              <View style={styles.registerRow}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.registerLink}>Đăng ký ngay</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Copyright Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.copyrightText}>© 2026 Lịch Đồ Án FPT</Text>
              <Text style={styles.policyText}>Chính sách bảo mật</Text>
            </View>
          </View>

          {/* Promotional / Calendar Banner */}
          <AuthPromoBanner type="login" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
      </SafeAreaView>
  </ImageBackground>
);
}

const styles = StyleSheet.create({
  sessionNotice: { color: colors.error, fontSize: 13, lineHeight: 20, marginBottom: spacing.md },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 40, 37, 0.45)',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },
  cardWrapper: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  logoInnerCheck: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  headerTextGroup: {
    marginLeft: spacing.md,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  appSub: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  form: {
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 13.5,
    color: colors.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 13.5,
    color: colors.text,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberMeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12.5,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12.5,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  copyrightText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '500',
  },
  policyText: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
