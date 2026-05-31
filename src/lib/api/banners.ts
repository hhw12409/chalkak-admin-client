import { request } from '@/lib/apiClient';
import { Banner, BannerPayload } from '@/types/admin';

export const bannersApi = {
  getBanners: () =>
    request<Banner[]>('/banners'),

  getBanner: (id: number) =>
    request<Banner>(`/banners/${id}`),

  createBanner: (payload: BannerPayload) =>
    request<Banner>('/banners', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateBanner: (id: number, payload: Partial<BannerPayload>) =>
    request<Banner>(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteBanner: (id: number) =>
    request<void>(`/banners/${id}`, { method: 'DELETE' }),
};
