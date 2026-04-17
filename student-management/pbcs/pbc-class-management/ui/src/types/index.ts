// Types khớp với openapi.yaml — nguồn sự thật là openapi.yaml

export type ClassStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface ClassDto {
  id: string;
  classCode: string;
  name: string;
  courseId: string;
  teacherId?: string;
  maxStudents: number;
  currentStudents: number;
  status: ClassStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateClassData {
  classCode: string;
  name: string;
  courseId: string;
  maxStudents: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateClassData {
  name?: string;
  teacherId?: string;
  maxStudents?: number;
  status?: ClassStatus;
  startDate?: string;
  endDate?: string;
}
