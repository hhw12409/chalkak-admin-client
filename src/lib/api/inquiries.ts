import { request, buildParams } from '@/lib/apiClient';
import { AdminInquiry, PageResponse } from '@/types/admin';

export const inquiriesApi = {
  getInquiries: (params: { page?: number; size?: number; status?: string; category?: string }) =>
    request<PageResponse<AdminInquiry>>(`/inquiries?${buildParams(params)}`),

  getInquiry: (id: number) =>
    request<AdminInquiry>(`/inquiries/${id}`),

  answerInquiry: (id: number, answer: string) =>
    request<void>(`/inquiries/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),
};
