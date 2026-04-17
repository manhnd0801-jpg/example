// AI-GENERATED
// Type-safe HTTP client — tuân thủ quy tắc 15 của PBC-BLUEPRINT
import type {
  ApiResponse, PaginatedData,
  SubjectDto, CreateSubjectData, UpdateSubjectData,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3015';

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

export async function listSubjects(params: {
  page?: number; pageSize?: number; search?: string; status?: string;
}): Promise<ApiResponse<PaginatedData<SubjectDto>>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<ApiResponse<PaginatedData<SubjectDto>>>('GET', `/v1/subjects?${qs}`);
}

export async function getSubjectById(subjectId: string): Promise<ApiResponse<SubjectDto>> {
  return request<ApiResponse<SubjectDto>>('GET', `/v1/subjects/${subjectId}`);
}

export async function createSubject(data: CreateSubjectData): Promise<ApiResponse<SubjectDto>> {
  return request<ApiResponse<SubjectDto>>('POST', '/v1/subjects', buildBody(data));
}

export async function updateSubject(
  subjectId: string,
  data: UpdateSubjectData,
): Promise<ApiResponse<SubjectDto>> {
  return request<ApiResponse<SubjectDto>>('PUT', `/v1/subjects/${subjectId}`, buildBody(data));
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await request('DELETE', `/v1/subjects/${subjectId}`);
}
