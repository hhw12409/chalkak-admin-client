import { request, buildParams } from '@/lib/apiClient';
import {
  PhotoBattleListItem,
  PhotoBattleDetail,
  PhotoBattleCreatePayload,
  PhotoBattleStatus,
  PageResponse,
} from '@/types/admin';

export const battlesApi = {
  list: (params: { status?: PhotoBattleStatus; page?: number; size?: number }) =>
    request<PageResponse<PhotoBattleListItem>>(`/battles?${buildParams(params)}`),

  get: (id: number) => request<PhotoBattleDetail>(`/battles/${id}`),

  create: (payload: PhotoBattleCreatePayload) =>
    request<PhotoBattleDetail>('/battles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  close: (id: number) =>
    request<PhotoBattleDetail>(`/battles/${id}/close`, { method: 'PATCH' }),

  extend: (id: number, endAt: string) =>
    request<PhotoBattleDetail>(`/battles/${id}/extend`, {
      method: 'PATCH',
      body: JSON.stringify({ endAt }),
    }),

  remove: (id: number) =>
    request<void>(`/battles/${id}`, { method: 'DELETE' }),
};
