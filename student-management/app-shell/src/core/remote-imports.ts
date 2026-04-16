// AI-GENERATED
// Các import này PHẢI là literal string để @originjs/vite-plugin-federation transform đúng lúc build
// KHÔNG được dùng dynamic string hay template literal

// pbc-auth slots
export const importLoginSlot = () =>
  import("pbc_auth/LoginSlot").then((m) => m.default ?? m);

export const importProfileSlot = () =>
  import("pbc_auth/ProfileSlot").then((m) => m.default ?? m);

export const importUserManagementSlot = () =>
  import("pbc_auth/UserManagementSlot").then((m) => m.default ?? m);

export const importAuthBootstrap = () =>
  import("pbc_auth/bootstrap").then((m) => m.default ?? m);

// Map scope+module → import function
// Thêm vào đây khi có PBC mới
export const REMOTE_IMPORT_MAP: Record<string, () => Promise<unknown>> = {
  "pbc_auth/LoginSlot":          importLoginSlot,
  "pbc_auth/ProfileSlot":        importProfileSlot,
  "pbc_auth/UserManagementSlot": importUserManagementSlot,
  "pbc_auth/bootstrap":          importAuthBootstrap,
};
