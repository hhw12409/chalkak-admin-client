import { request } from '@/lib/apiClient';
import { AdminInfo, LoginResponse } from '@/types/admin';

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, true),

  getMe: () => request<AdminInfo>('/auth/me'),
};
