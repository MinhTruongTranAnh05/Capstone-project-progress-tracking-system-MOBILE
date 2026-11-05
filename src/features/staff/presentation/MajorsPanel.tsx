import { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Card, Empty, Field, SectionHeading, TileGrid, ui } from '@/core/ui/primitives';
import { staffApi } from '../data/staffApi';
import type { Major } from '../domain/models';
import { FormDialog, LoadState, type FormSpec, useStaffAction } from './controls';
import { useStaff } from './StaffContext';

export function MajorsPanel() {
  const f = useStaff(); const action = useStaffAction();
  const [q, setQ] = useState(''); const [form, setForm] = useState<FormSpec | null>(null);
  const query = useQuery({ queryKey: [...f.key, 'majors'], queryFn: ({ signal }) => staffApi.majors(signal) });
  const edit = (major?: Major) => setForm({ title: major ? 'Đổi tên chuyên ngành' : 'Tạo chuyên ngành mới', initial: { code: major?.code ?? '', name: major?.name ?? '' },
    fields: [{ key: 'code', label: 'Mã chuyên ngành', required: true, maxLength: 20 }, { key: 'name', label: 'Tên chuyên ngành', required: true, maxLength: 255 }],
    onSubmit: values => action.execute(() => major ? staffApi.updateMajor(major.id, { code: values.code, name: values.name }) : staffApi.createMajor({ code: values.code, name: values.name })) });
  const items = query.data?.filter(m => `${m.code} ${m.name}`.toLocaleLowerCase().includes(q.toLocaleLowerCase())) ?? [];
  return <>{action.feedback}<Card><SectionHeading eyebrow="Quản lý đào tạo" title="Chuyên ngành" subtitle="Danh sách chuyên ngành trong hệ thống." /><Field label="Tìm chuyên ngành" value={q} onChangeText={setQ} /><Button title="+ Tạo chuyên ngành mới" onPress={() => edit()} /></Card>
    <LoadState pending={query.isPending} error={query.error} retry={() => void query.refetch()}>
      {!items.length && <Empty text="Chưa có chuyên ngành phù hợp." />}<TileGrid basis={270}>{items.map(major => <Card key={major.id}><View style={ui.row}><Badge>{major.code}</Badge></View><Text style={ui.title}>{major.name}</Text><Button title="Đổi tên chuyên ngành" secondary onPress={() => edit(major)} /></Card>)}</TileGrid>
    </LoadState>{form && <FormDialog form={form} onClose={() => setForm(null)} />}</>;
}
