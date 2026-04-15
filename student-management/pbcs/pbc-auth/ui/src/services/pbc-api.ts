// AI-GENERATED
// Type-safe HTTP client — tuân thủ quy tắc 15 của PBC-BLUEPRINT
import type {
  ApiResponse, PaginatedData,
  LoginRequestData, LoginResponseData,
  UserDto, RoleDto, PermissionDto,
  CreateUserData, UpdateUserData,
} from '../types';

const BASE_URL = import.meta.env.VITE_AUTH_API_URL ?? 'http://localhost:3001';

async function request<TResponse, TBody = unknown>(
  method: string,
  path: string,
  body?: TBody,
  token?: string,
): Promise<TResponse> {
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

function buildBody<T>(data: T, tenantId?: string) {
  return {
    data,
    metadata: {
      requestId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      tenantId: tenantId ?? localStorage.getItem('tenantId') ?? 'default',
    },
  };
}

// Auth
export async function login(
  data: LoginRequestData,
  tenantId: string,
): Promise<ApiResponse<LoginResponseData>> {
  return request<ApiResponse<LoginResponseData>>('POST', '/v1/auth/login', buildBody(data, tenantId));
}

export async function logout(refreshToken: string, allDevices = false): Promise<void> {
  const token = localStorage.getItem('accessToken') ?? '';
  await request('POST', '/v1/auth/logout', buildBody({ refreshToken, allDevices }), token);
}

export async function refreshToken(
  refreshToken: string,
  tenantId: string,
): Promise<ApiResponse<LoginResponseData>> {
  return request<ApiResponse<LoginResponseData>>(
    'POST', '/v1/auth/refresh', buildBody({ refreshToken }, tenantId),
  );
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const token = localStorage.getItem('accessToken') ?? '';
  await request('POST', '/v1/auth/change-password', buildBody({ currentPassword, newPassword }), token);
}

// Users
export async function listUsers(params: {
  page?: number; pageSize?: number; search?: string; status?: string;
}): Promise<ApiResponse<PaginatedData<UserDto>>> {
  const token = localStorage.getItem('accessToken') ?? '';
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<ApiResponse<PaginatedData<UserDto>>>('GET', `/v1/users?${qs}`, undefined, token);
}

export async function getUserById(userId: string): Promise<ApiResponse<UserDto>> {
  const token = localStorage.getItem('accessToken') ?? '';
  return request<ApiResponse<UserDto>>('GET', `/v1/users/${userId}`, undefined, token);
}

export async function createUser(data: CreateUserData): Promise<ApiResponse<UserDto>> {
  const token = localStorage.getItem('accessToken') ?? '';
  return request<ApiResponse<UserDto>>('POST', '/v1/users', buildBody(data), token);
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<ApiResponse<UserDto>> {
  const token = localStorage.getItem('accessToken') ?? '';
  return request<ApiResponse<UserDto>>('PUT', `/v1/users/${userId}`, buildBody(data), token);
}

export async function deleteUser(userId: string): Promise<void> {
  const token = localStorage.getItem('accessToken') ?? '';
  await request('DELETE', `/v1/users/${userId}`, undefined, token);
}

export async function changeUserRole(userId: string, roleId: string): Promise<ApiResponse<UserDto>> {
  const token = localStorage.getItem('accessToken') ?? '';
  return request<ApiResponse<UserDto>>('PATCH', `/v1/users/${userId}/role`, buildBody({ roleId }), token);
}

// Roles
export async function listRoles(): Promise<ApiResponse<{ items: RoleDto[] }>> {
  const token = localStorage.getItem('accessToken') ?? '';
  return request<ApiResponse<{ items: RoleDto[] }>>('GET', '/v1/roles', undefined, token);
}

// Permissions
export async function listPermissions(): Promise<ApiResponse<{ items: PermissionDto[] }>> {
  const token = localStorage.getItem('accessToken') ?? '';
  return request<ApiResponse<{ items: PermissionDto[] }>>('GET', '/v1/permissions', undefined, token);
}
