import { request, buildParams } from '@/lib/apiClient';
import { ReportGroup, ReportDetail, ReportAction } from '@/types/admin';

export const reportsApi = {
  getUnprocessedCount: () =>
    request<{ count: number }>('/reports/unprocessed-count'),

  getReports: (params: {
    targetType?: string;
    page?: number;
    size?: number;
    processedOnly?: boolean;
  }) => request<ReportGroup[]>(`/reports?${buildParams(params)}`),

  getReportDetails: (targetType: string, targetId: number) =>
    request<ReportDetail[]>(`/reports/${targetType}/${targetId}`),

  resolveReport: (targetType: string, targetId: number, action: ReportAction, reason: string) =>
    request<void>(`/reports/${targetType}/${targetId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),
};
