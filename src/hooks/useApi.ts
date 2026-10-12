import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, groupService, scheduleService, topicService } from '@/services';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: false,
  });
}

export function useGroups(params?: any) {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => groupService.getGroups(params),
  });
}

export function useGroup(id: string | undefined) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => groupService.getGroupById(id!),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      groupService.updateGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
    },
  });
}

export function useSlots(params?: any) {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: () => scheduleService.getSlots(params),
  });
}

export function useBookSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, data }: { slotId: string; data?: any }) =>
      scheduleService.bookSlot(slotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useTopics(params?: any) {
  return useQuery({
    queryKey: ['topics', params],
    queryFn: () => topicService.getTopics(params),
  });
}
