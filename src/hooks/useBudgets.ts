import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '../services/budgets';
import type { Budget } from '../types';

export function useBudgets() {
  const { token, user } = useAuthStore();

  return useQuery<Budget[]>({
    queryKey: ['budgets', user?._id],
    queryFn: async () => {
      if (!token || !user) return [];
      return fetchBudgets(token);
    },
    enabled: !!token && !!user,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();

  return useMutation({
    mutationFn: async (budget: Omit<Budget, '_id' | 'userId' | 'createdAt'>) => {
      if (!token || !user) throw new Error('User not authenticated');
      return createBudget(token, budget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?._id] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pick<Budget, 'limit' | 'period'>> }) => {
      if (!token || !user) throw new Error('User not authenticated');
      return updateBudget(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?._id] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token || !user) throw new Error('User not authenticated');
      return deleteBudget(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?._id] });
    },
  });
}

