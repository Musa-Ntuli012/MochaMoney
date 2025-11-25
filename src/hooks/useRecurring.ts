import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import {
  fetchRecurringRules,
  createRecurringRule,
  updateRecurringRule,
  deleteRecurringRule,
  runRecurringRule,
} from '../services/recurring';
import type { RecurringRule } from '../types';

export function useRecurringRules() {
  const { token, user } = useAuthStore();

  return useQuery<RecurringRule[]>({
    queryKey: ['recurring-rules', user?._id],
    queryFn: async () => {
      if (!token || !user) return [];
      return fetchRecurringRules(token);
    },
    enabled: !!token && !!user,
  });
}

export function useCreateRecurringRule() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<RecurringRule, '_id' | 'userId' | 'createdAt'>) => {
      if (!token || !user) throw new Error('User not authenticated');
      return createRecurringRule(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules', user?._id] });
    },
  });
}

export function useUpdateRecurringRule() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecurringRule> }) => {
      if (!token || !user) throw new Error('User not authenticated');
      return updateRecurringRule(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules', user?._id] });
    },
  });
}

export function useDeleteRecurringRule() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token || !user) throw new Error('User not authenticated');
      return deleteRecurringRule(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules', user?._id] });
    },
  });
}

export function useRunRecurringRule() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token || !user) throw new Error('User not authenticated');
      return runRecurringRule(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?._id] });
    },
  });
}

