import { Children, type ReactNode, useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, type TextInputProps, TouchableOpacity, View, type ViewStyle, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { getErrorMessage } from '@/services/apiError';
export const ui = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: colors.text, lineHeight: 28 },
  heading: { fontSize: 15, fontWeight: '800', color: colors.text, lineHeight: 22 },
  text: { fontSize: 13, color: colors.textSecondary, lineHeight: 21 },
  strong: { fontSize: 13, fontWeight: '700', color: colors.text, lineHeight: 21 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 22, gap: 16, boxShadow: '0 1px 3px rgba(44,40,37,0.06)' },
  inset: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8 },
  eyebrow: { fontSize: 10, lineHeight: 16, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  tag: { fontSize: 11, fontWeight: '700', color: colors.primary, backgroundColor: colors.primary50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, overflow: 'hidden' },
  error: { color: colors.error, backgroundColor: colors.error50, borderRadius: 12, padding: 12, lineHeight: 21, fontSize: 13 },
  notice: { color: colors.warningDark, backgroundColor: colors.warning50, borderRadius: 12, padding: 12, lineHeight: 21, fontSize: 13 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, minHeight: 46, color: colors.text, fontSize: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 12, minHeight: 44, padding: 12, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: 13, fontWeight: '700', color: colors.textLight, textAlign: 'center' },
});
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) { return <View style={[ui.card, style]}>{children}</View>; }
export function Button({ title, onPress, disabled = false, busy = false, secondary = false, tone }: { title: string; onPress: () => void; disabled?: boolean; busy?: boolean; secondary?: boolean; tone?: 'success' | 'danger' }) {
  const tint = tone === 'success' ? colors.success : tone === 'danger' ? colors.error : undefined;
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }} onPress={onPress} disabled={disabled || busy}
    style={[ui.button, secondary && ui.secondary, tint && { backgroundColor: secondary ? (tone === 'danger' ? colors.error50 : colors.success50) : tint, borderColor: secondary ? 'transparent' : tint }, (disabled || busy) && { opacity: 0.45 }]}>
    {busy ? <ActivityIndicator color={secondary ? colors.primary : colors.textLight} /> : <Text style={[ui.buttonText, secondary && { color: tint ?? colors.text }]}>{title}</Text>}
  </TouchableOpacity>;
}
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 6 }}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.textMuted}
    {...props} style={[ui.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, props.style]} />{error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}</View>;
}
export function ConfirmButton({ title, message, onConfirm, disabled = false, busy = false, tone, secondary = true }: { title: string; message: string; onConfirm: () => void; disabled?: boolean; busy?: boolean; tone?: 'success' | 'danger'; secondary?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><Button title={title} onPress={() => setOpen(true)} secondary={secondary} tone={tone} disabled={disabled} busy={busy} />
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(44,40,37,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}><Card style={{ width: '100%', maxWidth: 448 }}>
        <Text style={ui.heading}>{title}</Text><Text style={ui.text}>{message}</Text>
        <Button title="Xác nhận" tone={tone} disabled={disabled || busy} onPress={() => { setOpen(false); onConfirm(); }} />
        <Button title="Hủy" secondary onPress={() => setOpen(false)} />
      </Card></View>
    </Modal>
  </>;
}
export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  return <Card><Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text><Button title="Thử lại" onPress={retry} secondary /></Card>;
}
export function Empty({ text }: { text: string }) { return <Card><Text style={ui.text}>{text}</Text></Card>; }
export function Avatar({ name, uri, size = 40 }: { name?: string; uri?: string | null; size?: number }) {
  const words = name?.trim().split(/\s+/) ?? [];
  const initials = words.length > 1 ? words.slice(-2).map(word => word[0]).join('').toUpperCase() : (words[0]?.slice(0, 2).toUpperCase() || 'SV');
  return <View style={{ width: size, height: size, borderRadius: size >= 80 ? size / 2 : 12, backgroundColor: '#FCEBDD', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
    {uri ? <Image source={{ uri }} accessibilityLabel={`Ảnh đại diện ${name ?? ''}`} style={{ width: size, height: size }} /> : <Text style={{ color: '#C94A08', fontWeight: '900', fontSize: size * 0.3 }}>{initials}</Text>}
  </View>;
}
export function Badge({ children, tone = 'orange' }: { children: ReactNode; tone?: 'orange' | 'success' | 'warning' | 'neutral' | 'danger' }) {
  const palette = { orange: [colors.primary50, colors.primary, colors.primary100], success: [colors.success50, colors.successDark, colors.successBorder], warning: [colors.warning50, colors.warningDark, colors.warningBorder], neutral: [colors.gray[100], colors.textSecondary, colors.border], danger: [colors.error50, colors.error, colors.errorBorder] }[tone];
  return <View style={{ alignSelf: 'flex-start', borderRadius: 10, borderWidth: 1, borderColor: palette[2], paddingHorizontal: 10, paddingVertical: 6 }}><Text style={{ fontSize: 10, lineHeight: 16, fontWeight: '800', color: palette[1] }}>{children}</Text></View>;
}
export function SectionHeading({ title, subtitle, eyebrow, icon }: { title: string; subtitle?: string; eyebrow?: string; icon?: string }) {
  return <View style={{ gap: 5 }}>{eyebrow && <Text style={[ui.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>}<Text style={ui.title}>{icon ? `${icon}  ` : ''}{title}</Text>{subtitle && <Text style={ui.text}>{subtitle}</Text>}</View>;
}
export function InfoTile({ label, value, icon }: { label: string; value?: string | null; icon?: string }) {
  return <View style={[ui.inset, { flexDirection: 'row', gap: 12 }]}>{icon && <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#FCEBDD', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary, fontSize: 18 }}>{icon}</Text></View>}<View style={{ flex: 1, gap: 5 }}><Text style={[ui.text, { fontSize: 11 }]}>{label}</Text><Text style={ui.strong}>{value || 'Chưa cập nhật'}</Text></View></View>;
}
export function TileGrid({ children, basis = 200 }: { children: ReactNode; basis?: number }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>{Children.toArray(children).map((child, index) => <View key={index} style={{ flexBasis: basis, flexGrow: 1, minWidth: 0 }}>{child}</View>)}</View>;
}
export function Columns({ main, aside, asideFirst = false }: { main: ReactNode; aside: ReactNode; asideFirst?: boolean }) {
  const { width } = useWindowDimensions();
  const horizontal = width >= 1180;
  const mainColumn = <View style={{ flex: horizontal ? 2 : undefined, minWidth: 0, gap: 24 }}>{main}</View>;
  const asideColumn = <View style={{ flex: horizontal ? 1 : undefined, minWidth: 0, gap: 24 }}>{aside}</View>;
  return <View style={{ flexDirection: horizontal ? 'row' : 'column', gap: 24, alignItems: 'stretch' }}>{asideFirst ? <>{asideColumn}{mainColumn}</> : <>{mainColumn}{asideColumn}</>}</View>;
}
