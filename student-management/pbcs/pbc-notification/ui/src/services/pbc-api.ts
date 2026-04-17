// AI-GENERATED
// Type-safe HTTP client — tuân thủ quy tắc 15 của PBC-BLUEPRINT
import type {
  ApiResponse, PaginatedData,
  NotificationDto, AuditLogDto,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3016';

async function request<TResponse, TBody = unknown>(
  method: string,
  path: string,
  body?: TBody,
): Promise<TResponse> {
  const token = localStorage.getItem('accessToken') ?? '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': localStorage.getItem('tenantId') ?? 'default',
    'X-Correlation-Id': crypto.randomUUID(),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<TResponse>;
}

function buildBody<T>(data: T) {
  return {
    data,
    metadata: {
      requestId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      tenantId: localStorage.getItem('tenantId') ?? 'default',
    },
  };
}

export async function listNotifications(params: {
  page?: number; pageSize?: number; status?: string; userId?: string;
}): Promise<ApiResponse<PaginatedData<NotificationDto>>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<ApiResponse<PaginatedData<NotificationDto>>>('GET', `/v1/notifications?${qs}`);
}

export async function markAsRead(notificationId: string): Promise<ApiResponse<NotificationDto>> {
  return request<ApiResponse<NotificationDto>>(
    'PATCH', `/v1/notifications/${notificationId}/read`, buildBody({}),
  );
}

export async function dismissNotification(
  notificationId: string,
): Promise<ApiResponse<NotificationDto>> {
  return request<ApiResponse<NotificationDto>>(
    'PATCH', `/v1/notifications/${notificationId}/dismiss`, buildBody({}),
  );
}

export async function getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
  return request<ApiResponse<{ count: number }>>('GET', '/v1/notifications/unread-count');
}

export async function listAuditLogs(params: {
  page?: number; pageSize?: number; resource?: string; userId?: string;
}): Promise<ApiResponse<PaginatedData<AuditLogDto>>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<ApiResponse<PaginatedData<AuditLogDto>>>('GET', `/v1/audit-logs?${qs}`);
}
