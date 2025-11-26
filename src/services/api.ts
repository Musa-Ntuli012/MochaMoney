import type { Transaction } from '../types';

// On Vercel, API is on same domain, so use relative URLs if VITE_API_URL is not set
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (import.meta.env.PROD ? '' : 'http://localhost:4000');

function buildHeaders(token?: string, extra?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export async function fetchTransactions(token: string): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    headers: buildHeaders(token),
  });
  return handleResponse<Transaction[]>(response);
}

export async function createTransaction(
  token: string,
  data: Omit<Transaction, '_id' | 'createdAt' | 'userId'> & Partial<Pick<Transaction, '_id' | 'createdAt'>>
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<Transaction>(response);
}

export async function deleteTransaction(token: string, id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse<{ success: boolean }>(response);
}

