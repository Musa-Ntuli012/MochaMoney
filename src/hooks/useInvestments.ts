import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import {
  fetchInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from '../services/investments';
import type { Investment } from '../types';

export function useInvestments() {
  const { token, user } = useAuthStore();

  return useQuery<Investment[]>({
    queryKey: ['investments', user?._id],
    queryFn: async () => {
      if (!token || !user) return [];
      return fetchInvestments(token);
    },
    enabled: !!token && !!user,
  });
}

export function useCreateInvestment() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<Investment, '_id' | 'userId' | 'createdAt'>) => {
      if (!token || !user) throw new Error('User not authenticated');
      return createInvestment(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', user?._id] });
    },
  });
}

export function useUpdateInvestment() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Investment, 'currentValue' | 'invested' | 'units' | 'type' | 'platform'>>;
    }) => {
      if (!token || !user) throw new Error('User not authenticated');
      return updateInvestment(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', user?._id] });
    },
  });
}

export function useDeleteInvestment() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token || !user) throw new Error('User not authenticated');
      return deleteInvestment(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', user?._id] });
    },
  });
}

