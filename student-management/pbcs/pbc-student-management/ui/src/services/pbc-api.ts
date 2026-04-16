// AI-GENERATED
import axios from 'axios';
import type { Student, FlexiblePayload, Pagination } from '../types';

const BASE_URL = import.meta.env.VITE_STUDENT_MGMT_URL || 'http://localhost:3002';

const api = axios.create({ baseURL: `${BASE_URL}/v1` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const studentApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<FlexiblePayload<{ students: Student[]; pagination: Pagination }>>('/students', { params }),

  getById: (id: string) =>
    api.get<FlexiblePayload<Student>>(`/students/${id}`),

  create: (data: Partial<Student>) =>
    api.post<FlexiblePayload<Student>>('/students', { data, metadata: { tenantId: 'tenant-default' } }),

  update: (id: string, data: Partial<Student>) =>
    api.put<FlexiblePayload<Student>>(`/students/${id}`, { data, metadata: { tenantId: 'tenant-default' } }),

  remove: (id: string) =>
    api.delete<FlexiblePayload<{ deleted: boolean }>>(`/students/${id}`),

  changeStatus: (id: string, newStatus: string) =>
    api.patch<FlexiblePayload<Student>>(`/students/${id}/status`, { data: { newStatus }, metadata: { tenantId: 'tenant-default' } }),

  exportExcel: () =>
    api.get('/students/export', { responseType: 'blob' }),
};
