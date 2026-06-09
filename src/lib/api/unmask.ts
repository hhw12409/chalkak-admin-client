import { request } from '@/lib/apiClient';

export type UnmaskTargetType = 'USER' | 'ADMIN_USER' | 'AUDIT_LOG';

export interface UnmaskGrantResponse {
  targetType: string;
  targetId: number;
  expiresAt: string | null;
  alreadyGranted: boolean;
}

export const unmaskApi = {
  createGrant: (data: {
    targetType: UnmaskTargetType;
    targetId: number;
    reason: string;
  }) =>
    request<UnmaskGrantResponse>('/unmask-grants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
