# pbc-auth — Extension Slots Schema

Định nghĩa contract đầu vào/ra cho từng slot để App Shell hoặc PBC khác mount đúng.

## Slot: login-form

**Component**: `LoginSlot`  
**Props**:
```typescript
interface LoginSlotProps {
  tenantId?: string;           // Tenant context — đọc từ App Shell
  onLoginSuccess?: (data: LoginResponseData) => void;
  onLoginError?: (error: Error) => void;
}
```
**Events emitted**: `pbc.auth.user.logged-in`

## Slot: profile

**Component**: `ProfileSlot`  
**Props**:
```typescript
interface ProfileSlotProps {
  currentUser?: UserDto;       // Inject từ App Shell sau khi login
  onLogout?: () => void;
}
```
**Events emitted**: `pbc.auth.user.logged-out`

## Slot: user-management

**Component**: `UserManagementSlot`  
**Props**: none (tự fetch data từ API)  
**Required permissions**: `user:read`, `user:write`, `user:delete`  
**Events emitted**: `pbc.auth.user.created`, `pbc.auth.user.role-changed`

## Slot: role-management

**Component**: `RoleManagementSlot` *(chưa implement)*  
**Required permissions**: `role:read`, `role:write`
