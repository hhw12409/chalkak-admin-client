import { request } from '@/lib/apiClient';
import {
  ActiveExplorerConfig,
  ActiveExplorerConfigUpdatePayload,
} from '@/types/admin';

export const activeExplorerApi = {
  /** 활발한 탐험가 집계 기준 조회 (OPERATOR↑). 행이 없으면 서버가 기본값 1행 생성 후 반환. */
  get: () => request<ActiveExplorerConfig>('/active-explorer-config'),

  /** 활발한 탐험가 집계 기준 수정 (ADMIN 전용). */
  update: (payload: ActiveExplorerConfigUpdatePayload) =>
    request<ActiveExplorerConfig>('/active-explorer-config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
