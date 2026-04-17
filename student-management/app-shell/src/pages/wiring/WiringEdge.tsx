// Wiring canvas — Custom animated edge
// Hiển thị dây nối với màu khác nhau: enabled/disabled, autoWired/manual
import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { Tooltip } from "antd";
import type { WiringEdgeMeta } from "./types";

export const WiringEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}) => {
  const meta = data as unknown as WiringEdgeMeta;
  const enabled = meta?.enabled !== false;
  const autoWired = meta?.autoWired === true;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = !enabled
    ? "#d9d9d9"
    : selected
    ? "#1677ff"
    : autoWired
    ? "#52c41a"
    : "#fa8c16";

  const strokeWidth = selected ? 2.5 : 1.8;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: enabled ? undefined : "6 4",
          opacity: enabled ? 1 : 0.5,
          transition: "stroke 0.2s, stroke-width 0.2s",
        }}
      />

      {/* Label hiển thị khi selected hoặc hover */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: 10,
          }}
          className="nodrag nopan"
        >
          <Tooltip
            title={
              <div style={{ fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {meta?.description ?? ""}
                </div>
                {meta?.transform && (
                  <div style={{ color: "#aaa" }}>
                    Transform: {meta.transform.type}
                    {meta.transform.fields && ` [${meta.transform.fields.join(", ")}]`}
                  </div>
                )}
                <div style={{ marginTop: 4, color: autoWired ? "#52c41a" : "#fa8c16" }}>
                  {autoWired ? "⚡ Auto-wired" : "✋ Manual"}
                </div>
              </div>
            }
            placement="top"
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: strokeColor,
                border: "2px solid #fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
