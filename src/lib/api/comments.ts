import { request, buildParams } from '@/lib/apiClient';
import {
  AdminComment,
  AdminCommentDetail,
  PageResponse,
  ReportDetail,
} from '@/types/admin';

export const commentsApi = {
  getCommentsByArticle: (articleId: number, page = 0, size = 50) =>
    request<PageResponse<AdminComment>>(
      `/articles/${articleId}/comments?page=${page}&size=${size}&sort=createdAt,asc`,
    ),

  getComments: (params: {
    page?: number;
    size?: number;
    userId?: number;
    articleId?: number;
    status?: string;
    isHidden?: boolean;
    isReported?: boolean;
    keyword?: string;
    from?: string;
    to?: string;
    sort?: string;
  }) => request<PageResponse<AdminComment>>(`/comments?${buildParams(params)}`),

  getComment: (commentId: number) =>
    request<AdminCommentDetail>(`/comments/${commentId}`),

  getCommentReports: (commentId: number) =>
    request<ReportDetail[]>(`/comments/${commentId}/reports`),

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

  restoreComment: (commentId: number, reason?: string) =>
    request<void>(`/comments/${commentId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
