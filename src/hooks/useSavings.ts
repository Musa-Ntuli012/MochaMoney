import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import {
  fetchSavings,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
} from '../services/savings';
import type { SavingsGoal } from '../types';

export function useSavingsGoals() {
  const { token, user } = useAuthStore();

  return useQuery<SavingsGoal[]>({
    queryKey: ['savings-goals', user?._id],
    queryFn: async () => {
      if (!token || !user) return [];
      return fetchSavings(token);
    },
    enabled: !!token && !!user,
  });
}

export function useCreateSavingsGoal() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<SavingsGoal, '_id' | 'userId' | 'createdAt'>) => {
      if (!token || !user) throw new Error('User not authenticated');
      return createSavingsGoal(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', user?._id] });
    },
  });
}

export function useUpdateSavingsGoal() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pick<SavingsGoal, 'current' | 'target' | 'color'>> }) => {
      if (!token || !user) throw new Error('User not authenticated');
      return updateSavingsGoal(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', user?._id] });
    },
  });
}

export function useDeleteSavingsGoal() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token || !user) throw new Error('User not authenticated');
      return deleteSavingsGoal(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', user?._id] });
    },
  });
}

