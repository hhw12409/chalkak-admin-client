import { request, buildParams } from '@/lib/apiClient';
import {
  PlaceType,
  PlaceTypeCreatePayload,
  PlaceTypeUpdatePayload,
} from '@/types/admin';

export const placeTypesApi = {
  /** 장소 타입 마스터 목록. activeOnly=true 면 status=ACTIVE 만. 정렬: typeId ASC. */
  list: (params?: { activeOnly?: boolean }) => {
    const qs = params ? buildParams(params) : '';
    return request<PlaceType[]>(`/place-types${qs ? `?${qs}` : ''}`);
  },

  get: (id: number) => request<PlaceType>(`/place-types/${id}`),

  create: (payload: PlaceTypeCreatePayload) =>
    request<PlaceType>('/place-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: PlaceTypeUpdatePayload) =>
    request<PlaceType>(`/place-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    request<void>(`/place-types/${id}`, { method: 'DELETE' }),
};
