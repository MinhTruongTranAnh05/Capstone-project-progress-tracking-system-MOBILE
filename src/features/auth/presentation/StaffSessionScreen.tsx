import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { AuthFrame } from '@/core/ui/AuthFrame';
import { Button, ui } from '@/core/ui/primitives';
import { getErrorMessage } from '@/services/apiError';
import { authStyles } from './authStyles';

export default function StaffSessionScreen() {
  const { user, refreshUser, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const refresh = async () => {
    setBusy(true); setError(null);
    try { await refreshUser(); } catch (failure) { setError(failure); }
    finally { setBusy(false); }
  };
  return <AuthFrame><View style={{ gap: 14 }}>
    <Text accessibilityRole="header" style={authStyles.heading}>Đăng nhập thành công</Text>
    <Text style={authStyles.body}>{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Người điều phối'}</Text>
    <View style={ui.inset}><Text style={ui.strong}>{user?.fullName}</Text><Text style={authStyles.body}>{user?.email}</Text></View>
    <Text style={authStyles.body}>Các chức năng quản trị và điều phối được thực hiện trên phiên bản Web. Ứng dụng mobile cung cấp các luồng nhóm cho Sinh viên và Trưởng nhóm.</Text>
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text>}
    <Button title="Làm mới thông tin tài khoản" secondary busy={busy} onPress={() => void refresh()} />
    <Button title="Đăng xuất" onPress={() => void logout()} />
  </View></AuthFrame>;
}
