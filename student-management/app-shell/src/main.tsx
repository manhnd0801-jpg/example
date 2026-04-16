// AI-GENERATED
import React from "react";
import ReactDOM from "react-dom/client";
import { Shell } from "./layout/Shell";
import { guardRoute } from "./guards/auth-guard";
import { getEnabledPBCs, mountPBC } from "./core/pbc-loader";
import { appContract } from "./config/app-contract";

async function bootstrap() {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const pathname = window.location.pathname;
  const isLoginRoute = pathname === "/login" || pathname === "/" || pathname === "";

  // Guard: chưa auth và không phải login → redirect
  guardRoute(pathname, isAuthenticated, () => {
    if (!isLoginRoute) {
      window.location.replace("/login");
    }
  });

  const pbcs = getEnabledPBCs();
  const matched = isLoginRoute
    ? pbcs.find((p) => p.pbcId === "pbc-auth")
    : pbcs.find((p) => pathname.startsWith(p.routePrefix));

  const root = ReactDOM.createRoot(document.getElementById("root")!);

  root.render(
    <React.StrictMode>
      {isLoginRoute && !isAuthenticated ? (
        <div
          ref={(el: HTMLDivElement | null) => {
            if (el && !el.hasChildNodes() && matched) {
              mountPBC(matched, el).catch(console.error);
            }
          }}
        />
      ) : (
        <Shell>
          {matched ? (
            <div
              ref={(el: HTMLDivElement | null) => {
                if (el && !el.hasChildNodes()) {
                  mountPBC(matched, el).catch(console.error);
                }
              }}
            />
          ) : (
            <div style={{ padding: 24 }}>
              <h2>Chào mừng đến {appContract.name}</h2>
              <p>Chọn module từ sidebar để bắt đầu.</p>
            </div>
          )}
        </Shell>
      )}
    </React.StrictMode>
  );
}

bootstrap().catch(console.error);
