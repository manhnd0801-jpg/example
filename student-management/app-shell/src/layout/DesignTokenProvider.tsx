// AI-GENERATED
import React, { useEffect } from "react";
import { appContract } from "../config/app-contract";

interface Props {
  children: React.ReactNode;
}

export const DesignTokenProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    const { theme } = appContract;
    const root = document.documentElement;
    root.style.setProperty("--pbc-primary-color", theme.primaryColor);
    root.style.setProperty("--pbc-radius", theme.radius);
    root.style.setProperty("--pbc-font-family", theme.fontFamily);
  }, []);

  return <>{children}</>;
};
