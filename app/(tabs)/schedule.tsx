import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { scheduleService } from '@/services/scheduleService';
import { topicService } from '@/services/topicService';
import { groupService } from '@/services/groupService';
import { colors, spacing, borderRadius } from '@/constants/colors';
import { Slot } from '@/types/models';

type TabType = 'available' | 'booked' | 'questions';

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingQ, setSubmittingQ] = useState(false);
  const [userGroup, setUserGroup] = useState<any>(null);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const groupsRes = await groupService.getGroups({ memberId: user.id });
      const groupList = groupsRes?.content || groupsRes || [];
      if (groupList.length > 0) {
        setUserGroup(groupList[0]);
      }
    } catch {
      // fallback
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Available slots
      const slotsRes = await scheduleService.getSlots({ status: 'AVAILABLE' });
      setSlots(slotsRes?.content || slotsRes || []);

      // 2. Booked slots / bookings
      const allSlotsRes = await scheduleService.getSlots();
      const allSlots = allSlotsRes?.content || allSlotsRes || [];
      const booked = allSlots.filter((s: any) => s.bookedCount > 0 || s.status === 'BOOKED');
      setMyBookings(booked);

      // 3. Topic questions if group has topic
      if (userGroup?.topicId) {
        const qRes = await topicService.getTopicQuestions(userGroup.topicId).catch(() => []);
        setQuestions(qRes?.content || qRes || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [userGroup?.topicId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBookSlot = async (slot: Slot) => {
    if (!userGroup?.id) {
      Alert.alert('Chưa có nhóm', 'Bạn cần tham gia hoặc tạo nhóm để đặt lịch hẹn với GVHD.');
      return;
    }

    Alert.alert(
      'Xác nhận đặt lịch',
      `Bạn có muốn đặt lịch hẹn vào ${formatDate(slot.startTime)} (${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lịch',
          onPress: async () => {
            try {
              await scheduleService.bookSlot(slot.id, {
                groupId: userGroup.id,
                notes: 'Nhóm đăng ký lịch tư vấn GVHD',
              });
              Alert.alert('Thành công', 'Đặt lịch hẹn thành công!');
              loadData();
            } catch (err: any) {
              const msg =
                err.response?.data?.message ||
                'Đặt lịch thất bại. Lưu ý chỉ được đặt khi đã hoàn thành buổi hẹn cũ!';
              Alert.alert('Lỗi đặt lịch', msg);
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = async (booking: any) => {
    const slotStartTime = new Date(booking.startTime || booking.slotTime);
    const now = new Date();
    const hoursDifference = (slotStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 12) {
      Alert.alert(
        'Không thể hủy trực tiếp',
        'Đã quá thời hạn tự hủy (dưới 12 giờ trước lịch hẹn). Vui lòng liên hệ trực tiếp Giảng viên để được hỗ trợ dời lịch.'
      );
      return;
    }

    Alert.alert(
      'Xác nhận hủy lịch',
      'Bạn có chắc chắn muốn hủy buổi hẹn này? (Hủy trước 12h không bị tính vi phạm)',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy buổi hẹn',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduleService.cancelBooking(booking.id, 'Hủy theo yêu cầu nhóm');
              Alert.alert('Thành công', 'Hủy lịch hẹn thành công!');
              loadData();
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy lịch.');
            }
          },
        },
      ]
    );
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    if (!userGroup?.topicId) {
      Alert.alert('Chưa có đề tài', 'Nhóm cần có đề tài chính thức để gửi câu hỏi thảo luận.');
      return;
    }

    setSubmittingQ(true);
    try {
      await topicService.addTopicQuestion(userGroup.topicId, {
        questionText: newQuestion.trim(),
      });
      Alert.alert('Thành công', 'Đã gửi câu hỏi cho Giảng viên hướng dẫn!');
      setNewQuestion('');
      const qRes = await topicService.getTopicQuestions(userGroup.topicId);
      setQuestions(qRes?.content || qRes || []);
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi câu hỏi thảo luận.');
    } finally {
      setSubmittingQ(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>Lịch hẹn GVHD · Booking & Meetings</Text>
        </View>
        <Text style={styles.bannerTitle}>Lịch tư vấn & Hướng dẫn đồ án</Text>
        <Text style={styles.bannerDesc}>
          Đặt lịch tư vấn hướng dẫn đồ án theo các khung giờ rảnh của GVHD.
        </Text>
      </View>

      {/* 2. Sub Tabs Segment */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'available' && styles.tabItemActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'available' && styles.tabItemTextActive]}
          >
            Khung giờ rảnh ({slots.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'booked' && styles.tabItemActive]}
          onPress={() => setActiveTab('booked')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'booked' && styles.tabItemTextActive]}
          >
            Lịch đã đặt ({myBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'questions' && styles.tabItemActive]}
          onPress={() => setActiveTab('questions')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'questions' && styles.tabItemTextActive]}
          >
            Hỏi GVHD ({questions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Tab Contents */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch hẹn...</Text>
        </View>
      ) : activeTab === 'available' ? (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.dateBlock}>
                  <Text style={styles.cardDate}>{formatDate(item.startTime)}</Text>
                  <Text style={styles.cardTime}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Text>
                </View>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableText}>Còn trống</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    GVHD: <Text style={styles.infoHighlight}>{item.instructorName || 'TS. Giảng viên'}</Text>
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    Thời lượng: {item.durationMinutes || 45} phút
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name={item.locationType === 'ONLINE' ? 'videocam-outline' : 'location-outline'}
                    size={15}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    Hình thức: {item.locationType === 'ONLINE' ? 'Trực tuyến (Google Meet/Teams)' : 'Trực tiếp tại trường'}
                  </Text>
                </View>

                {item.meetingUrl ? (
                  <View style={styles.linkRow}>
                    <Ionicons name="link-outline" size={14} color={colors.blue} />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {item.meetingUrl}
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookSlot(item)}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar-outline" size={16} color="#fff" />
                <Text style={styles.bookButtonText}>Đặt lịch hẹn này</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>Chưa có khung giờ rảnh</Text>
              <Text style={styles.emptySubtitle}>
                Giảng viên hướng dẫn sẽ mở thêm slot họp trong tuần.
              </Text>
            </View>
          }
        />
      ) : activeTab === 'booked' ? (
        <FlatList
          data={myBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.dateBlock}>
                  <Text style={styles.cardDate}>{formatDate(item.startTime)}</Text>
                  <Text style={styles.cardTime}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Text>
                </View>
                <View style={styles.bookedBadge}>
                  <Text style={styles.bookedText}>✓ Đã xác nhận</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    GVHD: <Text style={styles.infoHighlight}>{item.instructorName || 'Giảng viên'}</Text>
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="videocam-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    Hình thức: {item.locationType === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}
                  </Text>
                </View>

                {item.meetingUrl ? (
                  <View style={styles.linkRow}>
                    <Ionicons name="link-outline" size={14} color={colors.blue} />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {item.meetingUrl}
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Hủy lịch hẹn (Quy định 12h)</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
              <Text style={styles.emptySubtitle}>
                Chuyển qua tab "Khung giờ rảnh" để chọn giờ họp với GVHD.
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.qnaContent}>
          {/* Question submission box */}
          <View style={styles.qnaBox}>
            <Text style={styles.qnaBoxTitle}>Gửi câu hỏi trước buổi họp</Text>
            <Text style={styles.qnaBoxDesc}>
              Đặt câu hỏi trước để GVHD nắm rõ khúc mắc và chuẩn bị giải đáp kỹ hơn.
            </Text>

            <TextInput
              style={styles.qnaInput}
              placeholder="Nhập nội dung thắc mắc / nội dung muốn trao đổi..."
              placeholderTextColor={colors.textMuted}
              value={newQuestion}
              onChangeText={setNewQuestion}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitQBtn, submittingQ && { opacity: 0.6 }]}
              onPress={handleAddQuestion}
              disabled={submittingQ}
            >
              <Text style={styles.submitQBtnText}>
                {submittingQ ? 'Đang gửi...' : '+ Gửi câu hỏi cho GVHD'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* List of questions */}
          <Text style={styles.questionsListTitle}>
            Câu hỏi thảo luận ({questions.length})
          </Text>

          {questions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={44} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>Chưa có câu hỏi nào</Text>
              <Text style={styles.emptySubtitle}>
                Hãy nhập câu hỏi ở trên để gửi cho Giảng viên.
              </Text>
            </View>
          ) : (
            questions.map((q) => (
              <View key={q.id} style={styles.questionCard}>
                <View style={styles.qHeader}>
                  <Text style={styles.qBadge}>Q</Text>
                  <Text style={styles.qText}>{q.questionText}</Text>
                </View>

                {q.guidanceNotes || q.answer ? (
                  <View style={styles.answerBlock}>
                    <Text style={styles.aBadge}>GVHD:</Text>
                    <Text style={styles.aText}>{q.guidanceNotes || q.answer}</Text>
                  </View>
                ) : (
                  <Text style={styles.pendingAnswerText}>⏳ Đang chờ GVHD phản hồi</Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  banner: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerTagText: {
    color: colors.primary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabItemActive: {
    backgroundColor: colors.primary50,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabItemTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  dateBlock: {
    gap: 2,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  cardTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  availableBadge: {
    backgroundColor: colors.success50,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  availableText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.success,
  },
  bookedBadge: {
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  bookedText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
  },
  cardBody: {
    gap: 6,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoHighlight: {
    fontWeight: '800',
    color: colors.text,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  linkText: {
    fontSize: 11.5,
    color: colors.blue,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: borderRadius.md,
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelButton: {
    backgroundColor: colors.error50,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  qnaContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  qnaBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  qnaBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  qnaBoxDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  qnaInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 12.5,
    color: colors.text,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  submitQBtn: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  submitQBtnText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  questionsListTitle: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  qHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  qBadge: {
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
  },
  answerBlock: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  aBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
  },
  aText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  pendingAnswerText: {
    fontSize: 10.5,
    color: colors.warning,
    fontWeight: '700',
    paddingLeft: 26,
  },
});
