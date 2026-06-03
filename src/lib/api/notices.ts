import { request, buildParams } from '@/lib/apiClient';
import {
  Notice,
  NoticeCreatePayload,
  NoticeUpdatePayload,
  PageResponse,
} from '@/types/admin';

export const noticesApi = {
  getNotices: (params: {
    page?: number;
    size?: number;
    category?: string;
    keyword?: string;
    isActive?: boolean;
  }) =>
    request<PageResponse<Notice>>(`/notices?${buildParams(params)}`),

  getNotice: (id: number) =>
    request<Notice>(`/notices/${id}`),

  createNotice: (payload: NoticeCreatePayload) =>
    request<Notice>('/notices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateNotice: (id: number, payload: NoticeUpdatePayload) =>
    request<Notice>(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteNotice: (id: number) =>
    request<void>(`/notices/${id}`, { method: 'DELETE' }),

  togglePin: (id: number) =>
    request<Notice>(`/notices/${id}/pin`, { method: 'PATCH' }),

  toggleActive: (id: number) =>
    request<Notice>(`/notices/${id}/active`, { method: 'PATCH' }),
};
