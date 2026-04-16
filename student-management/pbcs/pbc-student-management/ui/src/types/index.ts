// AI-GENERATED
export type StudentStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED_OUT';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  phone?: string;
  email?: string;
  status: StudentStatus;
  classId?: string;
  enrollmentDate?: string;
  graduationDate?: string;
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface FlexiblePayload<T = unknown> {
  data: T;
  metadata: {
    timestamp: string;
    requestId: string;
    correlationId?: string;
    tenantId: string;
    error?: { code: string; message: string };
  };
}
