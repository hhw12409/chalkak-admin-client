import { request, buildParams } from '@/lib/apiClient';
import { AdminArticle, PageResponse } from '@/types/admin';

export const articlesApi = {
  getArticles: (params: {
    page?: number;
    size?: number;
    userId?: number;
    status?: string;
    isHidden?: boolean;
    keyword?: string;
  }) => request<PageResponse<AdminArticle>>(`/articles?${buildParams(params)}`),

  getArticle: (id: number) =>
    request<AdminArticle>(`/articles/${id}`),

  hideArticle: (id: number, reason?: string) =>
    request<void>(`/articles/${id}/hide`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unhideArticle: (id: number) =>
    request<void>(`/articles/${id}/unhide`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  deleteArticle: (id: number, reason?: string) =>
    request<void>(`/articles/${id}`, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
    }),

  restoreArticle: (id: number) =>
    request<void>(`/articles/${id}/restore`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  getTopArticles: (sortBy: 'READ_COUNT' | 'LIKE_COUNT' = 'READ_COUNT', limit = 10) =>
    request<AdminArticle[]>(`/articles/top?sortBy=${sortBy}&limit=${limit}`),
};
