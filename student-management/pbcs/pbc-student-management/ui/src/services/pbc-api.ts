// AI-GENERATED
// Type-safe HTTP client — tuân thủ quy tắc 15 của PBC-BLUEPRINT
import type {
  ApiResponse, PaginatedData,
  StudentDto, CreateStudentData, UpdateStudentData,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3012';

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

export async function listStudents(params: {
  page?: number; pageSize?: number; search?: string; status?: string; classId?: string;
}): Promise<ApiResponse<PaginatedData<StudentDto>>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<ApiResponse<PaginatedData<StudentDto>>>('GET', `/v1/students?${qs}`);
}

export async function getStudentById(studentId: string): Promise<ApiResponse<StudentDto>> {
  return request<ApiResponse<StudentDto>>('GET', `/v1/students/${studentId}`);
}

export async function createStudent(data: CreateStudentData): Promise<ApiResponse<StudentDto>> {
  return request<ApiResponse<StudentDto>>('POST', '/v1/students', buildBody(data));
}

export async function updateStudent(
  studentId: string,
  data: UpdateStudentData,
): Promise<ApiResponse<StudentDto>> {
  return request<ApiResponse<StudentDto>>('PUT', `/v1/students/${studentId}`, buildBody(data));
}

export async function deleteStudent(studentId: string): Promise<void> {
  await request('DELETE', `/v1/students/${studentId}`);
}
