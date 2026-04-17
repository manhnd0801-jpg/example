// AI-GENERATED
// Type-safe HTTP client — tuân thủ quy tắc 15 của PBC-BLUEPRINT
import type {
  ApiResponse, PaginatedData,
  CourseDto, CreateCourseData, UpdateCourseData,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3014';

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

export async function listCourses(params: {
  page?: number; pageSize?: number; search?: string; status?: string;
}): Promise<ApiResponse<PaginatedData<CourseDto>>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<ApiResponse<PaginatedData<CourseDto>>>('GET', `/v1/courses?${qs}`);
}

export async function getCourseById(courseId: string): Promise<ApiResponse<CourseDto>> {
  return request<ApiResponse<CourseDto>>('GET', `/v1/courses/${courseId}`);
}

export async function createCourse(data: CreateCourseData): Promise<ApiResponse<CourseDto>> {
  return request<ApiResponse<CourseDto>>('POST', '/v1/courses', buildBody(data));
}

export async function updateCourse(
  courseId: string,
  data: UpdateCourseData,
): Promise<ApiResponse<CourseDto>> {
  return request<ApiResponse<CourseDto>>('PUT', `/v1/courses/${courseId}`, buildBody(data));
}

export async function deleteCourse(courseId: string): Promise<void> {
  await request('DELETE', `/v1/courses/${courseId}`);
}
