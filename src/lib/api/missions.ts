import { request, buildParams } from '@/lib/apiClient';
import {
  Mission,
  MissionCreatePayload,
  MissionStats,
  MissionUpdatePayload,
} from '@/types/mission';

export const missionsApi = {
  listMissions: (active?: boolean) => {
    const qs = buildParams({ active });
    return request<Mission[]>(`/missions${qs ? `?${qs}` : ''}`);
  },

  getMission: (missionKey: string) =>
    request<Mission>(`/missions/${encodeURIComponent(missionKey)}`),

  createMission: (payload: MissionCreatePayload) =>
    request<Mission>('/missions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMission: (missionKey: string, payload: MissionUpdatePayload) =>
    request<Mission>(`/missions/${encodeURIComponent(missionKey)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deactivateMission: (missionKey: string) =>
    request<void>(`/missions/${encodeURIComponent(missionKey)}`, {
      method: 'DELETE',
    }),

  getMissionStats: (missionKey: string, date?: string) => {
    const qs = buildParams({ date });
    return request<MissionStats>(
      `/missions/${encodeURIComponent(missionKey)}/stats${qs ? `?${qs}` : ''}`,
    );
  },
};
