import { request, buildParams } from '@/lib/apiClient';
import {
  OssLicense,
  OssLicenseCreatePayload,
  OssLicenseUpdatePayload,
  PageResponse,
} from '@/types/admin';

export const ossLicensesApi = {
  getOssLicenses: (params: {
    page?: number;
    size?: number;
    licenseType?: string;
    keyword?: string;
    isActive?: boolean;
  }) => request<PageResponse<OssLicense>>(`/oss-licenses?${buildParams(params)}`),

  getOssLicense: (id: number) => request<OssLicense>(`/oss-licenses/${id}`),

  createOssLicense: (payload: OssLicenseCreatePayload) =>
    request<OssLicense>('/oss-licenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateOssLicense: (id: number, payload: OssLicenseUpdatePayload) =>
    request<OssLicense>(`/oss-licenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleActive: (id: number) =>
    request<OssLicense>(`/oss-licenses/${id}/active`, { method: 'PATCH' }),

  deleteOssLicense: (id: number) =>
    request<void>(`/oss-licenses/${id}`, { method: 'DELETE' }),
};
