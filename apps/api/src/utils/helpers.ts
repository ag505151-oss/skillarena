import type { ApiResponse } from '@skillarena/types';

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  if (message) {
    return { success: true, data, message };
  }

  return { success: true, data };
}

export function fail(error: string): ApiResponse<never> {
  return { success: false, error };
}
