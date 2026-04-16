// AI-GENERATED
import React from "react";
import { appContract } from "../config/app-contract";

export const Navbar: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tenantId");
    window.location.replace("/login");
  };

  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <nav
      style={{
        background: "var(--pbc-primary-color, #1677ff)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#fff",
        fontFamily: "var(--pbc-font-family)",
      }}
    >
      <strong style={{ fontSize: 16 }}>{appContract.name}</strong>
      {isLoggedIn && (
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.4)",
            color: "#fff",
            padding: "4px 16px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Đăng xuất
        </button>
      )}
    </nav>
  );
};
