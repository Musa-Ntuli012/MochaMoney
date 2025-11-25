import type { RecurringRule } from '../types';

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

export async function fetchRecurringRules(token: string): Promise<RecurringRule[]> {
  const response = await fetch(`${API_BASE_URL}/api/recurring`, {
    headers: buildHeaders(token),
  });
  return handleResponse<RecurringRule[]>(response);
}

export async function createRecurringRule(
  token: string,
  payload: Omit<RecurringRule, '_id' | 'userId' | 'createdAt'>
): Promise<RecurringRule> {
  const response = await fetch(`${API_BASE_URL}/api/recurring`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<RecurringRule>(response);
}

export async function updateRecurringRule(
  token: string,
  id: string,
  payload: Partial<RecurringRule>
): Promise<RecurringRule> {
  const response = await fetch(`${API_BASE_URL}/api/recurring/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<RecurringRule>(response);
}

export async function deleteRecurringRule(token: string, id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/recurring/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function runRecurringRule(token: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/api/recurring/${id}/run`, {
    method: 'POST',
    headers: buildHeaders(token),
  });
  return handleResponse<{ transaction: unknown }>(response);
}

