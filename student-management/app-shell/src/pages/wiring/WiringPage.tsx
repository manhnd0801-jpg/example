// Wiring canvas — trang xem và chỉnh sửa event wiring giữa các PBC
// Features:
//   - Pan / Zoom (built-in React Flow)
//   - Xem tất cả PBC nodes với emits/listens ports
//   - Xem edges (dây nối) với màu: xanh = auto-wired, cam = manual, xám = disabled
//   - Click edge → xem chi tiết (description, transform)
//   - Toggle enable/disable edge
//   - Xóa edge (cắt dây)
//   - Fit view, mini-map
import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Button,
  Drawer,
  Tag,
  Typography,
  Space,
  Divider,
  Badge,
  Tooltip,
  Switch,
  Empty,
  Alert,
} from "antd";
import {
  DeleteOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  LinkOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { PbcNode } from "./PbcNode";
import { WiringEdge } from "./WiringEdge";
import { buildNodes, buildEdges } from "./wiringUtils";
import type { WiringEdgeMeta } from "./types";

const { Text, Title } = Typography;

// Đăng ký custom node/edge types — phải khai báo ngoài component để tránh re-render
const NODE_TYPES = { pbcNode: PbcNode };
const EDGE_TYPES = { wiringEdge: WiringEdge };

export const WiringPage: React.FC = () => {
  const initialNodes = useMemo(() => buildNodes(), []);
  const initialEdges = useMemo(() => buildEdges(), []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Drawer state — hiển thị chi tiết edge được chọn
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Kéo dây nối mới giữa 2 handle
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "wiringEdge",
            animated: true,
            markerEnd: { type: "arrowclosed" as const, width: 16, height: 16 },
            data: {
              description: "Manual connection",
              autoWired: false,
              enabled: true,
              transform: null,
            } satisfies WiringEdgeMeta,
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  // Click vào edge → mở drawer chi tiết
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setDrawerOpen(true);
  }, []);

  // Toggle enable/disable edge
  const toggleEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                animated: !(e.data as unknown as WiringEdgeMeta).enabled,
                data: {
                  ...(e.data as unknown as WiringEdgeMeta),
                  enabled: !(e.data as unknown as WiringEdgeMeta).enabled,
                },
              }
            : e,
        ),
      );
      // Cập nhật selectedEdge nếu đang mở
      setSelectedEdge((prev) =>
        prev?.id === edgeId
          ? {
              ...prev,
              data: {
                ...(prev.data as unknown as WiringEdgeMeta),
                enabled: !(prev.data as unknown as WiringEdgeMeta).enabled,
              },
            }
          : prev,
      );
    },
    [setEdges],
  );

  // Xóa edge (cắt dây)
  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setDrawerOpen(false);
      setSelectedEdge(null);
    },
    [setEdges],
  );

  // Reset về trạng thái ban đầu
  const resetWiring = useCallback(() => {
    setEdges(buildEdges());
    setDrawerOpen(false);
    setSelectedEdge(null);
  }, [setEdges]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = edges.length;
    const enabled = edges.filter((e) => (e.data as unknown as WiringEdgeMeta).enabled).length;
    const autoWired = edges.filter((e) => (e.data as unknown as WiringEdgeMeta).autoWired).length;
    return { total, enabled, disabled: total - enabled, autoWired, manual: total - autoWired };
  }, [edges]);

  // ── Selected edge meta ────────────────────────────────────────────────────
  const selectedMeta = selectedEdge?.data as unknown as WiringEdgeMeta | undefined;

  return (
    <div style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 20px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LinkOutlined style={{ fontSize: 18, color: "#1677ff" }} />
          <Title level={5} style={{ margin: 0 }}>
            Event Wiring Canvas
          </Title>
          <Tag color="blue">{nodes.length} PBCs</Tag>
        </div>

        {/* Stats */}
        <Space size={16}>
          <Tooltip title="Tổng số kết nối">
            <Badge count={stats.total} color="#1677ff" showZero>
              <Tag icon={<LinkOutlined />}>Edges</Tag>
            </Badge>
          </Tooltip>
          <Tooltip title="Đang hoạt động">
            <Badge count={stats.enabled} color="#52c41a" showZero>
              <Tag color="success">Enabled</Tag>
            </Badge>
          </Tooltip>
          <Tooltip title="Đã tắt">
            <Badge count={stats.disabled} color="#d9d9d9" showZero>
              <Tag color="default">Disabled</Tag>
            </Badge>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="Reset về trạng thái ban đầu">
            <Button icon={<ReloadOutlined />} size="small" onClick={resetWiring}>
              Reset
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "6px 20px",
          background: "#fafafa",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 12,
          color: "#666",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 500 }}>Legend:</span>
        <span>
          <span style={{ display: "inline-block", width: 24, height: 3, background: "#52c41a", borderRadius: 2, verticalAlign: "middle", marginRight: 6 }} />
          Auto-wired
        </span>
        <span>
          <span style={{ display: "inline-block", width: 24, height: 3, background: "#fa8c16", borderRadius: 2, verticalAlign: "middle", marginRight: 6 }} />
          Manual
        </span>
        <span>
          <span style={{ display: "inline-block", width: 24, height: 3, background: "#d9d9d9", borderRadius: 2, borderTop: "2px dashed #d9d9d9", verticalAlign: "middle", marginRight: 6 }} />
          Disabled
        </span>
        <span style={{ marginLeft: "auto", color: "#aaa" }}>
          💡 Kéo handle để nối • Click edge để xem chi tiết • Scroll để zoom
        </span>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          style={{ background: "#f8f9fc" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e0e0e0" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n: Node) => {
              const d = n.data as { color?: string };
              return d.color ?? "#8c8c8c";
            }}
            maskColor="rgba(248,249,252,0.7)"
            style={{ border: "1px solid #f0f0f0", borderRadius: 8 }}
          />

          {/* Panel hướng dẫn */}
          <Panel position="top-right">
            <div
              style={{
                background: "#fff",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 11,
                color: "#888",
                lineHeight: 1.8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontWeight: 600, color: "#333", marginBottom: 4 }}>
                <FullscreenOutlined style={{ marginRight: 4 }} />
                Điều hướng
              </div>
              <div>🖱️ Scroll — Zoom in/out</div>
              <div>✋ Drag canvas — Pan</div>
              <div>🔵 Drag handle — Nối mới</div>
              <div>🖱️ Click edge — Chi tiết</div>
              <div>⌨️ Delete — Xóa edge</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Drawer chi tiết edge */}
      <Drawer
        title={
          <Space>
            <InfoCircleOutlined style={{ color: "#1677ff" }} />
            <span>Chi tiết kết nối</span>
            {selectedMeta && (
              <Tag color={selectedMeta.autoWired ? "green" : "orange"}>
                {selectedMeta.autoWired ? "Auto-wired" : "Manual"}
              </Tag>
            )}
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={380}
        extra={
          selectedEdge && (
            <Space>
              <Tooltip title={selectedMeta?.enabled ? "Tắt kết nối" : "Bật kết nối"}>
                <Switch
                  checked={selectedMeta?.enabled}
                  onChange={() => toggleEdge(selectedEdge.id)}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Tooltip>
              <Tooltip title="Xóa kết nối (cắt dây)">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => deleteEdge(selectedEdge.id)}
                >
                  Xóa
                </Button>
              </Tooltip>
            </Space>
          )
        }
      >
        {selectedEdge && selectedMeta ? (
          <div style={{ fontSize: 13 }}>
            {/* Status */}
            {!selectedMeta.enabled && (
              <Alert
                message="Kết nối đang bị tắt — event sẽ không được forward"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Mô tả
              </Text>
              <div style={{ marginTop: 4, fontWeight: 500 }}>{selectedMeta.description}</div>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            {/* Source */}
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Nguồn (Source)
              </Text>
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                <div>
                  <Tag color="purple" style={{ fontSize: 12 }}>{selectedEdge.source}</Tag>
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>
                  Handle: <code style={{ background: "#f5f5f5", padding: "1px 4px", borderRadius: 3 }}>{selectedEdge.sourceHandle}</code>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: "center", color: "#1677ff", fontSize: 18, margin: "4px 0" }}>↓</div>

            {/* Target */}
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Đích (Target)
              </Text>
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                <div>
                  <Tag color="cyan" style={{ fontSize: 12 }}>{selectedEdge.target}</Tag>
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>
                  Handle: <code style={{ background: "#f5f5f5", padding: "1px 4px", borderRadius: 3 }}>{selectedEdge.targetHandle}</code>
                </div>
              </div>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            {/* Transform */}
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Transform Payload
              </Text>
              {selectedMeta.transform ? (
                <div style={{ marginTop: 6 }}>
                  <Tag color="gold">{selectedMeta.transform.type}</Tag>
                  {selectedMeta.transform.fields && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selectedMeta.transform.fields.map((f) => (
                        <Tag key={f} style={{ fontSize: 11 }}>{f}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 4, color: "#888", fontSize: 12 }}>
                  Không transform — forward nguyên payload
                </div>
              )}
            </div>

            <Divider style={{ margin: "12px 0" }} />

            {/* Edge ID */}
            <div>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Edge ID
              </Text>
              <div style={{ marginTop: 4 }}>
                <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 3, fontSize: 12 }}>
                  {selectedEdge.id}
                </code>
              </div>
            </div>

            {/* Cắt dây */}
            <div style={{ marginTop: 24 }}>
              <Button
                danger
                block
                icon={<DisconnectOutlined />}
                onClick={() => deleteEdge(selectedEdge.id)}
              >
                Cắt kết nối này
              </Button>
            </div>
          </div>
        ) : (
          <Empty description="Chọn một kết nối để xem chi tiết" />
        )}
      </Drawer>
    </div>
  );
};
