import { request, buildParams } from '@/lib/apiClient';
import {
  Campaign,
  CampaignCreatePayload,
  CampaignUpdatePayload,
  PageResponse,
} from '@/types/admin';

export const campaignsApi = {
  list: (params: {
    isActive?: boolean;
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) => request<PageResponse<Campaign>>(`/campaigns?${buildParams(params)}`),

  get: (id: number) => request<Campaign>(`/campaigns/${id}`),

  create: (payload: CampaignCreatePayload) =>
    request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: CampaignUpdatePayload) =>
    request<Campaign>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleActive: (id: number, isActive: boolean) =>
    request<Campaign>(`/campaigns/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  remove: (id: number) =>
    request<void>(`/campaigns/${id}`, { method: 'DELETE' }),
};
