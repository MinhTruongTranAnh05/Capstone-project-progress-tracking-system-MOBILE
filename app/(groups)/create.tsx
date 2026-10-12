import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateGroup } from '@/hooks';
import { colors, spacing, borderRadius } from '@/constants/colors';

export default function CreateGroupScreen() {
  const [groupCode, setGroupCode] = useState('');
  const [semester, setSemester] = useState('Spring 2026');
  const router = useRouter();

  const createGroup = useCreateGroup();

  const handleCreate = async () => {
    if (!semester) {
      Alert.alert('Lỗi', 'Vui lòng nhập học kỳ');
      return;
    }

    try {
      const result = await createGroup.mutateAsync({
        groupCode: groupCode || undefined,
        semester,
      });
      Alert.alert('Thành công', 'Nhóm đã được tạo!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tạo nhóm';
      Alert.alert('Lỗi', message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Thông tin nhóm</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Mã nhóm (tùy chọn)</Text>
          <Text style={styles.hint}>
            Để trống để hệ thống tự tạo mã nhóm
          </Text>
          <TextInput
            style={styles.input}
            placeholder="GRP-XXXXXX"
            value={groupCode}
            onChangeText={setGroupCode}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Học kỳ *</Text>
          <TextInput
            style={styles.input}
            placeholder="Spring 2026"
            value={semester}
            onChangeText={setSemester}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Lưu ý:</Text>
          <Text style={styles.infoText}>
            • Nhóm cần từ 3-5 thành viên để hoạt động
          </Text>
          <Text style={styles.infoText}>
            • Bạn sẽ trở thành trưởng nhóm
          </Text>
          <Text style={styles.infoText}>
            • Sau khi tạo, mời thành viên qua email hoặc mã sinh viên
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, createGroup.isPending && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={createGroup.isPending}
        >
          {createGroup.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tạo nhóm</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 4,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
