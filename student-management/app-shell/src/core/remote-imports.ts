// app-shell/src/core/remote-imports.ts
//
// R-18: PHẢI là literal string để @originjs/vite-plugin-federation transform đúng lúc build
// Thêm entry vào đây mỗi khi thêm PBC mới hoặc slot mới vào enabledSlots

// ── pbc-auth slots ────────────────────────────────────────────────────────────
export const importLoginSlot = () =>
  import("pbc_auth/LoginSlot").then((m) => m.default ?? m);

export const importProfileSlot = () =>
  import("pbc_auth/ProfileSlot").then((m) => m.default ?? m);

export const importUserManagementSlot = () =>
  import("pbc_auth/UserManagementSlot").then((m) => m.default ?? m);

// ── pbc-student-management ────────────────────────────────────────────────────
export const importStudentManagementBootstrap = () =>
  import("pbc_student_management/bootstrap").then((m) => m.default ?? m);

// ── pbc-class-management ──────────────────────────────────────────────────────
export const importClassManagementBootstrap = () =>
  import("pbc_class_management/bootstrap").then((m) => m.default ?? m);

// ── pbc-course-management ─────────────────────────────────────────────────────
export const importCourseManagementBootstrap = () =>
  import("pbc_course_management/bootstrap").then((m) => m.default ?? m);

// ── pbc-subject-management ────────────────────────────────────────────────────
export const importSubjectManagementBootstrap = () =>
  import("pbc_subject_management/bootstrap").then((m) => m.default ?? m);

// ── pbc-notification ──────────────────────────────────────────────────────────
export const importNotificationBootstrap = () =>
  import("pbc_notification/bootstrap").then((m) => m.default ?? m);

// ── Map scope/module → import function ───────────────────────────────────────
// Key format: "<scope>/<moduleName>" (không có "./")
export const REMOTE_IMPORT_MAP: Record<string, () => Promise<unknown>> = {
  // pbc-auth
  "pbc_auth/LoginSlot":          importLoginSlot,
  "pbc_auth/ProfileSlot":        importProfileSlot,
  "pbc_auth/UserManagementSlot": importUserManagementSlot,
  // business PBCs
  "pbc_student_management/bootstrap": importStudentManagementBootstrap,
  "pbc_class_management/bootstrap":   importClassManagementBootstrap,
  "pbc_course_management/bootstrap":  importCourseManagementBootstrap,
  "pbc_subject_management/bootstrap": importSubjectManagementBootstrap,
  "pbc_notification/bootstrap":       importNotificationBootstrap,
};
