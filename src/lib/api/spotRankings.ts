import { request, buildParams } from '@/lib/apiClient';
import { SpotRanking, SpotRankingPeriod } from '@/types/admin';

export const spotRankingsApi = {
  getSpotRanking: (period: SpotRankingPeriod = 'ALL_TIME') => {
    const qs = buildParams({ period });
    return request<SpotRanking[]>(`/spot-rankings${qs ? `?${qs}` : ''}`);
  },
};
