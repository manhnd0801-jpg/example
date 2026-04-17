// Types khớp với openapi.yaml — nguồn sự thật là openapi.yaml

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';

export interface StudentDto {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  status: StudentStatus;
  classId?: string;
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

export interface CreateStudentData {
  studentCode: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  classId?: string;
}

export interface UpdateStudentData {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: StudentStatus;
  classId?: string;
}
