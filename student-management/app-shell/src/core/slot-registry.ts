// app-shell/src/core/slot-registry.ts
//
// Đọc enabledSlots từ app-contract.json và cung cấp API truy vấn
// App Shell dùng file này để biết slot nào mount ở đâu — không hard-code trong Shell.tsx
//
import contract from "../../../app-contract.json";

export interface SlotConfig {
  pbcId: string;
  slotName: string;
  mountPoint: string;
  visible: boolean;
  order: number;
  routeMatch?: string;        // Chỉ render khi pathname match prefix này
  triggerEvent?: string;      // Hiện slot khi nhận event này (lazy activation)
  requiredRoles?: string[];   // Chỉ render nếu user có role này
}

// Flatten tất cả enabledSlots từ mọi PBC thành một danh sách phẳng
export function getAllSlots(): SlotConfig[] {
  return contract.includedPBCs.flatMap((pbc) =>
    (pbc.enabledSlots ?? []).map((slot) => ({
      pbcId:         pbc.pbcId,
      slotName:      slot.slotName,
      mountPoint:    slot.mountPoint,
      visible:       slot.visible,
      order:         slot.order ?? 0,
      routeMatch:    (slot as { routeMatch?: string }).routeMatch,
      triggerEvent:  (slot as { triggerEvent?: string }).triggerEvent,
      requiredRoles: (slot as { requiredRoles?: string[] }).requiredRoles,
    })),
  );
}

// Lấy slots cho một mount point cụ thể, filter theo route hiện tại
export function getSlotsForMountPoint(
  mountPoint: string,
  pathname: string,
  userRoles: string[] = [],
): SlotConfig[] {
  return getAllSlots()
    .filter((s) => {
      if (s.mountPoint !== mountPoint) return false;
      if (!s.visible) return false;
      // Route filter — nếu có routeMatch thì pathname phải match
      if (s.routeMatch && !pathname.startsWith(s.routeMatch)) return false;
      // Role filter — nếu có requiredRoles thì user phải có ít nhất 1 role
      if (s.requiredRoles?.length) {
        if (!s.requiredRoles.some((r) => userRoles.includes(r))) return false;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

// Lấy scope của PBC từ pbc-registry để build import key
// Dùng để map pbcId → scope cho REMOTE_IMPORT_MAP
import registry from "../../../pbc-registry.json";

export function getScopeForPBC(pbcId: string): string | undefined {
  return registry.pbcs.find((p) => p.id === pbcId)?.scope;
}
