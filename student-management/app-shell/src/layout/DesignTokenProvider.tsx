// AI-GENERATED
import React, { useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import { appContract } from "../config/app-contract";

interface Props {
  children: React.ReactNode;
}

export const DesignTokenProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    // Inject CSS variables cho các PBC dùng var(--pbc-*)
    const { theme: t } = appContract;
    const root = document.documentElement;
    root.style.setProperty("--pbc-primary-color", t.primaryColor);
    root.style.setProperty("--pbc-radius", t.radius);
    root.style.setProperty("--pbc-font-family", t.fontFamily);
  }, []);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: appContract.theme.primaryColor,
          borderRadius: parseInt(appContract.theme.radius),
          fontFamily: appContract.theme.fontFamily,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
