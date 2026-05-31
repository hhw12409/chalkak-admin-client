import { request, buildParams } from '@/lib/apiClient';
import { AdminUser, UserSanction, SanctionLevel, PageResponse } from '@/types/admin';

export const usersApi = {
  getUsers: (params: { page?: number; size?: number; status?: string; keyword?: string }) =>
    request<PageResponse<AdminUser>>(`/users?${buildParams(params)}`),

  getUser: (userId: number) =>
    request<AdminUser>(`/users/${userId}`),

  getUserSanctions: (userId: number) =>
    request<UserSanction[]>(`/users/${userId}/sanctions`),

  sanctionUser: (userId: number, level: SanctionLevel, reason: string) =>
    request<UserSanction>(`/users/${userId}/sanctions`, {
      method: 'POST',
      body: JSON.stringify({ level, reason }),
    }),

  revokeSanction: (userId: number, sanctionId: number) =>
    request<void>(`/users/${userId}/sanctions/${sanctionId}`, { method: 'DELETE' }),
};
