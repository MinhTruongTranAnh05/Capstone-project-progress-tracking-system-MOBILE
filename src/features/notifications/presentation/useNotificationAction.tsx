import { useRef } from 'react';
import { Text } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/services/apiError';
import { ui } from '@/core/ui/primitives';

export function useNotificationAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);
  const mutation = useMutation({ mutationFn: (task: () => Promise<unknown>) => task(), onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['formation', user?.id, 'unread'] }),
      queryClient.invalidateQueries({ queryKey: ['formation', user?.id, 'notifications'] }),
    ]);
  }, onSettled: () => { inFlight.current = false; } });
  return { busy: mutation.isPending,
    run: (task: () => Promise<unknown>) => { if (!inFlight.current) { inFlight.current = true; mutation.mutate(task); } },
    feedback: mutation.isError ? <Text accessibilityRole="alert" style={ui.error}>{getErrorMessage(mutation.error)}</Text> : null };
}
