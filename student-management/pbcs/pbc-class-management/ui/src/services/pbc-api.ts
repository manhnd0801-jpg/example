// AI-GENERATED
// Type-safe HTTP client — tuân thủ quy tắc 15 của PBC-BLUEPRINT
import type {
  ApiResponse, PaginatedData,
  ClassDto, CreateClassData, UpdateClassData,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3013';

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

export async function listClasses(params: {
  page?: number; pageSize?: number; search?: string; status?: string; courseId?: string;
}): Promise<ApiResponse<PaginatedData<ClassDto>>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<ApiResponse<PaginatedData<ClassDto>>>('GET', `/v1/classes?${qs}`);
}

export async function getClassById(classId: string): Promise<ApiResponse<ClassDto>> {
  return request<ApiResponse<ClassDto>>('GET', `/v1/classes/${classId}`);
}

export async function createClass(data: CreateClassData): Promise<ApiResponse<ClassDto>> {
  return request<ApiResponse<ClassDto>>('POST', '/v1/classes', buildBody(data));
}

export async function updateClass(
  classId: string,
  data: UpdateClassData,
): Promise<ApiResponse<ClassDto>> {
  return request<ApiResponse<ClassDto>>('PUT', `/v1/classes/${classId}`, buildBody(data));
}

export async function deleteClass(classId: string): Promise<void> {
  await request('DELETE', `/v1/classes/${classId}`);
}

export async function assignTeacher(
  classId: string,
  teacherId: string,
): Promise<ApiResponse<ClassDto>> {
  return request<ApiResponse<ClassDto>>(
    'PATCH', `/v1/classes/${classId}/teacher`, buildBody({ teacherId }),
  );
}
