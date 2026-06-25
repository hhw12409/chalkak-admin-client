import { request } from '@/lib/apiClient';
import { DashboardSummary, DashboardTrend, RetentionStats } from '@/types/admin';

export const dashboardApi = {
  getSummary: () => request<DashboardSummary>('/dashboard/summary'),
  getTrends: (days = 7) => request<DashboardTrend>(`/dashboard/trends?days=${days}`),
  getRetention: () => request<RetentionStats>('/dashboard/retention'),
};
