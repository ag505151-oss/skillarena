import type { ApiResponse } from '@skillarena/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers,
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data;
}

export async function apiSend<T>(path: string, method: 'POST' | 'PATCH', body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data;
}
