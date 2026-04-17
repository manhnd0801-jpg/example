// Types khớp với openapi.yaml — nguồn sự thật là openapi.yaml

export type CourseStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface CourseDto {
  id: string;
  courseCode: string;
  name: string;
  description?: string;
  credits: number;
  status: CourseStatus;
  subjectIds: string[];
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

export interface CreateCourseData {
  courseCode: string;
  name: string;
  description?: string;
  credits: number;
  subjectIds?: string[];
}

export interface UpdateCourseData {
  name?: string;
  description?: string;
  credits?: number;
  status?: CourseStatus;
  subjectIds?: string[];
}
