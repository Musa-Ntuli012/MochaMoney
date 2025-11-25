import type { Budget } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

const buildHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export async function fetchBudgets(token: string): Promise<Budget[]> {
  const response = await fetch(`${API_BASE_URL}/api/budgets`, {
    headers: buildHeaders(token),
  });
  return handleResponse<Budget[]>(response);
}

export async function createBudget(token: string, payload: Omit<Budget, '_id' | 'userId' | 'createdAt'>): Promise<Budget> {
  const response = await fetch(`${API_BASE_URL}/api/budgets`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<Budget>(response);
}

export async function updateBudget(
  token: string,
  id: string,
  payload: Partial<Pick<Budget, 'limit' | 'period'>>
): Promise<Budget> {
  const response = await fetch(`${API_BASE_URL}/api/budgets/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<Budget>(response);
}

export async function deleteBudget(token: string, id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/budgets/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse<{ success: boolean }>(response);
}

