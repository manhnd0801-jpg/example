// AI-GENERATED
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, Spin, Result, Button, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import { Shell } from "./layout/Shell";
import { guardRoute } from "./guards/auth-guard";
import { appContract } from "./config/app-contract";
import { getPBCByRoute, importFromRemote, getEnabledPBCs } from "./core/pbc-loader";
import type { PBCEntry } from "./core/pbc-loader";

const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? "dev-tenant";

// ── Loading fallback ────────────────────────────────────────────────────────
const LoadingFallback = ({ tip }: { tip?: string }) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <Spin size="large" tip={tip ?? "Đang tải..."} />
  </div>
);

// ── Lazy load PBC slot ──────────────────────────────────────────────────────
function RemotePBCSlot({ entry }: { entry: PBCEntry }) {
  const LazySlot = lazy(() =>
    importFromRemote<React.ComponentType>(entry, entry.module).then((C) => ({
      default: C,
    }))
  );
  return (
    <Suspense fallback={<LoadingFallback tip={`Đang tải ${entry.pbcId}...`} />}>
      <LazySlot />
    </Suspense>
  );
}

// ── Login page ──────────────────────────────────────────────────────────────
function LoginPage({ authEntry }: { authEntry: PBCEntry }) {
  const LazyLoginSlot = lazy(() =>
    importFromRemote<React.ComponentType<{
      tenantId: string;
      onLoginSuccess: (data: { accessToken: string; refreshToken: string; user: unknown }) => void;
    }>>(authEntry, "./LoginSlot").then((C) => ({ default: C }))
  );

  const handleLoginSuccess = (data: { accessToken: string; refreshToken: string; user?: unknown }) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("tenantId", TENANT_ID);
    // Lưu user info vào sessionStorage để Navbar hiển thị
    if (data.user) {
      sessionStorage.setItem("currentUser", JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent("shell:user-changed", { detail: data.user }));
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
        <LazyLoginSlot tenantId={TENANT_ID} onLoginSuccess={handleLoginSuccess} />
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
function bootstrap() {
  const pathname = window.location.pathname;
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const root = ReactDOM.createRoot(document.getElementById("root")!);

  // Route /login
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    const authEntry = getEnabledPBCs().find((p) => p.pbcId === "auth");
    if (!authEntry) {
      root.render(
        <Result
          status="error"
          title="Lỗi cấu hình"
          subTitle="Không tìm thấy pbc-auth trong registry. Kiểm tra pbc-registry.json."
        />
      );
      return;
    }
    root.render(
      <React.StrictMode>
        <LoginPage authEntry={authEntry} />
      </React.StrictMode>
    );
    return;
  }

  // Chưa auth → redirect /login
  if (!isAuthenticated) {
    sessionStorage.setItem("returnTo", pathname);
    window.location.href = "/login";
    return;
  }

  // Đã auth → render Shell
  const matchedPBC = getPBCByRoute(pathname);

  root.render(
    <React.StrictMode>
      <Shell>
        {matchedPBC ? (
          <RemotePBCSlot entry={matchedPBC} />
        ) : (
          <Dashboard />
        )}
      </Shell>
    </React.StrictMode>
  );
}

bootstrap();
