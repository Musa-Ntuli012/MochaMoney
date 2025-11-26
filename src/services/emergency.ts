import type { EmergencyFund } from '../types';

// On Vercel, API is on same domain, so use relative URLs if VITE_API_URL is not set
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (import.meta.env.PROD ? '' : 'http://localhost:4000');

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

export async function fetchEmergencyFund(token: string): Promise<EmergencyFund | null> {
  const response = await fetch(`${API_BASE_URL}/api/emergency`, {
    headers: buildHeaders(token),
  });
  if (response.status === 204) return null;
  return handleResponse<EmergencyFund | null>(response);
}

export async function createEmergencyFund(
  token: string,
  payload: Omit<EmergencyFund, '_id' | 'userId'>
): Promise<EmergencyFund> {
  const response = await fetch(`${API_BASE_URL}/api/emergency`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<EmergencyFund>(response);
}

export async function updateEmergencyFund(
  token: string,
  id: string,
  payload: Partial<Pick<EmergencyFund, 'current' | 'target'>>
): Promise<EmergencyFund> {
  const response = await fetch(`${API_BASE_URL}/api/emergency/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<EmergencyFund>(response);
}

export async function deleteEmergencyFund(token: string, id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/emergency/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse<{ success: boolean }>(response);
}


