import { request, buildParams } from '@/lib/apiClient';
import { PopularKeyword, SearchKeyword, PagedResponseDto } from '@/types/admin';

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

  getSearchKeywords: (params: SearchKeywordParams = {}) => {
    const { page = 0, size = 50, ...rest } = params;
    const qs = buildParams({ page, size, ...rest });
    return request<PagedResponseDto<SearchKeyword>>(`/search-keywords${qs ? `?${qs}` : ''}`);
  },
};
