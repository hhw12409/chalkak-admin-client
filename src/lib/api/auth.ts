import { request } from '@/lib/apiClient';
import { AdminInfo, AdminPasswordChangePayload, LoginResponse } from '@/types/admin';

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, true),

  getMe: () => request<AdminInfo>('/auth/me'),

  /** 운영자 본인 비밀번호 변경. 본인 식별은 서버가 Bearer 토큰으로 처리. */
  changePassword: (payload: AdminPasswordChangePayload) =>
    request<void>('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
