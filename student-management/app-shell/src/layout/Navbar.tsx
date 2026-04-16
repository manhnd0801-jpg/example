// AI-GENERATED
import React, { useEffect, useState } from "react";
import { Layout, Avatar, Dropdown, Space, Typography, Tag } from "antd";
import { UserOutlined, LogoutOutlined, DownOutlined, ProfileOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { appContract } from "../config/app-contract";

const { Header } = Layout;
const { Text } = Typography;

interface UserInfo {
  userId: string;
  username: string;
  role: string;
  email?: string;
  fullName?: string;
  status?: string;
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN:          "red",
  ACADEMIC_STAFF: "blue",
  TEACHER:        "green",
  STUDENT:        "default",
};

export const Navbar: React.FC = () => {
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 600 }}>{user?.username}</div>
          <Tag color={ROLE_COLOR[user?.role ?? ""] ?? "default"} style={{ marginTop: 4 }}>
            {user?.role}
          </Tag>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Hồ sơ cá nhân",
      onClick: () => { window.location.href = "/profile"; },
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        background: appContract.theme.primaryColor,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        lineHeight: "56px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Space>
        <Text strong style={{ color: "#fff", fontSize: 16 }}>
          🎓 {appContract.name}
        </Text>
      </Space>

      {user && (
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
          <Space style={{ cursor: "pointer", color: "#fff" }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ background: "rgba(255,255,255,0.25)" }}
            />
            <Text style={{ color: "#fff", fontSize: 14 }}>{user.username}</Text>
            <DownOutlined style={{ fontSize: 11, opacity: 0.8 }} />
          </Space>
        </Dropdown>
      )}
    </Header>
  );
};
