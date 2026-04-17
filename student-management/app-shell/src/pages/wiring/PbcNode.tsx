// Wiring canvas — Custom PBC node
// Hiển thị tên PBC + version + danh sách emits (source handles) + listens (target handles)
import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Tag, Tooltip } from "antd";
import { ArrowRightOutlined, ArrowLeftOutlined, WarningOutlined } from "@ant-design/icons";
import type { WiringNodeData } from "./types";

const HANDLE_GAP = 28; // px giữa các handle

export const PbcNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as unknown as WiringNodeData;
  const hasMismatch = d.versionMismatch === true;

  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${selected ? "#1677ff" : hasMismatch ? "#ff4d4f" : d.color}`,
        borderRadius: 10,
        minWidth: 220,
        boxShadow: selected
          ? "0 0 0 3px rgba(22,119,255,0.2)"
          : hasMismatch
          ? "0 0 0 3px rgba(255,77,79,0.15)"
          : "0 2px 8px rgba(0,0,0,0.12)",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: hasMismatch ? "#ff4d4f" : d.color,
          borderRadius: "8px 8px 0 0",
          padding: "8px 12px",
          color: "#fff",
        }}
      >
        {/* Tên PBC */}
        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: 0.2 }}>
          {d.displayName}
        </div>

        {/* pbcId + version */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
            gap: 6,
          }}
        >
          <span style={{ fontSize: 10, opacity: 0.85 }}>{d.pbcId}</span>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Version badge */}
            <span
              style={{
                background: "rgba(255,255,255,0.25)",
                borderRadius: 4,
                padding: "1px 6px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.3,
              }}
            >
              v{d.version}
            </span>

            {/* Cảnh báo version mismatch */}
            {hasMismatch && d.registryVersion && (
              <Tooltip
                title={
                  <span>
                    Version mismatch!<br />
                    Wiring: <b>v{d.version}</b><br />
                    Registry: <b>v{d.registryVersion}</b><br />
                    Cần cập nhật app-wiring.json
                  </span>
                }
              >
                <WarningOutlined style={{ fontSize: 12, color: "#fff" }} />
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "8px 0" }}>
        {/* EMITS — source handles (right side) */}
        {d.emits.length > 0 && (
          <div>
            <div
              style={{
                padding: "2px 12px 4px",
                color: "#888",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ArrowRightOutlined style={{ fontSize: 9 }} /> Emits
            </div>
            {d.emits.map((port) => (
              <div
                key={port.id}
                style={{
                  position: "relative",
                  padding: "3px 28px 3px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  minHeight: HANDLE_GAP,
                }}
              >
                <Tooltip title={port.topic} placement="left" mouseEnterDelay={0.4}>
                  <Tag
                    color="blue"
                    style={{
                      margin: 0,
                      fontSize: 11,
                      cursor: "default",
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {port.label}
                  </Tag>
                </Tooltip>
                {/* Source handle — right */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={port.id}
                  style={{
                    top: "50%",
                    right: -8,
                    width: 12,
                    height: 12,
                    background: "#1677ff",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    zIndex: 10,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Divider nếu có cả 2 */}
        {d.emits.length > 0 && d.listens.length > 0 && (
          <div style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }} />
        )}

        {/* LISTENS — target handles (left side) */}
        {d.listens.length > 0 && (
          <div>
            <div
              style={{
                padding: "2px 12px 4px",
                color: "#888",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ArrowLeftOutlined style={{ fontSize: 9 }} /> Listens
            </div>
            {d.listens.map((port) => (
              <div
                key={port.id}
                style={{
                  position: "relative",
                  padding: "3px 12px 3px 28px",
                  display: "flex",
                  alignItems: "center",
                  minHeight: HANDLE_GAP,
                }}
              >
                {/* Target handle — left */}
                <Handle
                  type="target"
                  position={Position.Left}
                  id={port.id}
                  style={{
                    top: "50%",
                    left: -8,
                    width: 12,
                    height: 12,
                    background: "#52c41a",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    zIndex: 10,
                  }}
                />
                <Tooltip title={port.topic} placement="right" mouseEnterDelay={0.4}>
                  <Tag
                    color="green"
                    style={{
                      margin: 0,
                      fontSize: 11,
                      cursor: "default",
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {port.label}
                  </Tag>
                </Tooltip>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {d.emits.length === 0 && d.listens.length === 0 && (
          <div style={{ padding: "8px 12px", color: "#bbb", fontSize: 11 }}>
            Không có event
          </div>
        )}
      </div>
    </div>
  );
};
