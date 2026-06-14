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

  /** 유저 직책(title) 수정. 빈 문자열/null 은 서버에서 trim 후 null 로 저장 → 라벨 미노출. */
  updateUserTitle: (userId: number, title: string | null) =>
    request<AdminUser>(`/users/${userId}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),
};
