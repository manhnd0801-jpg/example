// Type declarations for Vite Module Federation remotes
// R-18: Mỗi exposed module cần có type declaration tương ứng

// ── pbc-auth ──────────────────────────────────────────────────────────────────
declare module "pbc_auth/LoginSlot" {
  import type React from "react";
  const Component: React.ComponentType<{
    tenantId?: string;
    onLoginSuccess?: (data: { accessToken: string; refreshToken: string; user: unknown }) => void;
  }>;
  export default Component;
}

declare module "pbc_auth/ProfileSlot" {
  import type React from "react";
  const Component: React.ComponentType<{
    currentUser?: unknown;
    onLogout?: () => void;
  }>;
  export default Component;
}

declare module "pbc_auth/UserManagementSlot" {
  import type React from "react";
  const Component: React.ComponentType<{
    userRole?: string;
  }>;
  export default Component;
}

// ── pbc-student-management ────────────────────────────────────────────────────
declare module "pbc_student_management/bootstrap" {
  import type React from "react";
  const Component: React.ComponentType<Record<string, unknown>>;
  export default Component;
}

// ── pbc-class-management ──────────────────────────────────────────────────────
declare module "pbc_class_management/bootstrap" {
  import type React from "react";
  const Component: React.ComponentType<Record<string, unknown>>;
  export default Component;
}

// ── pbc-course-management ─────────────────────────────────────────────────────
declare module "pbc_course_management/bootstrap" {
  import type React from "react";
  const Component: React.ComponentType<Record<string, unknown>>;
  export default Component;
}

// ── pbc-subject-management ────────────────────────────────────────────────────
declare module "pbc_subject_management/bootstrap" {
  import type React from "react";
  const Component: React.ComponentType<Record<string, unknown>>;
  export default Component;
}

// ── pbc-notification ──────────────────────────────────────────────────────────
declare module "pbc_notification/bootstrap" {
  import type React from "react";
  const Component: React.ComponentType<Record<string, unknown>>;
  export default Component;
}
