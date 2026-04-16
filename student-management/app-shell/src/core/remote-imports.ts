// AI-GENERATED
// Import từng slot riêng lẻ từ pbc-auth — KHÔNG dùng bootstrap để tránh load toàn bộ PBC
// Mỗi slot là một module độc lập, chỉ load khi cần
//
// PHẢI là literal string để @originjs/vite-plugin-federation transform đúng lúc build

// LoginSlot — chỉ dùng ở /login, không load ở các route khác
export const importLoginSlot = () =>
  import("pbc_auth/LoginSlot").then((m) => m.default ?? m);

// ProfileSlot — dùng ở /profile (thông tin cá nhân, đổi mật khẩu)
export const importProfileSlot = () =>
  import("pbc_auth/ProfileSlot").then((m) => m.default ?? m);

// UserManagementSlot — dùng ở /user-management (ADMIN, ACADEMIC_STAFF)
export const importUserManagementSlot = () =>
  import("pbc_auth/UserManagementSlot").then((m) => m.default ?? m);

// Map scope/module → import function
// Thêm vào đây khi có PBC mới
export const REMOTE_IMPORT_MAP: Record<string, () => Promise<unknown>> = {
  "pbc_auth/LoginSlot":          importLoginSlot,
  "pbc_auth/ProfileSlot":        importProfileSlot,
  "pbc_auth/UserManagementSlot": importUserManagementSlot,
};
