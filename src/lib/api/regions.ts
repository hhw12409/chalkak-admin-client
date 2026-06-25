import { request, buildParams } from '@/lib/apiClient';
import {
  Region,
  RegionCreatePayload,
  RegionUpdatePayload,
} from '@/types/admin';

export const regionsApi = {
  list: (params?: { activeOnly?: boolean }) => {
    const qs = params ? buildParams(params) : '';
    return request<Region[]>(`/regions${qs ? `?${qs}` : ''}`);
  },

  get: (id: number) => request<Region>(`/regions/${id}`),

  create: (payload: RegionCreatePayload) =>
    request<Region>('/regions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: RegionUpdatePayload) =>
    request<Region>(`/regions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleActive: (id: number, active: boolean) =>
    request<Region>(`/regions/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    }),

  remove: (id: number) =>
    request<void>(`/regions/${id}`, { method: 'DELETE' }),
};
