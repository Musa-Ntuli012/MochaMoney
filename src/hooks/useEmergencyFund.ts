import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import {
  fetchEmergencyFund,
  createEmergencyFund,
  updateEmergencyFund,
  deleteEmergencyFund,
} from '../services/emergency';
import type { EmergencyFund } from '../types';

export function useEmergencyFund() {
  const { token, user } = useAuthStore();

  return useQuery<EmergencyFund | null>({
    queryKey: ['emergency-fund', user?._id],
    queryFn: async () => {
      if (!token || !user) return null;
      return fetchEmergencyFund(token);
    },
    enabled: !!token && !!user,
  });
}

export function useCreateEmergencyFund() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<EmergencyFund, '_id' | 'userId'>) => {
      if (!token || !user) throw new Error('User not authenticated');
      return createEmergencyFund(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-fund', user?._id] });
    },
  });
}

export function useUpdateEmergencyFund() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pick<EmergencyFund, 'current' | 'target'>> }) => {
      if (!token || !user) throw new Error('User not authenticated');
      return updateEmergencyFund(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-fund', user?._id] });
    },
  });
}

export function useDeleteEmergencyFund() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token || !user) throw new Error('User not authenticated');
      return deleteEmergencyFund(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-fund', user?._id] });
    },
  });
}

