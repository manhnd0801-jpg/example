// app-shell/src/main.tsx
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, Spin, Result, Button, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import { Shell } from "./layout/Shell";
import { isAuthenticated, guardRoute } from "./core/auth-guard";
import { appContract } from "./config/app-contract";
import { getEnabledPBCs, importFromRemote, getPBCByRoute } from "./core/pbc-loader";
import { connectEventBus } from "./core/event-bus";
import { initTokenManager } from "./core/token-manager";
import { initEventMapper } from "./core/event-mapper";
import { validateEnv, ENV } from "./config/env";
import type { PBCEntry } from "./core/pbc-loader";

// ── Loading fallback ────────────────────────────────────────────────────────
const LoadingFallback = ({ tip }: { tip?: string }) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <Spin size="large" tip={tip ?? "Đang tải..."} />
  </div>
);

// ── Login page — render KHÔNG có Shell (R-15) ───────────────────────────────
function LoginPage({ authEntry }: { authEntry: PBCEntry }) {
  const LazyLoginSlot = lazy(() =>
    importFromRemote<
      React.ComponentType<{
        tenantId: string;
        onLoginSuccess: (data: { accessToken: string; refreshToken: string; user: unknown }) => void;
      }>
    >(authEntry, "./LoginSlot").then((C) => ({ default: C })),
  );

  const handleLoginSuccess = (data: {
    accessToken: string;
    refreshToken: string;
    user?: unknown;
  }) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("tenantId", ENV.TENANT_ID);

    if (data.user) {
      const u = data.user as {
        id?: string; username?: string; role?: string;
        email?: string; fullName?: string; status?: string;
      };
      const userInfo = {
        userId:   u.id ?? "",
        username: u.username ?? "",
        role:     u.role ?? "",
        email:    u.email ?? "",
        fullName: u.fullName ?? "",
        status:   u.status ?? "",
      };
      sessionStorage.setItem("currentUser", JSON.stringify(userInfo));
      window.dispatchEvent(new CustomEvent("shell:user-changed", { detail: userInfo }));
    }

    const returnTo = sessionStorage.getItem("returnTo") ?? appContract.appShell.defaultRoute;
    sessionStorage.removeItem("returnTo");
    window.location.href = returnTo;
  };

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: appContract.theme.primaryColor },
      }}
    >
      <Suspense fallback={<LoadingFallback tip="Đang tải trang đăng nhập..." />}>
        <LazyLoginSlot tenantId={ENV.TENANT_ID} onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    </ConfigProvider>
  );
}

// ── Dashboard welcome ───────────────────────────────────────────────────────
function Dashboard() {
  return (
    <Result
      icon={<span style={{ fontSize: 64 }}>🎓</span>}
      title={`Chào mừng đến ${appContract.name}`}
      subTitle="Chọn module từ sidebar để bắt đầu làm việc."
      extra={
        <Button type="primary" href="/students">
          Quản lý Sinh viên
        </Button>
      }
    />
  );
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap() {
  // Validate env vars
  try {
    validateEnv();
  } catch (err) {
    console.warn((err as Error).message);
  }

  // Khởi động event bus (WebSocket → kafka-gateway) — R-12
  try {
    await connectEventBus();
  } catch (err) {
    console.warn("[app-shell] Event bus unavailable, continuing without events:", (err as Error).message);
  }

  // Khởi động token manager và event mapper
  initTokenManager();
  initEventMapper();

  const pathname = window.location.pathname;
  const auth = isAuthenticated();
  const root = ReactDOM.createRoot(document.getElementById("root")!);

  // Route /login — render không có Shell (R-15)
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    const authEntry =
      getEnabledPBCs().find((p) => p.pbcId === "pbc-auth");

    if (!authEntry) {
      root.render(
        <Result
          status="error"
          title="Lỗi cấu hình"
          subTitle="Không tìm thấy pbc-auth trong registry. Kiểm tra pbc-registry.json."
        />,
      );
      return;
    }
    root.render(
      <React.StrictMode>
        <LoginPage authEntry={authEntry} />
      </React.StrictMode>,
    );
    return;
  }

  // Chưa auth → redirect /login
  if (!auth) {
    sessionStorage.setItem("returnTo", pathname);
    window.location.href = "/login";
    return;
  }

  // Đã auth → render Shell
  // Shell dùng MountPoint để tự đọc enabledSlots từ app-contract.json (R-17)
  root.render(
    <React.StrictMode>
      <Shell>
        <Dashboard />
      </Shell>
    </React.StrictMode>,
  );
}

bootstrap();
