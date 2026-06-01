import { request, buildParams } from '@/lib/apiClient';
import {
  PopularKeyword,
  PopularKeywordUpdatePayload,
  PopularKeywordDeletePayload,
  SearchKeyword,
  PagedResponseDto,
} from '@/types/admin';

interface SearchKeywordParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const keywordsApi = {
  getPopularKeywords: () =>
    request<PopularKeyword[]>('/popular-keywords'),

  rebuildPopularKeywords: () =>
    request<void>('/popular-keywords/rebuild', { method: 'POST' }),

  updatePopularKeyword: (id: number, payload: PopularKeywordUpdatePayload) =>
    request<PopularKeyword>(`/popular-keywords/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deletePopularKeyword: (
    id: number,
    opts: { reorder: boolean; reason?: string },
  ) => {
    const qs = buildParams({ reorder: opts.reorder });
    const body: PopularKeywordDeletePayload = { reason: opts.reason };
    return request<void>(`/popular-keywords/${id}${qs ? `?${qs}` : ''}`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
  },

  getSearchKeywords: (params: SearchKeywordParams = {}) => {
    const { page = 0, size = 50, ...rest } = params;
    const qs = buildParams({ page, size, ...rest });
    return request<PagedResponseDto<SearchKeyword>>(`/search-keywords${qs ? `?${qs}` : ''}`);
  },
};
