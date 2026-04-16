// AI-GENERATED
import React, { Suspense, lazy, useState, useEffect } from "react";
import { Layout, Menu, Spin } from "antd";
import {
  UserOutlined,
  BookOutlined,
  FormOutlined,
  DashboardOutlined,
  TeamOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Navbar } from "./Navbar";
import { DesignTokenProvider } from "./DesignTokenProvider";
import { getEnabledPBCs, importFromRemote } from "../core/pbc-loader";
const { Sider, Content } = Layout;

interface Props {
  children?: React.ReactNode;
}

interface UserInfo {
  userId: string;
  username: string;
  role: string;
  email?: string;
  fullName?: string;
  status?: string;
}

// Icon và label cho PBC nghiệp vụ
const PBC_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  "student-profile":       { label: "Sinh viên",    icon: <UserOutlined /> },
  "course-management":     { label: "Khóa học",     icon: <BookOutlined /> },
  "enrollment-management": { label: "Đăng ký học",  icon: <FormOutlined /> },
};

// Roles được phép vào User Management
const USER_MANAGEMENT_ROLES = ["ADMIN", "ACADEMIC_STAFF"];

// Lazy load ProfileSlot từ pbc-auth
const LazyProfileSlot = lazy(() => {
  const authEntry = getEnabledPBCs().find((p) => p.pbcId === "auth");
  if (!authEntry) return Promise.reject(new Error("pbc-auth not found"));
  return importFromRemote<React.ComponentType<{ currentUser?: UserInfo; onLogout?: () => void }>>(
    authEntry, "./ProfileSlot"
  ).then((C) => ({ default: C }));
});

// Lazy load UserManagementSlot từ pbc-auth
const LazyUserManagement = lazy(() => {
  const authEntry = getEnabledPBCs().find((p) => p.pbcId === "auth");
  if (!authEntry) return Promise.reject(new Error("pbc-auth not found"));
  return importFromRemote<React.ComponentType<{ userRole?: string }>>(
    authEntry, "./UserManagementSlot"
  ).then((C) => ({ default: C }));
});

export const Shell: React.FC<Props> = ({ children }) => {
  const pbcs = getEnabledPBCs().filter((p) => p.pbcId !== "auth");
  const currentPath = window.location.pathname;

  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = sessionStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      setUser((e as CustomEvent<UserInfo | null>).detail);
    };
    window.addEventListener("shell:user-changed", handler);
    return () => window.removeEventListener("shell:user-changed", handler);
  }, []);

  const canManageUsers = user ? USER_MANAGEMENT_ROLES.includes(user.role) : false;

  // Xác định selectedKey từ route
  const isUserMgmt = currentPath.startsWith("/user-management");
  const isProfile = currentPath.startsWith("/profile");
  const selectedKey = isUserMgmt
    ? "user-management"
    : isProfile
    ? "profile"
    : (pbcs.find(
        (p) => currentPath === p.routePrefix || currentPath.startsWith(p.routePrefix + "/")
      )?.pbcId ?? "dashboard");

  const menuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    { type: "divider" },
    // PBC nghiệp vụ
    ...pbcs.map((pbc) => ({
      key: pbc.pbcId,
      icon: PBC_CONFIG[pbc.pbcId]?.icon ?? <UserOutlined />,
      label: PBC_CONFIG[pbc.pbcId]?.label ?? pbc.pbcId,
    })),
    // Menu quản trị — chỉ hiện với ADMIN / ACADEMIC_STAFF
    ...(canManageUsers
      ? [
          { type: "divider" as const },
          {
            key: "admin-group",
            icon: <SafetyOutlined />,
            label: "Quản trị",
            children: [
              {
                key: "user-management",
                icon: <TeamOutlined />,
                label: "Quản lý người dùng",
              },
            ],
          },
        ]
      : []),
  ];

  // Route map: key → path
  const ROUTE_MAP: Record<string, string> = {
    dashboard:        "/dashboard",
    "user-management": "/user-management",
    ...Object.fromEntries(pbcs.map((p) => [p.pbcId, p.routePrefix])),
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    const path = ROUTE_MAP[key];
    if (path) window.location.href = path;
  };

  // Render content theo route
  const renderContent = () => {
    if (isProfile) {
      return (
        <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spin size="large" tip="Đang tải hồ sơ..." /></div>}>
          <LazyProfileSlot
            currentUser={user ?? undefined}
            onLogout={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              sessionStorage.removeItem("currentUser");
              window.location.href = "/login";
            }}
          />
        </Suspense>
      );
    }
    if (isUserMgmt && canManageUsers) {
      return (
        <Suspense
          fallback={
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
              <Spin size="large" tip="Đang tải Quản lý người dùng..." />
            </div>
          }
        >
          <LazyUserManagement userRole={user?.role} />
        </Suspense>
      );
    }
    return children;
  };

  return (
    <DesignTokenProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar />
        <Layout>
          {/* Sidebar */}
          <Sider
            width={220}
            style={{
              background: "#fff",
              borderRight: "1px solid #f0f0f0",
              overflow: "auto",
              height: "calc(100vh - 56px)",
              position: "sticky",
              top: 56,
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

          {/* Main content */}
          <Content
            style={{
              padding: 24,
              background: "#f5f5f5",
              minHeight: "calc(100vh - 56px)",
              overflow: "auto",
            }}
          >
            <Suspense
              fallback={
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                  <Spin size="large" tip="Đang tải module..." />
                </div>
              }
            >
              {renderContent()}
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </DesignTokenProvider>
  );
};
