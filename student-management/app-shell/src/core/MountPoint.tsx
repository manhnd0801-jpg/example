// app-shell/src/core/MountPoint.tsx
//
// Component render tất cả slot được cấu hình cho một mount point
// App Shell layout chỉ cần đặt <MountPoint id="main-content" /> — không biết gì về PBC cụ thể
//
import React, { Suspense, lazy, useState, useEffect } from "react";
import { Spin } from "antd";
import { getSlotsForMountPoint, getScopeForPBC } from "./slot-registry";
import { importFromRemote, getEnabledPBCs } from "./pbc-loader";
import { subscribe } from "./event-bus";
import { useSession } from "./session-context";
import type { SlotConfig } from "./slot-registry";

interface MountPointProps {
  id: string;
  // Props bổ sung truyền xuống tất cả slot trong mount point này
  slotProps?: Record<string, unknown>;
}

// ── SlotRenderer — render một slot đơn lẻ ────────────────────────────────────
function SlotRenderer({
  slot,
  slotProps,
}: {
  slot: SlotConfig;
  slotProps?: Record<string, unknown>;
}) {
  const [visible, setVisible] = useState(slot.visible);

  // Lazy activation qua triggerEvent
  useEffect(() => {
    if (!slot.triggerEvent) return;
    const sub = subscribe(slot.triggerEvent, () => setVisible(true));
    return () => sub.unsubscribe();
  }, [slot.triggerEvent]);

  if (!visible) return null;

  const scope = getScopeForPBC(slot.pbcId);
  if (!scope) {
    console.warn(`[MountPoint] Không tìm thấy scope cho PBC: ${slot.pbcId}`);
    return null;
  }

  const entry = getEnabledPBCs().find((p) => p.pbcId === slot.pbcId);
  if (!entry) {
    console.warn(`[MountPoint] PBC không có trong registry: ${slot.pbcId}`);
    return null;
  }

  const LazySlot = lazy(() =>
    importFromRemote<React.ComponentType<Record<string, unknown>>>(
      entry,
      `./${slot.slotName}`,
    ).then((C) => ({ default: C })),
  );

  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin size="large" tip={`Đang tải ${slot.slotName}...`} />
        </div>
      }
    >
      <LazySlot {...(slotProps ?? {})} />
    </Suspense>
  );
}

// ── MountPoint — render tất cả slot cho một vị trí ───────────────────────────
export const MountPoint: React.FC<MountPointProps> = ({ id, slotProps }) => {
  const { roles } = useSession();
  const pathname = window.location.pathname;

  const slots = getSlotsForMountPoint(id, pathname, roles);

  if (slots.length === 0) return null;

  return (
    <>
      {slots.map((slot) => (
        <SlotRenderer
          key={`${slot.pbcId}/${slot.slotName}`}
          slot={slot}
          slotProps={slotProps}
        />
      ))}
    </>
  );
};
