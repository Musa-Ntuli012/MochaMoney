import type { User } from '../types';

// On Vercel, API is on same domain, so use relative URLs if VITE_API_URL is not set
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (import.meta.env.PROD ? '' : 'http://localhost:4000');

type AuthResponse = {
  token: string;
  user: User;
};

async function handleAuthResponse(response: Response): Promise<AuthResponse> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Authentication failed');
  }
  return response.json() as Promise<AuthResponse>;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  displayName?: string;
  currency?: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAuthResponse(response);
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAuthResponse(response);
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json() as Promise<User>;
}

export async function updateCurrentUser(token: string, payload: Partial<Pick<User, 'displayName' | 'currency'>>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to update profile');
  }
  return response.json() as Promise<User>;
}

