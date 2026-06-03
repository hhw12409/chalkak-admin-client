import { request, buildParams } from '@/lib/apiClient';
import {
  AdminEvent,
  EventCreatePayload,
  EventUpdatePayload,
  PageResponse,
} from '@/types/admin';

export const eventsApi = {
  getEvents: (params: {
    page?: number;
    size?: number;
    eventStatus?: string;
  }) =>
    request<PageResponse<AdminEvent>>(`/events?${buildParams(params)}`),

  getEvent: (id: number) =>
    request<AdminEvent>(`/events/${id}`),

  createEvent: (payload: EventCreatePayload) =>
    request<AdminEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEvent: (id: number, payload: EventUpdatePayload) =>
    request<AdminEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteEvent: (id: number) =>
    request<void>(`/events/${id}`, { method: 'DELETE' }),

  toggleActive: (id: number) =>
    request<AdminEvent>(`/events/${id}/active`, { method: 'PATCH' }),
};
