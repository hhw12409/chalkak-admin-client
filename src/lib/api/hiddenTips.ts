import { request, buildParams } from '@/lib/apiClient';
import { HiddenTip, HiddenTipUpdatePayload, PageResponse } from '@/types/admin';

export const hiddenTipsApi = {
  list: (params: {
    articleId?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }) => request<PageResponse<HiddenTip>>(`/hidden-tips?${buildParams(params)}`),

  get: (id: number) => request<HiddenTip>(`/hidden-tips/${id}`),

  update: (id: number, payload: HiddenTipUpdatePayload) =>
    request<HiddenTip>(`/hidden-tips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    request<void>(`/hidden-tips/${id}`, { method: 'DELETE' }),
};
