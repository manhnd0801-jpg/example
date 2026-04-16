// AI-GENERATED
import React from "react";
import { Navbar } from "./Navbar";
import { DesignTokenProvider } from "./DesignTokenProvider";
import { getEnabledPBCs } from "../core/pbc-loader";

interface Props {
  children?: React.ReactNode;
}

// PBC không hiển thị trong sidebar
const HIDDEN_FROM_SIDEBAR = ["pbc-auth", "pbc-notification"];

export const Shell: React.FC<Props> = ({ children }) => {
  const pbcs = getEnabledPBCs().filter(
    (p) => !HIDDEN_FROM_SIDEBAR.includes(p.pbcId)
  );
  const pathname = window.location.pathname;

  return (
    <DesignTokenProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <aside
            style={{
              width: 220,
              borderRight: "1px solid #e5e7eb",
              padding: "16px 0",
              background: "#fafafa",
            }}
          >
            {pbcs.map((pbc) => {
              const isActive = pathname.startsWith(pbc.routePrefix);
              return (
                <a
                  key={pbc.pbcId}
                  href={pbc.routePrefix}
                  style={{
                    display: "block",
                    padding: "10px 24px",
                    textDecoration: "none",
                    color: isActive ? "var(--pbc-primary-color, #1677ff)" : "#374151",
                    fontWeight: isActive ? 600 : 400,
                    background: isActive ? "#e6f4ff" : "transparent",
                    borderRight: isActive ? "3px solid var(--pbc-primary-color, #1677ff)" : "3px solid transparent",
                    fontFamily: "var(--pbc-font-family)",
                    fontSize: 14,
                  }}
                >
                  {(pbc as any).label ?? pbc.pbcId}
                </a>
              );
            })}
          </aside>
          <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
            {children}
          </main>
        </div>
      </div>
    </DesignTokenProvider>
  );
};
