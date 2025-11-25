import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchTransactions, createTransaction, deleteTransaction } from '../services/api';
import type { Transaction } from '../types';

export function useTransactions() {
  const { user, token } = useAuthStore();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', user?._id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user || !token) return [];
      return fetchTransactions(token);
    },
    enabled: !!user && !!token,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, '_id' | 'userId' | 'createdAt'>) => {
      if (!user || !token) throw new Error('User not authenticated');
      await createTransaction(token, {
        ...transaction,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?._id] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!user || !token) throw new Error('User not authenticated');
      await deleteTransaction(token, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?._id] });
    },
  });
}

