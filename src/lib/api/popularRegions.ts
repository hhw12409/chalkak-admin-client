import { request } from '@/lib/apiClient';
import {
  PopularRegion,
  PopularRegionCreatePayload,
  PopularRegionUpdatePayload,
} from '@/types/admin';

export const popularRegionsApi = {
  list: () => request<PopularRegion[]>('/popular-regions'),

  create: (payload: PopularRegionCreatePayload) =>
    request<PopularRegion>('/popular-regions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: PopularRegionUpdatePayload) =>
    request<PopularRegion>(`/popular-regions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    request<void>(`/popular-regions/${id}`, { method: 'DELETE' }),

  reorder: (orderedIds: number[]) =>
    request<void>('/popular-regions/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    }),
};
