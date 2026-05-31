import { request, buildParams } from '@/lib/apiClient';
import { AuditLog, PageResponse } from '@/types/admin';

interface AuditLogParams {
  adminId?: number;
  action?: string;
  targetType?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const auditLogsApi = {
  getAuditLogs: (params: AuditLogParams = {}) => {
    const { page = 0, size = 50, ...rest } = params;
    const qs = buildParams({ page, size, ...rest });
    return request<PageResponse<AuditLog>>(`/audit-logs${qs ? `?${qs}` : ''}`);
  },
};
