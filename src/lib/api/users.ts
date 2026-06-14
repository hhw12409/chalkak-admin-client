import { request, buildParams } from '@/lib/apiClient';
import {
  AdminUser,
  UserSanction,
  SanctionLevel,
  PageResponse,
  ForceWithdrawalPayload,
  ForceLogoutPayload,
} from '@/types/admin';

export const usersApi = {
  getUsers: (params: { page?: number; size?: number; status?: string; keyword?: string }) =>
    request<PageResponse<AdminUser>>(`/users?${buildParams(params)}`),

  getUser: (userId: number) =>
    request<AdminUser>(`/users/${userId}`),

  getUserSanctions: (userId: number) =>
    request<UserSanction[]>(`/users/${userId}/sanctions`),

  sanctionUser: (userId: number, level: SanctionLevel, reason: string) =>
    request<UserSanction>(`/users/${userId}/sanctions`, {
      method: 'POST',
      body: JSON.stringify({ level, reason }),
    }),

  revokeSanction: (userId: number, sanctionId: number) =>
    request<void>(`/users/${userId}/sanctions/${sanctionId}`, { method: 'DELETE' }),

  /**
   * 사용자에게 직책 마스터 부여 또는 해제.
   * `titleId=null` 이면 해제. 비활성/삭제된 마스터는 서버에서 거부.
   */
  assignUserTitle: (userId: number, titleId: number | null) =>
    request<AdminUser>(`/users/${userId}/title-id`, {
      method: 'PATCH',
      body: JSON.stringify({ titleId }),
    }),

  /**
   * 강제 로그아웃 — 모든 디바이스에서 Refresh Token 일괄 삭제.
   * 계정 상태(status)는 유지. ADMIN 전용.
   */
  forceLogoutUser: (userId: number, payload: ForceLogoutPayload) =>
    request<void>(`/users/${userId}/force-logout`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * 강제 탈퇴 — 회원 정보 익명화 + 토큰 전체 삭제 + status=DELETED.
   * 비가역. ADMIN 전용.
   */
  forceWithdrawUser: (userId: number, payload: ForceWithdrawalPayload) =>
    request<void>(`/users/${userId}/force-withdrawal`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
