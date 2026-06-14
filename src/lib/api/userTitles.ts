import { request, buildParams } from '@/lib/apiClient';
import {
  UserTitle,
  UserTitleCreatePayload,
  UserTitleUpdatePayload,
} from '@/types/admin';

export const userTitlesApi = {
  /** 직책 마스터 목록. activeOnly=true 면 isActive=true 만. 정렬: displayOrder ASC, id ASC. */
  list: (params?: { activeOnly?: boolean }) => {
    const qs = params ? buildParams(params) : '';
    return request<UserTitle[]>(`/user-titles${qs ? `?${qs}` : ''}`);
  },

  get: (id: number) => request<UserTitle>(`/user-titles/${id}`),

  create: (payload: UserTitleCreatePayload) =>
    request<UserTitle>('/user-titles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UserTitleUpdatePayload) =>
    request<UserTitle>(`/user-titles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    request<void>(`/user-titles/${id}`, { method: 'DELETE' }),
};
