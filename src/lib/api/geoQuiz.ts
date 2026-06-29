import { request, buildParams } from '@/lib/apiClient';
import {
  GeoQuizConfig,
  GeoQuizConfigUpdatePayload,
  GeoQuizExcludedArticle,
  GeoQuizFeaturedArticle,
  GeoQuizPlay,
  GeoQuizPlayDetail,
  GeoQuizStats,
  PageResponse,
} from '@/types/admin';

export const geoQuizApi = {
  /** 게임 설정 조회 (OPERATOR↑). 테이블 미생성 시 서버가 기본값 DTO 폴백. */
  getConfig: () => request<GeoQuizConfig>('/geo-quiz/config'),

  /** 게임 설정 수정 (ADMIN 전용, 부분 갱신). */
  updateConfig: (payload: GeoQuizConfigUpdatePayload) =>
    request<GeoQuizConfig>('/geo-quiz/config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  /** 출제 제외(블록리스트) 목록 (OPERATOR↑). */
  listExcluded: (params: { page?: number; size?: number }) =>
    request<PageResponse<GeoQuizExcludedArticle>>(
      `/geo-quiz/excluded-articles?${buildParams(params)}`,
    ),

  /** 출제 제외 등록 (ADMIN 전용). */
  createExcluded: (payload: { articleId: number; reason?: string }) =>
    request<GeoQuizExcludedArticle>('/geo-quiz/excluded-articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** 출제 제외 해제 (ADMIN 전용, 물리 삭제). */
  removeExcluded: (id: number) =>
    request<void>(`/geo-quiz/excluded-articles/${id}`, { method: 'DELETE' }),

  /** 출제 지정(큐레이션 화이트리스트) 목록 (OPERATOR↑). */
  listFeatured: (params: { page?: number; size?: number }) =>
    request<PageResponse<GeoQuizFeaturedArticle>>(
      `/geo-quiz/featured-articles?${buildParams(params)}`,
    ),

  /** 출제 지정 등록 (ADMIN 전용). */
  createFeatured: (payload: { articleId: number; reason?: string }) =>
    request<GeoQuizFeaturedArticle>('/geo-quiz/featured-articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** 출제 지정 해제 (ADMIN 전용, 물리 삭제). */
  removeFeatured: (id: number) =>
    request<void>(`/geo-quiz/featured-articles/${id}`, { method: 'DELETE' }),

  /** 통계 대시보드 (OPERATOR↑). */
  getStats: (params: { days?: number; date?: string }) =>
    request<GeoQuizStats>(`/dashboard/geo-quiz?${buildParams(params)}`),

  /** 유저 플레이 기록 목록 (OPERATOR↑). userId 필수. */
  listPlays: (params: { userId: number; page?: number; size?: number }) =>
    request<PageResponse<GeoQuizPlay>>(`/geo-quiz/plays?${buildParams(params)}`),

  /** 플레이 상세 (play + guesses) (OPERATOR↑). */
  getPlay: (playId: number) =>
    request<GeoQuizPlayDetail>(`/geo-quiz/plays/${playId}`),

  /** 점수 정정 (ADMIN 전용, 사유 필수). */
  updatePlayScore: (
    playId: number,
    payload: { totalScore: number; reason: string },
  ) =>
    request<GeoQuizPlay>(`/geo-quiz/plays/${playId}/score`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  /** 플레이 삭제 (ADMIN 전용, guess 선삭제 후 물리 삭제). */
  removePlay: (playId: number, reason?: string) =>
    request<void>(
      `/geo-quiz/plays/${playId}${
        reason ? `?reason=${encodeURIComponent(reason)}` : ''
      }`,
      { method: 'DELETE' },
    ),
};
