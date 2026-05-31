import { request } from '@/lib/apiClient';
import { AdminComment, PageResponse } from '@/types/admin';

export const commentsApi = {
  getCommentsByArticle: (articleId: number, page = 0, size = 50) =>
    request<PageResponse<AdminComment>>(
      `/articles/${articleId}/comments?page=${page}&size=${size}&sort=createdAt,asc`,
    ),

  hideComment: (commentId: number, reason?: string) =>
    request<void>(`/comments/${commentId}/hide`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unhideComment: (commentId: number) =>
    request<void>(`/comments/${commentId}/unhide`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  deleteComment: (commentId: number, reason?: string) =>
    request<void>(`/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    }),
};
