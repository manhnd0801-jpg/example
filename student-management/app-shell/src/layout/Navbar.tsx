// AI-GENERATED
import React from "react";
import { appContract } from "../config/app-contract";

export const Navbar: React.FC = () => {
  return (
    <nav
      style={{
        background: "var(--pbc-primary-color)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        color: "#fff",
        fontFamily: "var(--pbc-font-family)",
      }}
    >
      <strong>{appContract.name}</strong>
    </nav>
  );
};
