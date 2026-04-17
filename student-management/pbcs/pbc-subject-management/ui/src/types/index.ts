// Types khớp với openapi.yaml — nguồn sự thật là openapi.yaml

export type SubjectStatus = 'ACTIVE' | 'INACTIVE';

export interface SubjectDto {
  id: string;
  subjectCode: string;
  name: string;
  description?: string;
  credits: number;
  status: SubjectStatus;
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

export interface CreateSubjectData {
  subjectCode: string;
  name: string;
  description?: string;
  credits: number;
}

export interface UpdateSubjectData {
  name?: string;
  description?: string;
  credits?: number;
  status?: SubjectStatus;
}
