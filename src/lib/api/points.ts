import { request, buildParams } from '@/lib/apiClient';
import {
  PointBalance,
  PointHistoryPage,
  PointGrantPayload,
  PointRevokePayload,
} from '@/types/admin';

/**
 * 어드민 포인트 운영 API.
 * 실제 경로는 AdminPathPrefixConfig에 의해 `/admin` prefix 자동 부여 — `apiClient`의 BASE_URL 기반.
 */
export const pointsApi = {
  getUserPointBalance: (userId: number) =>
    request<PointBalance>(`/users/${userId}/points/balance`),

  getUserPointHistory: (
    userId: number,
    params: { lastId?: number | null; size?: number } = {},
  ) => {
    const qs = buildParams({
      lastId: params.lastId ?? undefined,
      size: params.size ?? undefined,
    });
    const suffix = qs ? `?${qs}` : '';
    return request<PointHistoryPage>(`/users/${userId}/points/history${suffix}`);
  },

  grantUserPoint: (userId: number, payload: PointGrantPayload) =>
    request<PointBalance>(`/users/${userId}/points/grant`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  revokeUserPoint: (userId: number, payload: PointRevokePayload) =>
    request<PointBalance>(`/users/${userId}/points/revoke`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
