// Types khớp với openapi.yaml — nguồn sự thật là openapi.yaml

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

export interface AuditLogDto {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  tenantId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiMetadata {
  timestamp: string;
  requestId: string;
  correlationId: string;
  tenantId: string;
}

export interface ApiResponse<T> {
  data: T;
  metadata: ApiMetadata;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
