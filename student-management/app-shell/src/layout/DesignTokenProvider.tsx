// app-shell/src/layout/DesignTokenProvider.tsx
//
// Inject CSS variables vào :root dựa trên theme config trong app-manifest.json
// R-10: PBC PHẢI dùng var(--color-primary) v.v. — không được override :root từ PBC
//
import React, { useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import manifest from "../../../app-manifest.json";

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

interface Props {
  children: React.ReactNode;
}

export const DesignTokenProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    const { primaryColor, radius, fontFamily } = manifest.theme;

    // Blueprint v2.9 tokens
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-primary-rgb", hexToRgb(primaryColor));

    // Legacy tokens — backward compat với pbc-auth dùng --pbc-*
    root.style.setProperty("--pbc-primary-color", primaryColor);
    root.style.setProperty("--pbc-radius", radius);
    root.style.setProperty("--pbc-font-family", fontFamily);
    root.style.setProperty("--pbc-border-radius", radius);
  }, []);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary:  manifest.theme.primaryColor,
          borderRadius:  parseInt(manifest.theme.radius),
          fontFamily:    manifest.theme.fontFamily,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
