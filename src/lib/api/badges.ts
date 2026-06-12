import { request, buildParams } from '@/lib/apiClient';
import {
  Badge,
  BadgeCategory,
  BadgeCreatePayload,
  BadgeStats,
  BadgeUpdatePayload,
} from '@/types/badge';

export const badgesApi = {
  listBadges: (params?: { active?: boolean; category?: BadgeCategory }) => {
    const qs = buildParams({
      active: params?.active,
      category: params?.category,
    });
    return request<Badge[]>(`/badges${qs ? `?${qs}` : ''}`);
  },

  getBadge: (badgeKey: string) =>
    request<Badge>(`/badges/${encodeURIComponent(badgeKey)}`),

  createBadge: (payload: BadgeCreatePayload) =>
    request<Badge>('/badges', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateBadge: (badgeKey: string, payload: BadgeUpdatePayload) =>
    request<Badge>(`/badges/${encodeURIComponent(badgeKey)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deactivateBadge: (badgeKey: string) =>
    request<void>(`/badges/${encodeURIComponent(badgeKey)}`, {
      method: 'DELETE',
    }),

  getBadgeStats: (badgeKey: string) =>
    request<BadgeStats>(`/badges/${encodeURIComponent(badgeKey)}/stats`),
};
