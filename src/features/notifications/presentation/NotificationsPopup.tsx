import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { ui } from '@/core/ui/primitives';
import { NotificationsContent } from './NotificationsContent';

export function NotificationsPopup({ onClose, onOpenRequest }: { onClose: () => void; onOpenRequest?: (requestId: string, groupId: string | null) => void }) {
  const insets = useSafeAreaInsets();
  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <View style={[styles.overlay, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 16, paddingLeft: insets.left + 12, paddingRight: insets.right + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng thông báo" style={StyleSheet.absoluteFill} onPress={onClose} />
      <View accessibilityViewIsModal onAccessibilityEscape={onClose} style={styles.panel}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text accessibilityRole="header" style={ui.heading}>Trung tâm Thông báo</Text></View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng bảng thông báo" onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 12 }} keyboardShouldPersistTaps="handled">
          <NotificationsContent compact onOpenRequest={onOpenRequest} />
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'flex-end', backgroundColor: 'rgba(44, 40, 37, 0.15)' },
  panel: { width: '100%', maxWidth: 440, maxHeight: '100%', flexShrink: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(44, 40, 37, 0.16)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 20, paddingRight: 8, paddingVertical: 6, backgroundColor: colors.background, borderBottomWidth: 1, borderColor: colors.border },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
