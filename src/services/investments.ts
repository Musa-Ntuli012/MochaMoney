import type { Investment } from '../types';

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

export async function fetchInvestments(token: string): Promise<Investment[]> {
  const response = await fetch(`${API_BASE_URL}/api/investments`, {
    headers: buildHeaders(token),
  });
  return handleResponse<Investment[]>(response);
}

export async function createInvestment(
  token: string,
  payload: Omit<Investment, '_id' | 'userId' | 'createdAt'>
): Promise<Investment> {
  const response = await fetch(`${API_BASE_URL}/api/investments`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<Investment>(response);
}

export async function updateInvestment(
  token: string,
  id: string,
  payload: Partial<Pick<Investment, 'currentValue' | 'invested' | 'units' | 'type' | 'platform'>>
): Promise<Investment> {
  const response = await fetch(`${API_BASE_URL}/api/investments/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<Investment>(response);
}

export async function deleteInvestment(token: string, id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/investments/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse<{ success: boolean }>(response);
}

