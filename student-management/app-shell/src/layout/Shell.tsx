// app-shell/src/layout/Shell.tsx
//
// App Shell layout — không hard-code PBC hay slot cụ thể (R-17)
// Tất cả slot được đọc từ app-contract.json qua MountPoint component
//
import React from "react";
import { Layout, Menu, Alert } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  ReadOutlined,
  FileTextOutlined,
  BellOutlined,
  DashboardOutlined,
  SafetyOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Navbar } from "./Navbar";
import { DesignTokenProvider } from "./DesignTokenProvider";
import { SessionProvider, useSession } from "../core/session-context";
import { MountPoint } from "../core/MountPoint";
import { getAllSlots } from "../core/slot-registry";
import { WiringPage } from "../pages/wiring/WiringPage";
import registry from "../../../pbc-registry.json";
import contract from "../../../app-contract.json";

const { Sider, Content } = Layout;

interface Props {
  children?: React.ReactNode;
}

// ── Icon map theo scope (dùng field icon từ pbc-registry) ────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  UserOutlined:     <UserOutlined />,
  TeamOutlined:     <TeamOutlined />,
  BookOutlined:     <BookOutlined />,
  ReadOutlined:     <ReadOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  BellOutlined:     <BellOutlined />,
  SafetyOutlined:   <SafetyOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
};

// Roles có quyền vào user-management — đọc từ enabledSlots config
const USER_MGMT_ROLES = (() => {
  for (const pbc of contract.includedPBCs) {
    for (const slot of pbc.enabledSlots ?? []) {
      const s = slot as { slotName: string; requiredRoles?: string[] };
      if (s.slotName === "UserManagementSlot") return s.requiredRoles ?? [];
    }
  }
  return ["ADMIN", "ACADEMIC_STAFF"];
})();

// ── Error boundary cho WiringPage ────────────────────────────────────────────
class WiringErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <Alert
            type="error"
            message="Lỗi tải Wiring Canvas"
            description={this.state.error.message}
            showIcon
          />
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Inner Shell ───────────────────────────────────────────────────────────────
const ShellInner: React.FC<Props> = ({ children }) => {
  const { roles } = useSession();
  const pathname = window.location.pathname;

  const canManageUsers = USER_MGMT_ROLES.some((r) => roles.includes(r));

  // PBC nghiệp vụ — loại trừ pbc-auth
  const businessPBCs = registry.pbcs.filter((p) => p.id !== "pbc-auth");

  // Xác định selectedKey từ route
  const selectedKey =
    businessPBCs.find(
      (p) => pathname === p.mountPath || pathname.startsWith(p.mountPath + "/"),
    )?.id ??
    (pathname.startsWith("/user-management") ? "pbc-auth/user-management" :
     pathname === "/wiring" ? "wiring" : "dashboard");

  const isWiringPage = pathname === "/wiring";

  const menuItems: MenuProps["items"] = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { type: "divider" },
    ...businessPBCs.map((pbc) => ({
      key:   pbc.id,
      icon:  ICON_MAP[(pbc as { icon?: string }).icon ?? ""] ?? <UserOutlined />,
      label: (pbc as { label?: string }).label ?? pbc.displayName,
    })),
    ...(canManageUsers
      ? [
          { type: "divider" as const },
          {
            key:   "admin-group",
            icon:  <SafetyOutlined />,
            label: "Quản trị",
            children: [
              {
                key:   "pbc-auth/user-management",
                icon:  <TeamOutlined />,
                label: "Quản lý người dùng",
              },
            ],
          },
        ]
      : []),
    // Event Wiring — luôn hiển thị cho mọi user đã đăng nhập
    { type: "divider" as const },
    {
      key:   "wiring",
      icon:  <ApartmentOutlined />,
      label: "Event Wiring",
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "pbc-auth/user-management") {
      window.location.href = "/user-management";
      return;
    }
    if (key === "wiring") {
      window.location.href = "/wiring";
      return;
    }
    if (key === "dashboard") {
      window.location.href = "/dashboard";
      return;
    }
    const pbc = registry.pbcs.find((p) => p.id === key);
    if (pbc) window.location.href = pbc.mountPath;
  };

  // Kiểm tra có slot nào match route hiện tại không
  const hasMatchingSlot = getAllSlots().some(
    (s) =>
      s.mountPoint === "main-content" &&
      s.visible &&
      s.routeMatch &&
      pathname.startsWith(s.routeMatch),
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Sider
          width={220}
          style={{
            background:  "#fff",
            borderRight: "1px solid #f0f0f0",
            overflow:    "auto",
            height:      "calc(100vh - 56px)",
            position:    "sticky",
            top:         56,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={canManageUsers ? ["admin-group"] : []}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ height: "100%", borderRight: 0, paddingTop: 8 }}
          />
        </Sider>

        <Content
          style={{
            padding:    isWiringPage ? 0 : 24,
            background: "#f5f5f5",
            minHeight:  "calc(100vh - 56px)",
            overflow:   isWiringPage ? "hidden" : "auto",
          }}
        >
          {/* Wiring page — full canvas, không padding */}
          {isWiringPage ? (
            <WiringErrorBoundary>
              <WiringPage />
            </WiringErrorBoundary>
          ) : hasMatchingSlot ? (
            /* MountPoint đọc config từ app-contract.json — không hard-code slot (R-17) */
            <MountPoint id="main-content" />
          ) : (
            children
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

// ── Shell — wrap với providers ────────────────────────────────────────────────
export const Shell: React.FC<Props> = ({ children }) => (
  <DesignTokenProvider>
    <SessionProvider>
      <ShellInner>{children}</ShellInner>
    </SessionProvider>
  </DesignTokenProvider>
);
