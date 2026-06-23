import { request, buildParams } from '@/lib/apiClient';
import { PageResponse } from '@/types/admin';

/** GET /location-shares/stats — 통계 카드 4종 (+ liveActiveUserCount는 1차 null) */
export interface LocationShareStats {
  globalEnabledUserCount: number;
  sharingGrantCount: number;
  ghostGrantCount: number;
  totalGrantCount: number;
  liveActiveUserCount: number | null;
}

/**
 * GET /location-shares 목록 row.
 * ⚠️ `emailMasked`는 **마스킹된 이메일 문자열**(목록 전용, 항상 마스킹).
 *    상세(LocationShareDetail)의 `emailMasked`(boolean 플래그)와 의미가 다름.
 */
export interface LocationShareUser {
  userId: number;
  nickname: string;
  emailMasked: string;
  globalEnabled: boolean;
  sharingCount: number;
  ghostCount: number;
  status: string;
  settingUpdatedAt: string | null;
}

export type GrantStateValue = 'SHARING' | 'GHOST';

/** 이 유저가 owner인 grant (= 이 유저 위치를 보는 사람들) */
export interface OwnerGrant {
  grantId: number;
  viewerUserId: number;
  viewerNickname: string;
  state: GrantStateValue;
  mutualFollow: boolean;
  createdAt: string;
  updatedAt: string | null;
}

/** 이 유저가 viewer인 grant (= 이 유저가 보는 사람들) */
export interface ViewerGrant {
  grantId: number;
  ownerUserId: number;
  ownerNickname: string;
  state: GrantStateValue;
  mutualFollow: boolean;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * GET /location-shares/{userId} 상세.
 * `emailMasked`/`phoneNumberMasked`는 boolean 마스킹 여부 플래그 (USER grant 시 false + 평문).
 */
export interface LocationShareDetail {
  userId: number;
  nickname: string;
  email: string | null;
  emailMasked: boolean;
  phoneNumber: string | null;
  phoneNumberMasked: boolean;
  globalEnabled: boolean;
  status: string;
  settingUpdatedAt: string | null;
  grantsAsOwner: OwnerGrant[];
  grantsAsViewer: ViewerGrant[];
}

/**
 * GET /location-shares/{userId}/live-location.
 * USER_LOCATION grant 없으면 available=false + 좌표 null (에러 아닌 정상 200).
 */
export interface LiveLocation {
  userId: number;
  nickname: string;
  lat: number | null;
  lng: number | null;
  capturedAt: string | null;
  available: boolean;
}

export const locationShareApi = {
  /** GET /location-shares/stats (OPERATOR↑) */
  getStats: () => request<LocationShareStats>('/location-shares/stats'),

  /** GET /location-shares (OPERATOR↑) — PII 항상 마스킹 */
  getUsers: (params: {
    enabledOnly?: boolean;
    keyword?: string;
    page?: number;
    size?: number;
  }) =>
    request<PageResponse<LocationShareUser>>(
      `/location-shares?${buildParams(params)}`,
    ),

  /** GET /location-shares/{userId} (OPERATOR↑) */
  getDetail: (userId: number) =>
    request<LocationShareDetail>(`/location-shares/${userId}`),

  /** PATCH /location-shares/{userId}/disable (ADMIN) — 강제 전역 OFF */
  forceDisable: (userId: number, reason: string) =>
    request<LocationShareDetail>(`/location-shares/${userId}/disable`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  /**
   * DELETE /location-shares/{userId}/grants/{grantId}?reason= (ADMIN)
   * ⚠️ reason은 body가 아닌 **query param**.
   */
  deleteGrant: (userId: number, grantId: number, reason: string) =>
    request<void>(
      `/location-shares/${userId}/grants/${grantId}?${buildParams({ reason })}`,
      { method: 'DELETE' },
    ),

  /** GET /location-shares/{userId}/live-location (ADMIN + USER_LOCATION grant) */
  getLiveLocation: (userId: number) =>
    request<LiveLocation>(`/location-shares/${userId}/live-location`),
};
