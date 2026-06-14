import { request, buildParams } from '@/lib/apiClient';
import {
  Faq,
  FaqCreatePayload,
  FaqUpdatePayload,
  PageResponse,
} from '@/types/admin';

export const faqsApi = {
  getFaqs: (params: {
    page?: number;
    size?: number;
    category?: string;
    keyword?: string;
    isActive?: boolean;
  }) => request<PageResponse<Faq>>(`/faqs?${buildParams(params)}`),

  getFaq: (id: number) => request<Faq>(`/faqs/${id}`),

  createFaq: (payload: FaqCreatePayload) =>
    request<Faq>('/faqs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateFaq: (id: number, payload: FaqUpdatePayload) =>
    request<Faq>(`/faqs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleActive: (id: number) =>
    request<Faq>(`/faqs/${id}/active`, { method: 'PATCH' }),

  deleteFaq: (id: number) =>
    request<void>(`/faqs/${id}`, { method: 'DELETE' }),
};
