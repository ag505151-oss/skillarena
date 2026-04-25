export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'INTERVIEWER' | 'CANDIDATE';
