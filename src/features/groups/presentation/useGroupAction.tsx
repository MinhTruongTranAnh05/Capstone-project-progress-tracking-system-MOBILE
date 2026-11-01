import { useRef, useState } from 'react';
import { Text } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useFormation } from './GroupContext';
import { getErrorMessage } from '@/services/apiError';
import { ui } from '@/core/ui/primitives';
export function useAction() {
  const { refresh } = useFormation();
  const inFlight = useRef(false);
  const [message, setMessage] = useState('');
  const mutation = useMutation({ mutationFn: (action: () => Promise<unknown>) => action(), onSuccess: async () => {
    setMessage('Thao tác thành công. Dữ liệu đã được cập nhật.'); await refresh();
  }, onError: () => { void refresh(); }, onSettled: () => { inFlight.current = false; } });
  return {
    run: (action: () => Promise<unknown>) => { if (!inFlight.current) { inFlight.current = true; setMessage(''); mutation.mutate(action); } },
    busy: mutation.isPending,
    feedback: mutation.isError ? <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(mutation.error)}</Text> : message ? <Text accessibilityRole="alert" style={ui.notice}>{message}</Text> : null,
  };
}
