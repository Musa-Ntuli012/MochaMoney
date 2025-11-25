import type { SavingsGoal } from '../types';

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

export async function fetchSavings(token: string): Promise<SavingsGoal[]> {
  const response = await fetch(`${API_BASE_URL}/api/savings`, {
    headers: buildHeaders(token),
  });
  return handleResponse<SavingsGoal[]>(response);
}

export async function createSavingsGoal(
  token: string,
  payload: Omit<SavingsGoal, '_id' | 'userId' | 'createdAt'>
): Promise<SavingsGoal> {
  const response = await fetch(`${API_BASE_URL}/api/savings`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<SavingsGoal>(response);
}

export async function updateSavingsGoal(
  token: string,
  id: string,
  payload: Partial<Pick<SavingsGoal, 'current' | 'target' | 'color'>>
): Promise<SavingsGoal> {
  const response = await fetch(`${API_BASE_URL}/api/savings/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<SavingsGoal>(response);
}

export async function deleteSavingsGoal(token: string, id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/savings/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse<{ success: boolean }>(response);
}

