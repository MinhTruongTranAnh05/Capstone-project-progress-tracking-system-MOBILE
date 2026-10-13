import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { groupService } from '@/services/groupService';
import { topicService } from '@/services/topicService';
import { colors, spacing, borderRadius } from '@/constants/colors';

const SEMESTERS = ['Spring 2026', 'Summer 2026', 'Fall 2026', 'Spring 2027'];

export default function CreateGroupScreen() {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [groupCode, setGroupCode] = useState('');
  const [semester, setSemester] = useState('Spring 2026');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [topics, setTopics] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    topicService.getTopics({ status: 'PUBLISHED' }).then((res) => {
      setTopics(res?.content || res || []);
    }).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!semester) {
      Alert.alert('Lỗi', 'Vui lòng chọn học kỳ');
      return;
    }

    setLoading(true);
    try {
      await groupService.createGroup({
        groupCode: groupCode.trim() || undefined,
        semester,
        topicId: selectedTopicId || undefined,
      });

      Alert.alert('Thành công', 'Nhóm đồ án đã được tạo thành công! Bạn là Trưởng nhóm.', [
        { text: 'OK', onPress: () => router.replace('/(groups)') },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tạo nhóm';
      Alert.alert('Lỗi tạo nhóm', message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã nhóm hoặc mã mời!');
      return;
    }

    setLoading(true);
    try {
      // Find group by groupCode
      const res = await groupService.getGroups();
      const list = res?.content || res || [];
      const target = list.find(
        (g: any) =>
          g.groupCode?.toLowerCase() === inviteCode.trim().toLowerCase() ||
          g.id === inviteCode.trim()
      );

      if (!target) {
        Alert.alert('Không tìm thấy', 'Không tìm thấy nhóm với mã nhóm đã nhập.');
        return;
      }

      await groupService.joinGroup(target.id);
      Alert.alert('Thành công', 'Tham gia nhóm thành công!', [
        { text: 'OK', onPress: () => router.replace('/(groups)') },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi tham gia', err.response?.data?.message || 'Không thể tham gia nhóm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Sub Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'create' && styles.tabItemActive]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabItemText, activeTab === 'create' && styles.tabItemTextActive]}>
            Tạo nhóm mới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'join' && styles.tabItemActive]}
          onPress={() => setActiveTab('join')}
        >
          <Text style={[styles.tabItemText, activeTab === 'join' && styles.tabItemTextActive]}>
            Tham gia bằng mã
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' ? (
        <View style={styles.card}>
          <Text style={styles.title}>Thông tin nhóm đồ án</Text>
          <Text style={styles.desc}>
            Trưởng nhóm thiết lập thông tin cơ bản cho nhóm đồ án tốt nghiệp.
          </Text>

          {/* Group Code */}
          <View style={styles.field}>
            <Text style={styles.label}>Mã nhóm (Tùy chọn)</Text>
            <Text style={styles.hint}>Để trống để hệ thống tự động sinh mã (VD: G-2026-01)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: GRP-CAPSTONE"
              placeholderTextColor={colors.textMuted}
              value={groupCode}
              onChangeText={setGroupCode}
              autoCapitalize="characters"
            />
          </View>

          {/* Semester Selector */}
          <View style={styles.field}>
            <Text style={styles.label}>Học kỳ mở nhóm *</Text>
            <View style={styles.chipsRow}>
              {SEMESTERS.map((sem) => (
                <TouchableOpacity
                  key={sem}
                  style={[styles.chip, semester === sem && styles.chipActive]}
                  onPress={() => setSemester(sem)}
                >
                  <Text style={[styles.chipText, semester === sem && styles.chipTextActive]}>
                    {sem}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Topic Selector */}
          <View style={styles.field}>
            <Text style={styles.label}>Đề tài dự kiến (Tùy chọn)</Text>
            <Text style={styles.hint}>Có thể chọn ngay hoặc chọn sau khi nhóm đủ thành viên</Text>
            <View style={styles.topicList}>
              {topics.slice(0, 5).map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.topicChip, selectedTopicId === t.id && styles.topicChipActive]}
                  onPress={() => setSelectedTopicId(selectedTopicId === t.id ? '' : t.id)}
                >
                  <Ionicons
                    name={selectedTopicId === t.id ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={selectedTopicId === t.id ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[styles.topicChipText, selectedTopicId === t.id && styles.topicChipTextActive]}
                    numberOfLines={1}
                  >
                    {t.topicCode ? `[${t.topicCode}] ` : ''}
                    {t.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBox}>
            <View style={styles.infoBoxHeader}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.infoTitle}>Quy chế thành lập nhóm:</Text>
            </View>
            <Text style={styles.infoText}>• Số lượng thành viên hợp lệ: từ 4 đến 6 sinh viên.</Text>
            <Text style={styles.infoText}>• Người tạo nhóm sẽ giữ vai trò Trưởng nhóm (Group Leader).</Text>
            <Text style={styles.infoText}>• Sau khi tạo nhóm, dùng Mã nhóm để mời các thành viên tham gia.</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Tạo nhóm đồ án</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>Nhập mã nhóm đồ án</Text>
          <Text style={styles.desc}>
            Nhập mã nhóm do Trưởng nhóm cung cấp để gửi yêu cầu gia nhập.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Mã nhóm / Mã mời *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: GRP-2026-01"
              placeholderTextColor={colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleJoinByCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Tham gia nhóm</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    gap: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 3,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabItemTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
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
    gap: 8,
  },
  chip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  topicList: {
    gap: 6,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  topicChipActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  topicChipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  topicChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: colors.primary50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary100,
    padding: spacing.md,
    gap: 4,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  infoText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
