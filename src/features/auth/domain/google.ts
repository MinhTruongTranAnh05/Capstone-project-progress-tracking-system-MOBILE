export function googleServerClientId(platform: string, browserClientId?: string, mobileClientId?: string): string | undefined {
  return (platform === 'web' ? browserClientId : mobileClientId)?.trim() || undefined;
}

export function nativeGoogleUnavailableReason(expoGo: boolean, platform: string, iosClientId?: string, mobileClientId?: string): string | null {
  if (expoGo) return 'Đăng nhập Google dành cho sinh viên cần bản cài MatchPoint FPT. Vui lòng mở bản cài thay cho Expo Go.';
  if (platform === 'ios' && !iosClientId?.trim()) return 'Bản cài chưa được cấu hình đăng nhập Google cho iOS. Vui lòng liên hệ hỗ trợ.';
  if (!mobileClientId?.trim()) return 'Bản cài chưa được cấu hình đăng nhập Google. Vui lòng liên hệ hỗ trợ.';
  return null;
}
