// AI-GENERATED
// Types khớp với openapi.yaml — nguồn sự thật là openapi.yaml

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACADEMIC_STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface PermissionDto {
  id: string;
  code: string;
  resource: string;
  action: string;
  description: string | null;
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

export interface LoginRequestData {
  username: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  roleId: string;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  status?: UserStatus;
}
