import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services';
import { Campus } from '@/types/models';
import { RegisterRequest } from '@/types/auth';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { AuthPromoBanner } from '@/components/AuthPromoBanner';
import { GoogleAuthSection } from '@/components/GoogleAuthSection';

const CAMPUSES: { label: string; value: Campus }[] = [
  { label: 'TP. HCM', value: 'HO_CHI_MINH' },
  { label: 'Hà Nội', value: 'HA_NOI' },
  { label: 'Đà Nẵng', value: 'DA_NANG' },
  { label: 'Cần Thơ', value: 'CAN_THO' },
  { label: 'Quy Nhơn', value: 'QUY_NHON' },
];

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [campus, setCampus] = useState<Campus>('HO_CHI_MINH');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (loading || googleLoading) return;
    if (!agreeTerms) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với Điều khoản sử dụng và Quy định đào tạo!');
      return;
    }

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (!studentCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mã số sinh viên (MSSV)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Lỗi', 'Email không hợp lệ! Vui lòng nhập đúng định dạng example@fpt.edu.vn');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterRequest = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        campus,
        studentCode: studentCode.trim().toUpperCase(),
      };


      await authService.register(payload);

      Alert.alert(
        'Thành công',
        'Đã gửi đăng ký. Vui lòng chờ quản trị viên phê duyệt tài khoản trước khi đăng nhập.',
        [{ text: 'Về đăng nhập', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!';
      Alert.alert('Lỗi đăng ký', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/fpt-bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
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
          {/* Main Unified Card */}
          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              {/* Logo */}
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

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Tạo tài khoản mới</Text>
              <Text style={styles.subtitle}>
                Đăng ký tài khoản để bắt đầu hành trình đồ án tốt nghiệp.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã số sinh viên (MSSV) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="SE171245"
                  placeholderTextColor={colors.textMuted}
                  value={studentCode}
                  onChangeText={setStudentCode}
                  autoCapitalize="characters"
                />
              </View>

              {/* Campus Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cơ sở đào tạo</Text>
                <View style={styles.chipsRow}>
                  {CAMPUSES.map((c) => (
                    <TouchableOpacity
                      key={c.value}
                      style={[
                        styles.chip,
                        campus === c.value && styles.chipActive,
                      ]}
                      onPress={() => setCampus(c.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          campus === c.value && styles.chipTextActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email trường (FPT) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@fpt.edu.vn"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Tối thiểu 8 ký tự"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Agree terms checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <Text style={styles.termsText}>
                  Tôi đồng ý với <Text style={styles.termsHighlight}>Điều khoản sử dụng</Text> & Quy chế đồ án FPT
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, (loading || googleLoading) && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading || googleLoading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Tạo tài khoản</Text>
                )}
              </TouchableOpacity>

              <GoogleAuthSection campus={campus} disabled={loading} onBusyChange={setGoogleLoading} />

              {/* Back to Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.loginLink}>Đăng nhập ngay</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.copyrightText}>© 2026 Lịch Đồ Án FPT</Text>
              <Text style={styles.policyText}>Chính sách bảo mật</Text>
            </View>
          </View>

          {/* Promotional / Progress Banner */}
          <AuthPromoBanner type="register" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
      </SafeAreaView>
  </ImageBackground>
);
}

const styles = StyleSheet.create({
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
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 17,
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
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '800',
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
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
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
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  termsHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.xs,
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
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12.5,
  },
  loginLink: {
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
