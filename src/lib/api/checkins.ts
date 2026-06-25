import { request, buildParams } from '@/lib/apiClient';
import { Checkin, CrowdLevel, PageResponse } from '@/types/admin';

export const checkinsApi = {
  list: (params: {
    articleId?: number;
    crowdLevel?: CrowdLevel;
    hasMessage?: boolean;
    page?: number;
    size?: number;
  }) => request<PageResponse<Checkin>>(`/checkins?${buildParams(params)}`),

  remove: (id: number) =>
    request<void>(`/checkins/${id}`, { method: 'DELETE' }),
};
