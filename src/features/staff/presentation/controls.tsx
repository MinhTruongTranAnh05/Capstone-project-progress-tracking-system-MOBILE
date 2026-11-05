import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Badge, Button, Card, ErrorState, Field, ui } from '@/core/ui/primitives';
import { getErrorMessage } from '@/services/apiError';
import { colors } from '@/constants/colors';
import { useStaff } from './StaffContext';

export interface Option { value: string; label: string }
export interface OptionPage { content: Option[]; totalPages: number }
export interface FormField {
  key: string; label: string; required?: boolean; multiline?: boolean; password?: boolean; placeholder?: string; maxLength?: number;
  options?: Option[]; multiple?: boolean; listKey?: string;
  loadOptions?: (q: string, page: number, signal: AbortSignal) => Promise<OptionPage>;
}
export interface FormSpec { title: string; description?: string; fields?: FormField[]; initial?: Record<string, string>; submitLabel?: string; danger?: boolean; onSubmit: (values: Record<string, string>) => Promise<unknown> }
export function useStaffAction() {
  const { key } = useStaff();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);
  const mutation = useMutation({ mutationFn: (task: () => Promise<unknown>) => task(), onSuccess: async () => {
    await Promise.all([queryClient.invalidateQueries({ queryKey: key }), queryClient.invalidateQueries({ queryKey: ['formation', user?.id] })]);
  }, onSettled: () => { inFlight.current = false; } });
  return { busy: mutation.isPending,
    run: (task: () => Promise<unknown>) => { if (!inFlight.current) { inFlight.current = true; mutation.mutate(task); } },
    execute: async (task: () => Promise<unknown>) => { if (inFlight.current) throw new Error('Một thao tác đang được xử lý.'); inFlight.current = true; return mutation.mutateAsync(task); },
    feedback: mutation.isError ? <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(mutation.error)}</Text> : mutation.isSuccess ? <Text accessibilityRole="alert" style={ui.notice}>Thao tác thành công.</Text> : null };
}
export function SelectField({ field, value, onChange }: { field: FormField; value: string; onChange: (value: string) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ['staff', user?.id, 'choices', field.listKey, q, page], enabled: open && !!field.loadOptions,
    queryFn: ({ signal }) => field.loadOptions!(q, page, signal) });
  const values = field.multiple ? value.split(',').filter(Boolean) : [value];
  const options = field.loadOptions ? query.data?.content ?? [] : (field.options ?? []).filter(o => o.label.toLocaleLowerCase().includes(q.toLocaleLowerCase()));
  const chosen = values.map(v => labels[v] ?? field.options?.find(o => o.value === v)?.label).filter(Boolean);
  const label = values.filter(Boolean).length > 1 ? `Đã chọn ${values.filter(Boolean).length} mục` : chosen[0] ?? (value ? 'Đã chọn' : 'Chọn...');
  return <View style={{ gap: 6 }}><Text style={ui.label}>{field.label}{field.required ? ' *' : ''}</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={field.label} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={ui.input}><Text style={ui.text}>{label}  ▾</Text></TouchableOpacity>
    {open && <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Đóng lựa chọn" style={{ position: 'absolute', inset: 0 }} onPress={() => setOpen(false)} />
        <Card style={{ width: '100%', maxWidth: 520, maxHeight: '85%' }}><Text style={ui.heading}>{field.label}</Text>
          <Field label="Tìm kiếm" value={q} onChangeText={text => { setQ(text); setPage(0); }} />
          <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, flexShrink: 1 }}>
            {query.isFetching && <ActivityIndicator color={colors.primary} />}
            {query.error && <ErrorState error={query.error} retry={() => void query.refetch()} />}
            {!query.isFetching && !options.length && <Text style={ui.text}>Không có lựa chọn phù hợp.</Text>}
            {options.map(option => <TouchableOpacity key={option.value} accessibilityRole={field.multiple ? 'checkbox' : 'radio'} accessibilityState={{ checked: values.includes(option.value) }} style={{ paddingVertical: 14, gap: 4 }} onPress={() => {
              setLabels(old => ({ ...old, [option.value]: option.label }));
              onChange(field.multiple ? (values.includes(option.value) ? values.filter(v => v !== option.value) : [...values.filter(Boolean), option.value]).join(',') : option.value);
              if (!field.multiple) setOpen(false);
            }}><Text style={[ui.text, values.includes(option.value) && { color: colors.primary, fontWeight: '800' }]}>{values.includes(option.value) ? '✓ ' : ''}{option.label}</Text></TouchableOpacity>)}
          </ScrollView>
          {!!field.loadOptions && <Pagination page={page} totalPages={query.data?.totalPages ?? 0} onChange={setPage} busy={query.isFetching} />}
          <Button title="Xong" secondary onPress={() => setOpen(false)} />
        </Card>
      </View>
    </Modal>}
  </View>;
}
export function FormDialog({ form, onClose }: { form: FormSpec; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, string>>(form.initial ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const inFlight = useRef(false);
  const submit = async () => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(null);
    try {
      for (const f of form.fields ?? []) if (f.required && !values[f.key]?.trim()) throw new Error(`Vui lòng nhập ${f.label.toLocaleLowerCase()}.`);
      await form.onSubmit(values); onClose();
    } catch (failure) { setError(failure); }
    finally { setBusy(false); inFlight.current = false; }
  };
  return <Modal transparent animationType="fade" onRequestClose={() => { if (!busy) onClose(); }}>
    <View style={{ flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}>
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 600, maxHeight: '100%', backgroundColor: 'white', borderRadius: 24, overflow: 'hidden' }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 16 }}><Text accessibilityRole="header" style={ui.title}>{form.title}</Text>
          {!!form.description && <Text style={ui.text}>{form.description}</Text>}
          {form.fields?.map(field => field.options || field.loadOptions ? <SelectField key={field.key} field={field} value={values[field.key] ?? ''} onChange={value => setValues(old => ({ ...old, [field.key]: value }))} />
            : <Field key={field.key} label={field.label + (field.required ? ' *' : '')} value={values[field.key] ?? ''} onChangeText={value => setValues(old => ({ ...old, [field.key]: value }))} multiline={field.multiline} secureTextEntry={field.password} placeholder={field.placeholder} maxLength={field.maxLength} editable={!busy} autoCapitalize="none" />)}
          {!!error && <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(error)}</Text>}
          <Button title={form.submitLabel ?? 'Lưu thay đổi'} tone={form.danger ? 'danger' : undefined} busy={busy} onPress={() => void submit()} />
          <Button title="Hủy" secondary disabled={busy} onPress={onClose} />
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
export function Pagination({ page, totalPages, onChange, busy = false }: { page: number; totalPages: number; onChange: (page: number) => void; busy?: boolean }) {
  return <View style={[ui.row, { justifyContent: 'space-between' }]}><Button title="← Trước" secondary disabled={page <= 0 || busy} onPress={() => onChange(page - 1)} /><Text style={ui.text}>Trang {totalPages ? page + 1 : 0}/{totalPages}</Text><Button title="Sau →" secondary disabled={page + 1 >= totalPages || busy} onPress={() => onChange(page + 1)} /></View>;
}
export function DetailDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return <Modal transparent animationType="fade" onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'center', alignItems: 'center', padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 650, maxHeight: '100%', backgroundColor: 'white', borderRadius: 24, overflow: 'hidden' }}><ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled"><Text accessibilityRole="header" style={ui.title}>{title}</Text>{children}<Button title="Đóng" secondary onPress={onClose} /></ScrollView></View></View></Modal>;
}
export function LoadState({ pending, error, retry, children }: { pending: boolean; error: unknown; retry: () => void; children: ReactNode }) {
  if (pending) return <Card><ActivityIndicator color={colors.primary} /><Text style={ui.text}>Đang tải dữ liệu...</Text></Card>;
  return error ? <ErrorState error={error} retry={retry} /> : <>{children}</>;
}
export function SemesterPicker() {
  const f = useStaff();
  return <LoadState pending={f.loading} error={f.error} retry={f.refresh}><Card><SelectField field={{ key: 'semester', label: 'Học kỳ', options: f.semesters.map(s => ({ value: s.code, label: `${s.name} · ${s.code}` })) }} value={f.semester} onChange={f.selectSemester} />{!f.semesters.length && <Text style={ui.text}>Chưa có học kỳ được phân công.</Text>}</Card></LoadState>;
}
export function Stat({ label, value }: { label: string; value: number | string }) { return <Card style={{ flexGrow: 1, flexBasis: 145 }}><Text style={ui.text}>{label}</Text><Text style={ui.title}>{value}</Text></Card>; }
const statusLabels: Record<string, string> = { ACTIVE: 'Đang hoạt động', SUSPENDED: 'Tạm khóa', INACTIVE: 'Vô hiệu hóa', ELIGIBLE: 'Đủ điều kiện', INELIGIBLE: 'Không đủ điều kiện', UNDECIDED: 'Chưa xác định', OPEN: 'Đang mở' };
export function Status({ children }: { children: string }) { return <Badge tone={children === 'ACTIVE' || children === 'ELIGIBLE' || children === 'OPEN' ? 'success' : children === 'INELIGIBLE' || children === 'SUSPENDED' ? 'danger' : 'neutral'}>{statusLabels[children] ?? children}</Badge>; }
