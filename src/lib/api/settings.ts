import { request } from '@/lib/apiClient';
import { PlaceType, ArticleType, Board } from '@/types/admin';

export const settingsApi = {
  // Place Types
  getPlaceTypes: () => request<PlaceType[]>('/place-types'),
  createPlaceType: (typeName: string) =>
    request<PlaceType>('/place-types', { method: 'POST', body: JSON.stringify({ typeName }) }),
  updatePlaceType: (id: number, typeName: string) =>
    request<PlaceType>(`/place-types/${id}`, { method: 'PATCH', body: JSON.stringify({ typeName }) }),
  deletePlaceType: (id: number) =>
    request<void>(`/place-types/${id}`, { method: 'DELETE' }),

  // Article Types
  getArticleTypes: () => request<ArticleType[]>('/article-types'),
  createArticleType: (articleType: string) =>
    request<ArticleType>(`/article-types?articleType=${encodeURIComponent(articleType)}`, { method: 'POST' }),
  updateArticleType: (id: number, articleType: string) =>
    request<ArticleType>(`/article-types/${id}`, { method: 'PUT', body: JSON.stringify({ articleType }) }),
  deleteArticleType: (id: number) =>
    request<void>(`/article-types/${id}`, { method: 'DELETE' }),

  // Boards
  getBoards: () => request<Board[]>('/boards'),
  createBoard: (boardName: string) =>
    request<Board>('/boards', { method: 'POST', body: JSON.stringify({ boardName }) }),
  updateBoard: (id: number, boardName: string) =>
    request<Board>(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify({ boardName }) }),
  deleteBoard: (id: number) =>
    request<void>(`/boards/${id}`, { method: 'DELETE' }),
};
