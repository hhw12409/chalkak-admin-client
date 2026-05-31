import { request } from '@/lib/apiClient';
import { AdminUserAccount, AdminRole, AdminUserStatus } from '@/types/admin';

export const adminUsersApi = {
  listAdmins: () => request<AdminUserAccount[]>('/auth/admin-users'),

  createAdmin: (data: { username: string; password: string; email: string; name: string; role: AdminRole }) =>
    request<void>('/auth/admin-users', { method: 'POST', body: JSON.stringify(data) }),

  updateRole: (adminId: number, role: AdminRole) =>
    request<AdminUserAccount>(`/auth/admin-users/${adminId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  updateStatus: (adminId: number, status: AdminUserStatus) =>
    request<AdminUserAccount>(`/auth/admin-users/${adminId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
