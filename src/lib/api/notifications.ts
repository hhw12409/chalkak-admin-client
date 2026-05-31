import { request } from '@/lib/apiClient';

export const notificationsApi = {
  sendToUser: (recipientUserId: number, message: string) =>
    request<void>('/notifications/send', {
      method: 'POST',
      body: JSON.stringify({ recipientUserId, message }),
    }),

  broadcast: (message: string) =>
    request<{ recipientCount: number }>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
