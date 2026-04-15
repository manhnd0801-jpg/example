// AI-GENERATED
import React from "react";
import { Navbar } from "./Navbar";
import { DesignTokenProvider } from "./DesignTokenProvider";
import { getEnabledPBCs } from "../core/pbc-loader";

interface Props {
  children?: React.ReactNode;
}

export const Shell: React.FC<Props> = ({ children }) => {
  const pbcs = getEnabledPBCs();

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
            }}
          >
            {pbcs.map((pbc) => (
              <a
                key={pbc.pbcId}
                href={pbc.routePrefix}
                style={{
                  display: "block",
                  padding: "8px 24px",
                  textDecoration: "none",
                  color: "#374151",
                  fontFamily: "var(--pbc-font-family)",
                }}
              >
                {pbc.pbcId}
              </a>
            ))}
          </aside>
          <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
            {children}
          </main>
        </div>
      </div>
    </DesignTokenProvider>
  );
};
