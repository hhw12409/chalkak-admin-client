import { request } from '@/lib/apiClient';
import { DashboardSummary, DashboardTrend } from '@/types/admin';

export const dashboardApi = {
  getSummary: () => request<DashboardSummary>('/dashboard/summary'),
  getTrends: (days = 7) => request<DashboardTrend>(`/dashboard/trends?days=${days}`),
};
