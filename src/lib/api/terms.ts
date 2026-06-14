import { request, buildParams } from '@/lib/apiClient';
import {
  PageResponse,
  Term,
  TermCreatePayload,
  TermUpdatePayload,
} from '@/types/admin';

export const termsApi = {
  getTerms: (params: {
    page?: number;
    size?: number;
    type?: string;
    keyword?: string;
    isActive?: boolean;
  }) => request<PageResponse<Term>>(`/terms?${buildParams(params)}`),

  getTerm: (id: number) => request<Term>(`/terms/${id}`),

  createTerm: (payload: TermCreatePayload) =>
    request<Term>('/terms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTerm: (id: number, payload: TermUpdatePayload) =>
    request<Term>(`/terms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleActive: (id: number) =>
    request<Term>(`/terms/${id}/active`, { method: 'PATCH' }),

  deleteTerm: (id: number) =>
    request<void>(`/terms/${id}`, { method: 'DELETE' }),
};
