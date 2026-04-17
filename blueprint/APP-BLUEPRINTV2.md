# VNPT COMPOSABLE APP BLUEPRINT (AI Generation Template)

**Phiên bản:** 3.0
**Nền tảng:** VNPT Composable Platform (App Composition Layer)

> **Đây là file blueprint chính thức** — thay thế APP-BLUEPRINT.md (v2.7).  
> v2.9 bổ sung các bài học từ thực tế triển khai pbc-auth + app-shell integration.  
> v3.0 bổ sung `enabledSlots` pattern — config-driven slot mounting, `MountPoint` component, `slot-registry.ts`, `vite-env.d.ts`.

## MỤC LỤC

- Quy tắc bắt buộc AI phải tuân theo
- Cấu trúc thư mục đầy đủ
- app-manifest.json
- pbc-registry.json
- **app-wiring.json (Mới v3.1)** ← Event wiring graph
- App Shell — Core
- App Shell — Config
- App Shell — Layout
- **enabledSlots Pattern (Mới v3.0)**
- Kafka Gateway (Mới v2.8)
- Shared — shared-events
- Shared — shared-ui / DesignTokenProvider
- docker-compose.yml (Kafka)
- CI/CD — .gitlab-ci.yml
- Infra — Helm Chart
- Quy ước đặt tên & Versioning
- Checklist hoàn chỉnh

## 1. QUY TẮC BẮT BUỘC

| #     | Quy tắc                                                                                               | Lý do                                      |
| ----- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| R-01  | App được compose từ nhiều PBC — không phải PBC đơn lẻ                                                 | Đảm bảo tính module                        |
| R-02  | App Shell là trung tâm điều phối duy nhất                                                             | Single source of truth                     |
| R-03  | Tất cả PBC giao tiếp qua Kafka Event Bus + kafka-gateway (WebSocket bridge) + App Shell Event Mapping | Decoupled communication                    |
| R-03a | Frontend (App Shell / PBC UI) kết nối Kafka thông qua kafka-gateway — không connect trực tiếp Broker  | Browser không hỗ trợ Kafka protocol native |
| R-03b | Backend của PBC kết nối Kafka trực tiếp qua kafkajs — không qua gateway                               | Performance, reliability                   |
| R-04  | Không hard-code logic nghiệp vụ vào App Shell                                                         | App Shell chỉ orchestrate                  |
| R-05  | Mọi PBC phải tuân thủ PBC-BLUEPRINT.md ver 2.1                                                        | Consistency                                |
| R-06  | App Shell hỗ trợ dynamic loading PBC (Module Federation hoặc Web Components)                          | Scalability                                |
| R-07  | Mọi event name phải dùng từ shared/shared-events — không tự định nghĩa chuỗi thô                      | Type safety                                |
| R-08  | App Shell phải có Auth Guard bảo vệ route trước khi load PBC                                          | Security                                   |
| R-09  | Version PBC phải khai báo semver range trong pbc-registry.json                                        | Compatibility                              |
| R-10  | PBC không được override CSS variable ở :root — chỉ đọc token từ App Shell                             | Design consistency                         |
| R-11  | Import path từ `app-shell/src/` đến `app-contract.json` / `pbc-registry.json` phải đi đúng số cấp thư mục (`../../../`) — kiểm tra kỹ khi monorepo có nhiều cấp lồng nhau | Build sẽ fail với "Could not resolve" nếu sai path |
| R-12  | KafkaJS **không chạy được trong browser** (dùng Node.js modules: `net`, `tls`, `util`). App Shell frontend phải kết nối Kafka qua `kafka-gateway` WebSocket — không import kafkajs trực tiếp vào bundle Vite | Browser compatibility |
| R-13  | `app-shell/` phải có `index.html` trỏ vào `src/main.tsx` và `tsconfig.json` — thiếu hai file này Vite không build được | Build requirement |
| R-14  | `security.authPBC` trong `app-contract.json` phải khớp đúng `pbcId` trong `pbc-registry.json` (không phải tên thư mục hay tên service) | Consistency |
| R-15  | Route `/login` phải được khai trong `security.publicRoutes` và có entry trong `pbc-registry.json` với `pbcId` của auth PBC | Auth flow |
| R-16  | `app-shell/src/` phải có `vite-env.d.ts` khai báo `ImportMetaEnv` — thiếu file này TypeScript báo lỗi `Property 'env' does not exist on type 'ImportMeta'` | Type safety |
| R-17  | Shell.tsx **không được** hard-code tên slot hay PBC cụ thể — dùng `MountPoint` component đọc config từ `app-contract.json.includedPBCs[].enabledSlots` | Config-driven layout |
| R-18  | `remote-imports.ts` phải có literal import string cho **mọi slot** được khai trong `enabledSlots` — Vite Module Federation không thể dynamic import lúc build | Build requirement |
| R-19  | `app-wiring.json` là **nguồn sự thật duy nhất** cho event wiring giữa các PBC — Platform UI đọc/ghi file này; `event-mapping.config.ts` và `app-asyncapi.yaml` là **output** được codegen từ `app-wiring.json`, không phải ngược lại | Single source of truth |
| R-20  | Khi thêm PBC vào project, platform phải **auto-detect** các event khớp giữa `emittedEvents` của PBC mới và `requiredEvents` của các PBC đã có (và ngược lại), tự động tạo edge trong `app-wiring.json` với `autoWired: true` — user chỉ cần confirm hoặc thêm transform | Auto-wiring |
| R-21  | App Shell phải gắn `window.__PLATFORM__` (Platform Standard API) trước khi mount bất kỳ PBC nào — PBC từ marketplace đọc session/eventBus từ đây, không import từ app-shell | Platform Contract |
| R-22  | PBC từ marketplace **KHÔNG được** import từ app-shell hoặc shared package của host cụ thể — chỉ được: (1) nhận props, (2) đọc `window.__PLATFORM__`, (3) phát/nhận CustomEvent qua window | Marketplace compatibility |

## 2. CẤU TRÚC THƯ MỤC ĐẦY ĐỦ

```text
my-composed-app/
├── app-shell/
│   ├── src/
│   │   ├── core/
│   │   │   ├── event-bus.ts              # Kết nối Kafka qua kafka-gateway WebSocket
│   │   │   ├── event-mapper.ts           # Mapping + transform event giữa PBC
│   │   │   ├── pbc-loader.ts             # Dynamic load PBC (Module Federation)
│   │   │   ├── auth-guard.ts             # Bảo vệ route
│   │   │   ├── token-manager.ts          # Quản lý JWT
│   │   │   ├── session-context.tsx       # React Context chia sẻ session
│   │   │   ├── slot-registry.ts          # ← MỚI v3.0: Đọc enabledSlots từ app-contract
│   │   │   ├── MountPoint.tsx            # ← MỚI v3.0: Render slot theo mount point
│   │   │   └── remote-imports.ts         # Literal import strings cho Vite MF
│   │   ├── layout/
│   │   │   ├── Shell.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── DesignTokenProvider.tsx   # Inject CSS variables vào :root
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── config/
│   │   │   ├── routes.config.ts          # Route → PBC mapping
│   │   │   ├── event-mapping.config.ts   # Khai báo event mapping rules
│   │   │   ├── feature-flags.ts          # Bật/tắt PBC theo môi trường
│   │   │   └── env.ts                    # Environment variables wrapper
│   │   ├── vite-env.d.ts                 # ← MỚI v3.0: Khai báo ImportMetaEnv
│   │   └── main.tsx
│   ├── public/
│   ├── vite.config.ts                    # Module Federation config
│   └── package.json
│
├── kafka-gateway/                        # ← MỚI v2.2: WebSocket bridge — Browser ↔ Kafka
│   ├── src/
│   │   ├── index.ts                      # Entry point: WS server + Kafka client
│   │   ├── kafka-client.ts              # kafkajs producer/consumer
│   │   ├── ws-handler.ts                # Xử lý WebSocket message từ browser
│   │   └── topic-registry.ts            # Danh sách Kafka topic hợp lệ (whitelist)
│   ├── Dockerfile
│   └── package.json
│
├── pbcs/
│   ├── pbc-user-management/
│   ├── pbc-auth-service/
│   ├── pbc-notification-center/
│   └── ...
│
├── shared/
│   ├── shared-ui/
│   │   ├── design-tokens/
│   │   │   ├── tokens.css               # CSS variables gốc
│   │   │   └── tokens.ts                # TypeScript constants
│   │   └── components/
│   ├── shared-events/
│   │   ├── index.ts                     # EVENTS constants + payload types
│   │   └── event-contracts.ts           # Zod schema validate payload
│   └── shared-utils/
│       ├── logger.ts
│       └── date.ts
│
├── infra/
│   ├── helm/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── kubernetes/
│
├── docker-compose.yml                   # Kafka (KRaft) + kafka-gateway + App Shell + PBCs
├── .gitlab-ci.yml
├── app-manifest.json
├── app-contract.json                    # enabledSlots config — đọc bởi slot-registry.ts
├── pbc-registry.json
├── app-wiring.json                      # ← MỚI v3.1: Event wiring graph — sinh ngay khi tạo project (skeleton rỗng), populate khi kéo PBC vào
├── README.md
└── .gitignore
```

## 3. APP-MANIFEST.JSON

_Cập nhật v2.8: Thêm versionContract cho từng PBC, thêm security block._

```json
{
  "appId": "crm-app",
  "version": "1.0.0",
  "name": "CRM Application",
  "description": "Ứng dụng quản lý khách hàng được compose từ nhiều PBC",

  "includedPBCs": [
    {
      "id": "pbc-user-management",
      "version": "^2.3.0",
      "minVersion": "2.0.0",
      "breaking": false
    },
    {
      "id": "pbc-auth-service",
      "version": "^1.5.0",
      "minVersion": "1.5.0",
      "breaking": false
    },
    {
      "id": "pbc-notification-center",
      "version": "^3.0.0",
      "minVersion": "3.0.0",
      "breaking": true,
      "breakingNote": "v3.0 đổi payload auth.user.loggedIn — cần transform"
    }
  ],

  "eventBus": {
    "type": "kafka",
    "brokers": ["${KAFKA_BROKER_1}", "${KAFKA_BROKER_2}", "${KAFKA_BROKER_3}"],
    "clientId": "crm-app",
    "groupId": "crm-app-consumer-group",
    "gatewayUrl": "${KAFKA_GATEWAY_URL}",
    "topicPrefix": "crm.",
    "replicationFactor": 3,
    "numPartitions": 6
  },

  "security": {
    "authProvider": "pbc-auth-service",
    "tokenStorage": "memory",
    "sessionTimeout": 3600,
    "publicRoutes": ["/login", "/forgot-password"]
  },

  "theme": {
    "primaryColor": "#0d6efd",
    "tokenFile": "shared/shared-ui/design-tokens/tokens.css"
  },

  "i18n": {
    "defaultLocale": "vi",
    "supportedLocales": ["vi", "en"]
  },

  "featureFlags": {
    "enableNotifications": true,
    "enableDarkMode": false
  }
}
```

## 4. PBC-REGISTRY.JSON

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-04-15T00:00:00Z",
  "pbcs": [
    {
      "id": "pbc-auth-service",
      "displayName": "Authentication Service",
      "version": "1.5.2",
      "remoteEntry": "${CDN_BASE_URL}/pbc-auth-service/remoteEntry.js",
      "exposedModule": "./AuthApp",
      "mountPath": "/login",
      "scope": "pbcAuthService",
      "lazy": false,
      "order": 0,
      "requiredEvents": [],
      "emittedEvents": [
        "auth.user.loggedIn",
        "auth.user.loggedOut",
        "auth.token.refreshed"
      ],
      "healthCheck": "${API_BASE_URL}/pbc-auth-service/health",
      "permissions": [],
      "environments": {
        "local": {
          "remoteEntry": "http://localhost:3001/remoteEntry.js"
        },
        "staging": {
          "remoteEntry": "https://cdn-staging.vnpt.vn/pbc-auth-service/remoteEntry.js"
        },
        "production": {
          "remoteEntry": "https://cdn.vnpt.vn/pbc-auth-service/remoteEntry.js"
        }
      }
    },
    {
      "id": "pbc-user-management",
      "displayName": "User Management",
      "version": "2.3.1",
      "remoteEntry": "${CDN_BASE_URL}/pbc-user-management/remoteEntry.js",
      "exposedModule": "./UserManagementApp",
      "mountPath": "/users",
      "scope": "pbcUserManagement",
      "lazy": true,
      "order": 1,
      "requiredEvents": ["auth.user.loggedIn"],
      "emittedEvents": [
        "user.created",
        "user.updated",
        "user.deleted",
        "user.roleChanged"
      ],
      "healthCheck": "${API_BASE_URL}/pbc-user-management/health",
      "permissions": ["ROLE_ADMIN", "ROLE_USER_MANAGER"],
      "environments": {
        "local": {
          "remoteEntry": "http://localhost:3002/remoteEntry.js"
        },
        "staging": {
          "remoteEntry": "https://cdn-staging.vnpt.vn/pbc-user-management/remoteEntry.js"
        },
        "production": {
          "remoteEntry": "https://cdn.vnpt.vn/pbc-user-management/remoteEntry.js"
        }
      }
    },
    {
      "id": "pbc-notification-center",
      "displayName": "Notification Center",
      "version": "3.0.0",
      "remoteEntry": "${CDN_BASE_URL}/pbc-notification-center/remoteEntry.js",
      "exposedModule": "./NotificationApp",
      "mountPath": "/notifications",
      "scope": "pbcNotificationCenter",
      "lazy": true,
      "order": 2,
      "requiredEvents": ["auth.user.loggedIn", "notification.triggered"],
      "emittedEvents": ["notification.read", "notification.dismissed"],
      "healthCheck": "${API_BASE_URL}/pbc-notification-center/health",
      "permissions": [],
      "environments": {
        "local": {
          "remoteEntry": "http://localhost:3003/remoteEntry.js"
        },
        "staging": {
          "remoteEntry": "https://cdn-staging.vnpt.vn/pbc-notification-center/remoteEntry.js"
        },
        "production": {
          "remoteEntry": "https://cdn.vnpt.vn/pbc-notification-center/remoteEntry.js"
        }
      }
    }
  ]
}
```

## 4A. APP-WIRING.JSON (MỚI v3.1)

**Vai trò:** Nguồn sự thật duy nhất cho event wiring graph — Platform UI (tab Wiring) đọc/ghi file này.

**Vòng đời:**
- **Khi tạo project**: sinh skeleton rỗng (`nodes: [], edges: []`) — tab Wiring render canvas trống, sẵn sàng nhận PBC.
- **Khi kéo PBC đầu tiên vào**: thêm node vào `nodes[]`, `edges[]` vẫn rỗng (chưa có PBC nào để nối).
- **Khi kéo PBC thứ 2+ vào**: thêm node mới + auto-detect edges → hiển thị popup confirm → thêm edges được chấp nhận.
- **Khi user kéo dây thủ công / sửa transform / toggle edge**: cập nhật `edges[]` → trigger codegen output ngay.

**Quan hệ với các file khác:**
- `app-wiring.json` → **INPUT** (user chỉnh sửa qua UI)
- `event-mapping.config.ts` → **OUTPUT** (codegen từ `app-wiring.json.edges[]`)
- `app-asyncapi.yaml` → **OUTPUT** (codegen từ `app-wiring.json.edges[]`)
- `kafka-gateway/topic-registry.ts` → **OUTPUT** (codegen từ `app-wiring.json.edges[]`)

### 4A.1 Schema đầy đủ

**Skeleton khi tạo project (chưa có PBC):**

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-04-17T10:00:00Z",
  "metadata": {
    "appId": "my-app",
    "totalNodes": 0,
    "totalEdges": 0,
    "autoWiredEdges": 0
  },
  "nodes": [],
  "edges": []
}
```

**Schema đầy đủ (sau khi đã kéo PBC và wire events):**

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-04-17T10:30:00Z",
  "metadata": {
    "appId": "student-management",
    "totalNodes": 6,
    "totalEdges": 12,
    "autoWiredEdges": 8
  },

  "nodes": [
    {
      "pbcId": "pbc-auth",
      "displayName": "Authentication & Authorization",
      "position": { "x": 520, "y": 100 },
      "ports": {
        "emits": [
          { "id": "AUTH:USER_LOGGED_IN",  "topic": "pbc.auth.user.logged-in",  "label": "User Logged In" },
          { "id": "AUTH:USER_LOGGED_OUT", "topic": "pbc.auth.user.logged-out", "label": "User Logged Out" },
          { "id": "AUTH:USER_CREATED",    "topic": "pbc.auth.user.created",    "label": "User Created" }
        ],
        "listens": []
      }
    },
    {
      "pbcId": "pbc-student-management",
      "displayName": "Quản lý Sinh viên",
      "position": { "x": 200, "y": 300 },
      "ports": {
        "emits": [
          { "id": "STUDENT:CREATED", "topic": "pbc.student-management.student.created", "label": "Student Created" },
          { "id": "STUDENT:UPDATED", "topic": "pbc.student-management.student.updated", "label": "Student Updated" },
          { "id": "STUDENT:DELETED", "topic": "pbc.student-management.student.deleted", "label": "Student Deleted" }
        ],
        "listens": [
          { "id": "AUTH:USER_CREATED",    "topic": "pbc.auth.user.created",                        "label": "User Created" },
          { "id": "CLASS:STUDENT_ASSIGNED", "topic": "pbc.class-management.student.assigned-to-class", "label": "Student Assigned to Class" }
        ]
      }
    },
    {
      "pbcId": "pbc-class-management",
      "displayName": "Quản lý Lớp học",
      "position": { "x": 200, "y": 500 },
      "ports": {
        "emits": [
          { "id": "CLASS:CREATED",          "topic": "pbc.class-management.class.created",              "label": "Class Created" },
          { "id": "CLASS:STUDENT_ASSIGNED", "topic": "pbc.class-management.student.assigned-to-class", "label": "Student Assigned" }
        ],
        "listens": [
          { "id": "STUDENT:CREATED", "topic": "pbc.student-management.student.created", "label": "Student Created" }
        ]
      }
    },
    {
      "pbcId": "pbc-notification",
      "displayName": "Thông báo",
      "position": { "x": 700, "y": 400 },
      "ports": {
        "emits": [],
        "listens": [
          { "id": "AUTH:USER_LOGGED_IN", "topic": "pbc.auth.user.logged-in",                   "label": "User Logged In" },
          { "id": "AUTH:USER_CREATED",   "topic": "pbc.auth.user.created",                     "label": "User Created" },
          { "id": "STUDENT:CREATED",     "topic": "pbc.student-management.student.created",    "label": "Student Created" },
          { "id": "CLASS:CREATED",       "topic": "pbc.class-management.class.created",        "label": "Class Created" }
        ]
      }
    }
  ],

  "edges": [
    {
      "id": "edge-001",
      "source": { "pbcId": "pbc-auth",               "portId": "AUTH:USER_CREATED" },
      "target": { "pbcId": "pbc-student-management", "portId": "AUTH:USER_CREATED" },
      "transform": {
        "type": "pick",
        "fields": ["userId", "tenantId"]
      },
      "enabled": true,
      "autoWired": true,
      "description": "Liên kết tài khoản với hồ sơ sinh viên khi tạo user mới"
    },
    {
      "id": "edge-002",
      "source": { "pbcId": "pbc-auth",        "portId": "AUTH:USER_LOGGED_IN" },
      "target": { "pbcId": "pbc-notification", "portId": "AUTH:USER_LOGGED_IN" },
      "transform": null,
      "enabled": true,
      "autoWired": true,
      "description": "Gửi thông báo chào mừng khi user đăng nhập"
    },
    {
      "id": "edge-003",
      "source": { "pbcId": "pbc-student-management", "portId": "STUDENT:CREATED" },
      "target": { "pbcId": "pbc-notification",        "portId": "STUDENT:CREATED" },
      "transform": null,
      "enabled": true,
      "autoWired": true,
      "description": "Thông báo khi sinh viên mới được tạo"
    },
    {
      "id": "edge-004",
      "source": { "pbcId": "pbc-class-management",   "portId": "CLASS:STUDENT_ASSIGNED" },
      "target": { "pbcId": "pbc-student-management", "portId": "CLASS:STUDENT_ASSIGNED" },
      "transform": {
        "type": "pick",
        "fields": ["classId", "studentId"]
      },
      "enabled": true,
      "autoWired": false,
      "description": "Cập nhật classId sinh viên khi được gán vào lớp"
    }
  ]
}
```

### 4A.2 Giải thích các field

**`nodes[]`** — Danh sách PBC trên canvas:
- `pbcId`: ID PBC, khớp với `pbc-registry.json.pbcs[].id`
- `displayName`: Tên hiển thị trên UI
- `position`: Tọa độ x,y trên canvas (pixel) — lưu để restore layout khi mở lại
- `ports.emits[]`: Danh sách event mà PBC này **phát ra** (đọc từ `pbc-registry.json.emittedEvents`)
- `ports.listens[]`: Danh sách event mà PBC này **lắng nghe** (đọc từ `pbc-registry.json.requiredEvents`)
- `ports[].id`: ID port duy nhất trong node (dạng `DOMAIN:EVENT_NAME`)
- `ports[].topic`: Kafka topic thực tế (khớp với `asyncapi.yaml` của PBC)
- `ports[].label`: Label hiển thị trên UI

**`edges[]`** — Danh sách kết nối giữa các PBC:
- `id`: ID edge duy nhất (auto-gen: `edge-001`, `edge-002`, ...)
- `source.pbcId` + `source.portId`: PBC nguồn + port phát event
- `target.pbcId` + `target.portId`: PBC đích + port nhận event
- `transform`: Cách biến đổi payload trước khi gửi đến target
  - `type: "pick"` → chỉ lấy một số field
  - `type: "map"` → map field này sang field khác (JSONPath)
  - `type: "custom"` → custom function (lưu dạng string, eval runtime)
  - `null` → không transform, forward nguyên payload
- `enabled`: `false` = tắt edge này (không codegen vào `event-mapping.config.ts`)
- `autoWired`: `true` = edge này được platform tự động tạo khi detect khớp topic
- `description`: Mô tả nghiệp vụ của edge

### 4A.3 Luồng đọc/ghi

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PLATFORM UI (Tab Wiring)                                               │
│                                                                         │
│  READ khi mở tab:                                                       │
│    app-wiring.json → render node graph + edges                          │
│                                                                         │
│  READ để populate ports:                                                │
│    pbc-registry.json.pbcs[].emittedEvents → ports.emits[]              │
│    pbc-registry.json.pbcs[].requiredEvents → ports.listens[]           │
│                                                                         │
│  WRITE khi user thao tác:                                               │
│    - Kéo node → cập nhật nodes[].position                              │
│    - Kéo dây nối → thêm edge mới vào edges[]                           │
│    - Ngắt dây → xóa edge khỏi edges[]                                  │
│    - Sửa transform → cập nhật edges[].transform                        │
│    - Toggle enabled → cập nhật edges[].enabled                         │
│                                                                         │
│  Sau mỗi thay đổi → trigger codegen ngay                               │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  CODEGEN ENGINE                                                     │
  │                                                                     │
  │  Input: app-wiring.json.edges[]                                     │
  │                                                                     │
  │  Output:                                                            │
  │    1. event-mapping.config.ts                                       │
  │       EVENT_MAPPING = edges.filter(e => e.enabled).map(...)        │
  │                                                                     │
  │    2. app-asyncapi.yaml                                             │
  │       channels: từ edges[] → khai báo subscribe/publish            │
  │                                                                     │
  │    3. kafka-gateway/topic-registry.ts                               │
  │       ALLOWED_TOPICS = unique topics từ edges[]                    │
  └─────────────────────────────────────────────────────────────────────┘
```

### 4A.4 Auto-wiring logic (R-20)

Khi user kéo PBC mới vào canvas, platform chạy thuật toán auto-detect:

```typescript
// Pseudo-code
function autoWireNewPBC(newPBC: PBCConfig, existingPBCs: PBCConfig[]): Edge[] {
  const autoEdges: Edge[] = [];

  // Case 1: newPBC emits event mà existingPBC listens
  for (const emittedEvent of newPBC.emittedEvents) {
    for (const existingPBC of existingPBCs) {
      if (existingPBC.requiredEvents.includes(emittedEvent)) {
        autoEdges.push({
          id: generateEdgeId(),
          source: { pbcId: newPBC.id, portId: toPortId(emittedEvent) },
          target: { pbcId: existingPBC.id, portId: toPortId(emittedEvent) },
          transform: null,
          enabled: true,
          autoWired: true,
          description: `Auto-wired: ${newPBC.id} → ${existingPBC.id}`
        });
      }
    }
  }

  // Case 2: existingPBC emits event mà newPBC listens
  for (const existingPBC of existingPBCs) {
    for (const emittedEvent of existingPBC.emittedEvents) {
      if (newPBC.requiredEvents.includes(emittedEvent)) {
        autoEdges.push({
          id: generateEdgeId(),
          source: { pbcId: existingPBC.id, portId: toPortId(emittedEvent) },
          target: { pbcId: newPBC.id, portId: toPortId(emittedEvent) },
          transform: null,
          enabled: true,
          autoWired: true,
          description: `Auto-wired: ${existingPBC.id} → ${newPBC.id}`
        });
      }
    }
  }

  return autoEdges;
}
```

Platform hiển thị popup confirm với danh sách auto-wired edges, user có thể:
- ✅ Chấp nhận tất cả
- ✏️ Thêm transform cho từng edge
- ❌ Bỏ qua một số edge

### 4A.5 Transform types

**`type: "pick"`** — Chỉ lấy một số field:
```json
{
  "type": "pick",
  "fields": ["userId", "tenantId"]
}
```
→ Codegen thành: `transform: (p) => ({ userId: p.userId, tenantId: p.tenantId })`

**`type: "map"`** — Map field này sang field khác:
```json
{
  "type": "map",
  "mapping": {
    "userId": "$.studentId",
    "title": "Sinh viên mới được tạo",
    "body": "$.fullName",
    "type": "info"
  }
}
```
→ Codegen thành: `transform: (p) => ({ userId: p.studentId, title: "Sinh viên mới được tạo", body: p.fullName, type: "info" })`

**`type: "custom"`** — Custom function (lưu dạng string):
```json
{
  "type": "custom",
  "code": "(payload) => ({ ...payload, timestamp: Date.now() })"
}
```
→ Codegen thành: `transform: (payload) => ({ ...payload, timestamp: Date.now() })`

**`null`** — Không transform:
```json
{
  "transform": null
}
```
→ Codegen thành: `transform: undefined` (hoặc không có field `transform`)

## 5. APP SHELL — CORE

ℹ️ Kafka Architecture Note:
event-bus.ts (frontend) kết nối tới kafka-gateway qua WebSocket.
kafka-gateway là Node.js service trung gian — nhận message từ browser rồi produce vào Kafka, đồng thời consume từ Kafka rồi push xuống browser.
API của event-bus.ts giữ nguyên interface (publish / subscribe) — các file khác như event-mapper.ts, token-manager.ts, session-context.tsx không cần thay đổi.

### 5.1 event-bus.ts (Kafka via WebSocket Gateway)

```typescript
// app-shell/src/core/event-bus.ts
//
// Browser không connect trực tiếp Kafka — phải qua kafka-gateway (WebSocket bridge)
// Interface publish/subscribe giữ nguyên so với v2.1 để các module khác không đổi
//
import { ENV } from "../config/env";

// ── Types ──────────────────────────────────────────────────────────────────
type MessageHandler = (payload: unknown) => void;

interface GatewayMessage {
  type: "publish" | "event";
  topic: string;
  payload: unknown;
}

// ── Internal State ──────────────────────────────────────────────────────────
let ws: WebSocket | null = null;
let isConnected = false;
const subscriptions = new Map<string, Set<MessageHandler>>();
const pendingPublish: GatewayMessage[] = []; // Buffer khi chưa connect

// ── Subscription Handle ────────────────────────────────────────────────────
export interface Subscription {
  unsubscribe: () => void;
}

// ── Connect ─────────────────────────────────────────────────────────────────
export async function connectEventBus(): Promise<void> {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(ENV.KAFKA_GATEWAY_URL);

    ws.onopen = () => {
      isConnected = true;
      console.info(
        "[EventBus] Connected to kafka-gateway:",
        ENV.KAFKA_GATEWAY_URL,
      );

      // Đăng ký lại tất cả topic sau khi reconnect
      subscriptions.forEach((_, topic) => _sendSubscribe(topic));

      // Flush buffer
      pendingPublish.splice(0).forEach((msg) => ws?.send(JSON.stringify(msg)));

      resolve();
    };

    ws.onmessage = (event) => {
      try {
        const msg: GatewayMessage = JSON.parse(event.data);
        if (msg.type === "event") {
          subscriptions
            .get(msg.topic)
            ?.forEach((handler) => handler(msg.payload));
        }
      } catch (err) {
        console.error("[EventBus] Invalid message from gateway:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[EventBus] WebSocket error:", err);
      reject(err);
    };

    ws.onclose = (event) => {
      isConnected = false;
      console.warn(
        `[EventBus] Disconnected (code=${event.code}). Reconnecting in 3s...`,
      );
      setTimeout(connectEventBus, 3000); // Auto-reconnect
    };
  });
}

// ── Publish ─────────────────────────────────────────────────────────────────
export function publish<T>(topic: string, payload: T): void {
  const msg: GatewayMessage = { type: "publish", topic, payload };
  if (isConnected && ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  } else {
    pendingPublish.push(msg); // Buffer — gửi sau khi reconnect
    console.warn(`[EventBus] Not connected — buffered publish: ${topic}`);
  }
}

// ── Subscribe ────────────────────────────────────────────────────────────────
export function subscribe<T>(
  topic: string,
  handler: (payload: T) => void,
): Subscription {
  if (!subscriptions.has(topic)) {
    subscriptions.set(topic, new Set());
    if (isConnected) _sendSubscribe(topic); // Báo gateway subscribe topic này
  }
  subscriptions.get(topic)!.add(handler as MessageHandler);

  return {
    unsubscribe: () => {
      subscriptions.get(topic)?.delete(handler as MessageHandler);
      if (subscriptions.get(topic)?.size === 0) {
        subscriptions.delete(topic);
        _sendUnsubscribe(topic);
      }
    },
  };
}

// ── Disconnect ───────────────────────────────────────────────────────────────
export async function disconnectEventBus(): Promise<void> {
  ws?.close(1000, "App shutdown");
  ws = null;
  isConnected = false;
  subscriptions.clear();
}

// ── Internal helpers ─────────────────────────────────────────────────────────
function _sendSubscribe(topic: string): void {
  ws?.send(JSON.stringify({ type: "subscribe", topic }));
}

function _sendUnsubscribe(topic: string): void {
  ws?.send(JSON.stringify({ type: "unsubscribe", topic }));
}
```

### 5.2 event-mapper.ts

```typescript
// app-shell/src/core/event-mapper.ts
//
// Vai trò: Lắng nghe event từ PBC nguồn → transform payload → publish sang PBC đích
// KHÔNG chứa logic nghiệp vụ — chỉ translate/forward event
//
import { publish, subscribe } from "./event-bus";
import { EVENT_MAPPING } from "../config/event-mapping.config";

export function initEventMapper(): void {
  EVENT_MAPPING.forEach(({ source, targets }) => {
    subscribe(source.event, (payload: unknown) => {
      targets.forEach(({ event, transform }) => {
        const outgoing = transform ? transform(payload) : payload;
        publish(event, outgoing);
        console.debug(`[EventMapper] ${source.event} → ${event}`, outgoing);
      });
    });
  });
}
```

### 5.3 pbc-loader.ts

```typescript
// app-shell/src/core/pbc-loader.ts
import registry from "../../pbc-registry.json";
import { isFeatureEnabled } from "../config/feature-flags";

export type PBCConfig = (typeof registry.pbcs)[number];

const ENV =
  (import.meta.env.VITE_ENV as "local" | "staging" | "production") ?? "local";

export function getRemoteEntry(pbc: PBCConfig): string {
  return pbc.environments[ENV]?.remoteEntry ?? pbc.remoteEntry;
}

export async function loadPBC(pbcId: string): Promise<React.ComponentType> {
  if (!isFeatureEnabled(pbcId)) {
    throw new Error(`[PBCLoader] PBC "${pbcId}" bị tắt bởi feature flag`);
  }

  const pbc = registry.pbcs.find((p) => p.id === pbcId);
  if (!pbc) throw new Error(`[PBCLoader] Không tìm thấy PBC: ${pbcId}`);

  const remoteEntry = getRemoteEntry(pbc);

  // Kiểm tra health trước khi load (optional, có thể bỏ nếu cần performance)
  await checkHealth(pbcId, pbc.healthCheck);

  // Module Federation dynamic import
  await __webpack_init_sharing__("default");
  const container = (window as any)[pbc.scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(pbc.exposedModule);
  return factory().default;
}

async function checkHealth(id: string, url: string): Promise<void> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) console.warn(`[PBCLoader] Health check failed cho ${id}`);
  } catch {
    console.warn(`[PBCLoader] Không thể kết nối health check: ${id}`);
  }
}
```

### 5.4 auth-guard.ts

```typescript
// app-shell/src/core/auth-guard.ts
import { getSession } from "./token-manager";
import manifest from "../../app-manifest.json";

export function isPublicRoute(path: string): boolean {
  return (manifest.security.publicRoutes as string[]).includes(path);
}

export function hasPermission(requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  const session = getSession();
  if (!session) return false;
  return requiredRoles.some((role) => session.roles.includes(role));
}

export function guardRoute(
  path: string,
  requiredRoles: string[] = [],
): boolean {
  if (isPublicRoute(path)) return true;
  const session = getSession();
  if (!session) {
    window.location.href = "/login";
    return false;
  }
  if (!hasPermission(requiredRoles)) {
    window.location.href = "/403";
    return false;
  }
  return true;
}
```

### 5.5 token-manager.ts

```typescript
// app-shell/src/core/token-manager.ts
//
// Lưu token IN MEMORY (không dùng localStorage để tránh XSS)
// PBC nhận token qua session-context hoặc subscribe event auth.token.refreshed
//
import { subscribe } from "./event-bus";
import {
  EVENTS,
  EventAuthUserLoggedIn,
  EventAuthTokenRefreshed,
} from "@shared/shared-events";

interface Session {
  accessToken: string;
  refreshToken: string;
  sub: string;
  name: string;
  roles: string[];
  expiresAt: number;
}

let _session: Session | null = null;

export function getSession(): Session | null {
  if (_session && Date.now() > _session.expiresAt) {
    _session = null; // Session hết hạn
  }
  return _session;
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function initTokenManager(): void {
  subscribe<EventAuthUserLoggedIn>(EVENTS.AUTH.USER_LOGGED_IN, (payload) => {
    _session = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      sub: payload.sub,
      name: payload.name,
      roles: payload.roles,
      expiresAt: Date.now() + payload.expiresIn * 1000,
    };
    console.info("[TokenManager] Session initialized:", payload.sub);
  });

  subscribe<EventAuthTokenRefreshed>(EVENTS.AUTH.TOKEN_REFRESHED, (payload) => {
    if (_session) {
      _session.accessToken = payload.accessToken;
      _session.expiresAt = Date.now() + payload.expiresIn * 1000;
    }
  });
}

export function clearSession(): void {
  _session = null;
}
```

### 5.6 session-context.tsx

```tsx
// app-shell/src/core/session-context.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "./token-manager";
import { subscribe } from "./event-bus";
import { EVENTS, EventAuthUserLoggedIn } from "@shared/shared-events";

interface SessionContextValue {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  roles: string[];
}

const SessionContext = createContext<SessionContextValue>({
  isAuthenticated: false,
  userId: null,
  userName: null,
  roles: [],
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionContextValue>(() => {
    const s = getSession();
    return s
      ? {
          isAuthenticated: true,
          userId: s.sub,
          userName: s.name,
          roles: s.roles,
        }
      : { isAuthenticated: false, userId: null, userName: null, roles: [] };
  });

  useEffect(() => {
    const sub = subscribe<EventAuthUserLoggedIn>(
      EVENTS.AUTH.USER_LOGGED_IN,
      (payload) => {
        setSession({
          isAuthenticated: true,
          userId: payload.sub,
          userName: payload.name,
          roles: payload.roles,
        });
      },
    );
    return () => sub.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
```

## 6. APP SHELL — CONFIG

### 6.1 routes.config.ts

```typescript
// app-shell/src/config/routes.config.ts
import registry from "../../pbc-registry.json";

export interface RouteConfig {
  path: string;
  pbcId: string;
  permissions: string[];
  lazy: boolean;
}

// Tự động sinh từ pbc-registry.json — không khai báo thủ công
export const ROUTES: RouteConfig[] = registry.pbcs.map((pbc) => ({
  path: pbc.mountPath,
  pbcId: pbc.id,
  permissions: pbc.permissions,
  lazy: pbc.lazy,
}));
```

### 6.2 event-mapping.config.ts

```typescript
// app-shell/src/config/event-mapping.config.ts
//
// Khai báo toàn bộ event routing giữa các PBC tại một chỗ duy nhất
// Format: source event → [target events + optional transform]
//
import { EVENTS } from "@shared/shared-events";
import type { EventAuthUserLoggedIn } from "@shared/shared-events";

export interface EventTarget {
  event: string;
  transform?: (payload: unknown) => unknown;
}

export interface EventMapping {
  source: { pbcId: string; event: string };
  targets: EventTarget[];
}

export const EVENT_MAPPING: EventMapping[] = [
  // Khi auth service xác thực xong → trigger notification chào mừng
  {
    source: { pbcId: "pbc-auth-service", event: EVENTS.AUTH.USER_LOGGED_IN },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventAuthUserLoggedIn;
          return {
            type: "info",
            message: `Chào mừng ${payload.name} đã đăng nhập!`,
            userId: payload.sub,
          };
        },
      },
    ],
  },
  // Khi user bị xóa → logout ngay nếu đang dùng
  {
    source: { pbcId: "pbc-user-management", event: EVENTS.USER.DELETED },
    targets: [{ event: EVENTS.AUTH.USER_LOGGED_OUT }],
  },
];
```

### 6.3 feature-flags.ts

```typescript
// app-shell/src/config/feature-flags.ts
import manifest from "../../app-manifest.json";

// Map PBC ID → feature flag key
const PBC_FLAG_MAP: Record<string, keyof typeof manifest.featureFlags> = {
  "pbc-notification-center": "enableNotifications",
};

export function isFeatureEnabled(pbcId: string): boolean {
  const flagKey = PBC_FLAG_MAP[pbcId];
  if (!flagKey) return true; // Mặc định bật nếu không có flag
  return manifest.featureFlags[flagKey] === true;
}
```

### 6.4 env.ts

```typescript
// app-shell/src/config/env.ts
// Wrapper an toàn cho biến môi trường — không import.meta.env trực tiếp ở nhiều chỗ

export const ENV = {
  // Kafka Gateway WebSocket URL (browser kết nối vào đây, không phải broker trực tiếp)
  KAFKA_GATEWAY_URL: import.meta.env.VITE_KAFKA_GATEWAY_URL as string,
  CDN_BASE_URL: import.meta.env.VITE_CDN_BASE_URL as string,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  APP_ENV: (import.meta.env.VITE_ENV ?? "local") as
    | "local"
    | "staging"
    | "production",
  IS_PRODUCTION: import.meta.env.PROD === true,
} as const;

// Kiểm tra bắt buộc khi khởi động
export function validateEnv(): void {
  const required: (keyof typeof ENV)[] = [
    "KAFKA_GATEWAY_URL",
    "CDN_BASE_URL",
    "API_BASE_URL",
  ];
  const missing = required.filter((k) => !ENV[k]);
  if (missing.length > 0) {
    throw new Error(`[Env] Thiếu biến môi trường: ${missing.join(", ")}`);
  }
}
```

## 7. APP SHELL — LAYOUT

### 7.1 Shell.tsx

```tsx
// app-shell/src/layout/Shell.tsx
import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import { DesignTokenProvider } from "./DesignTokenProvider";
import { SessionProvider, useSession } from "../core/session-context";
import { loadPBC } from "../core/pbc-loader";
import { guardRoute } from "../core/auth-guard";
import { ROUTES } from "../config/routes.config";
import registry from "../../pbc-registry.json";

function PBCRoute({
  pbcId,
  permissions,
}: {
  pbcId: string;
  permissions: string[];
}) {
  const { isAuthenticated } = useSession();
  const [Component, setComponent] = React.useState<React.ComponentType | null>(
    null,
  );

  useEffect(() => {
    const path = registry.pbcs.find((p) => p.id === pbcId)?.mountPath ?? "/";
    if (!guardRoute(path, permissions)) return;
    loadPBC(pbcId).then(setComponent).catch(console.error);
  }, [pbcId, permissions]);

  if (!isAuthenticated && !permissions.length) return <Navigate to="/login" />;
  if (!Component) return <div>Đang tải {pbcId}...</div>;
  return <Component />;
}

export default function Shell() {
  return (
    <DesignTokenProvider>
      <SessionProvider>
        <Navbar />
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {ROUTES.map(({ path, pbcId, permissions }) => (
                <Route
                  key={pbcId}
                  path={`${path}/*`}
                  element={<PBCRoute pbcId={pbcId} permissions={permissions} />}
                />
              ))}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<div>404 — Không tìm thấy trang</div>} />
            </Routes>
          </Suspense>
        </main>
      </SessionProvider>
    </DesignTokenProvider>
  );
}
```

## 8. ENABLEDSLOTS PATTERN (MỚI v3.0)

### Vấn đề với cách cũ

Shell.tsx hard-code từng slot:
```tsx
// ❌ Cách cũ — phải sửa Shell.tsx mỗi khi thêm PBC
const LazyProfileSlot = lazy(() => importFromRemote(authEntry, "./ProfileSlot"));
if (isProfile) return <LazyProfileSlot />;
if (isUserMgmt) return <LazyUserManagement />;
```

Mỗi lần thêm PBC mới phải vào sửa Shell.tsx — vi phạm R-04 và R-17.

### Giải pháp: Config-driven slot mounting

**Khai báo slots trong `app-contract.json`:**

```json
{
  "includedPBCs": [
    {
      "pbcId": "pbc-auth",
      "version": "0.1.0",
      "enabledSlots": [
        {
          "slotName": "LoginSlot",
          "mountPoint": "login-page",
          "visible": true,
          "order": 0
        },
        {
          "slotName": "ProfileSlot",
          "mountPoint": "main-content",
          "visible": true,
          "order": 0,
          "routeMatch": "/profile"
        },
        {
          "slotName": "UserManagementSlot",
          "mountPoint": "main-content",
          "visible": true,
          "order": 0,
          "routeMatch": "/user-management",
          "requiredRoles": ["ADMIN", "ACADEMIC_STAFF"]
        }
      ]
    },
    {
      "pbcId": "pbc-student-profile",
      "version": "1.0.0",
      "enabledSlots": [
        {
          "slotName": "bootstrap",
          "mountPoint": "main-content",
          "visible": true,
          "order": 1,
          "routeMatch": "/students"
        }
      ]
    }
  ]
}
```

**Các field của `enabledSlots[]`:**

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `slotName` | ✅ | Tên exposed module trong vite.config của PBC (không có `./`) |
| `mountPoint` | ✅ | ID của `<MountPoint>` trong layout Shell |
| `visible` | ✅ | `false` = ẩn mặc định, chờ `triggerEvent` |
| `order` | ✅ | Thứ tự render khi nhiều slot cùng mount point |
| `routeMatch` | ❌ | Chỉ render khi `pathname.startsWith(routeMatch)` |
| `triggerEvent` | ❌ | Tên event để lazy-activate slot (visible: false → true) |
| `requiredRoles` | ❌ | Chỉ render nếu user có ít nhất 1 role trong danh sách |

### 8.1 slot-registry.ts

```typescript
// app-shell/src/core/slot-registry.ts
import contract from "../../../app-contract.json";
import registry from "../../../pbc-registry.json";

export interface SlotConfig {
  pbcId: string;
  slotName: string;
  mountPoint: string;
  visible: boolean;
  order: number;
  routeMatch?: string;
  triggerEvent?: string;
  requiredRoles?: string[];
}

export function getAllSlots(): SlotConfig[] {
  return contract.includedPBCs.flatMap((pbc) =>
    (pbc.enabledSlots ?? []).map((slot) => ({
      pbcId:         pbc.pbcId,
      slotName:      slot.slotName,
      mountPoint:    slot.mountPoint,
      visible:       slot.visible,
      order:         slot.order ?? 0,
      routeMatch:    (slot as { routeMatch?: string }).routeMatch,
      triggerEvent:  (slot as { triggerEvent?: string }).triggerEvent,
      requiredRoles: (slot as { requiredRoles?: string[] }).requiredRoles,
    })),
  );
}

export function getSlotsForMountPoint(
  mountPoint: string,
  pathname: string,
  userRoles: string[] = [],
): SlotConfig[] {
  return getAllSlots()
    .filter((s) => {
      if (s.mountPoint !== mountPoint) return false;
      if (!s.visible) return false;
      if (s.routeMatch && !pathname.startsWith(s.routeMatch)) return false;
      if (s.requiredRoles?.length) {
        if (!s.requiredRoles.some((r) => userRoles.includes(r))) return false;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

export function getScopeForPBC(pbcId: string): string | undefined {
  return registry.pbcs.find((p) => p.id === pbcId)?.scope;
}
```

### 8.2 MountPoint.tsx

```tsx
// app-shell/src/core/MountPoint.tsx
import React, { Suspense, lazy, useState, useEffect } from "react";
import { Spin } from "antd";
import { getSlotsForMountPoint, getScopeForPBC } from "./slot-registry";
import { importFromRemote, getEnabledPBCs } from "./pbc-loader";
import { subscribe } from "./event-bus";
import { useSession } from "./session-context";
import type { SlotConfig } from "./slot-registry";

function SlotRenderer({ slot, slotProps }: { slot: SlotConfig; slotProps?: Record<string, unknown> }) {
  const [visible, setVisible] = useState(slot.visible);

  useEffect(() => {
    if (!slot.triggerEvent) return;
    const sub = subscribe(slot.triggerEvent, () => setVisible(true));
    return () => sub.unsubscribe();
  }, [slot.triggerEvent]);

  if (!visible) return null;

  const entry = getEnabledPBCs().find((p) => p.pbcId === slot.pbcId);
  if (!entry) return null;

  const LazySlot = lazy(() =>
    importFromRemote<React.ComponentType<Record<string, unknown>>>(
      entry, `./${slot.slotName}`
    ).then((C) => ({ default: C }))
  );

  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spin size="large" /></div>}>
      <LazySlot {...(slotProps ?? {})} />
    </Suspense>
  );
}

export const MountPoint: React.FC<{ id: string; slotProps?: Record<string, unknown> }> = ({ id, slotProps }) => {
  const { roles } = useSession();
  const pathname = window.location.pathname;
  const slots = getSlotsForMountPoint(id, pathname, roles);
  if (slots.length === 0) return null;
  return (
    <>
      {slots.map((slot) => (
        <SlotRenderer key={`${slot.pbcId}/${slot.slotName}`} slot={slot} slotProps={slotProps} />
      ))}
    </>
  );
};
```

### 8.3 Shell.tsx — không còn hard-code slot

```tsx
// app-shell/src/layout/Shell.tsx — chỉ đặt <MountPoint>, không biết PBC cụ thể
export const ShellInner: React.FC = ({ children }) => {
  const hasMatchingSlot = getAllSlots().some(
    (s) => s.mountPoint === "main-content" && s.visible &&
           s.routeMatch && pathname.startsWith(s.routeMatch)
  );

  return (
    <Layout>
      <Sider>...</Sider>
      <Content>
        {hasMatchingSlot ? (
          <MountPoint id="main-content" />   {/* ← đọc từ app-contract */}
        ) : (
          children                           {/* ← Dashboard fallback */}
        )}
      </Content>
    </Layout>
  );
};
```

### 8.4 Quy tắc khi thêm PBC mới (R-17, R-18)

Khi thêm `pbc-xyz` với slot `XyzSlot`:

1. Thêm vào `app-contract.json.includedPBCs`:
```json
{
  "pbcId": "pbc-xyz",
  "version": "1.0.0",
  "enabledSlots": [
    { "slotName": "XyzSlot", "mountPoint": "main-content", "visible": true, "order": 5, "routeMatch": "/xyz" }
  ]
}
```

2. Thêm literal import vào `remote-imports.ts` (R-18 — bắt buộc):
```typescript
export const REMOTE_IMPORT_MAP = {
  // ... existing
  "pbc_xyz/XyzSlot": () => import("pbc_xyz/XyzSlot").then((m) => m.default ?? m),
};
```

3. Thêm remote vào `vite.config.ts`:
```typescript
federation({
  remotes: {
    pbc_xyz: "http://localhost:3015/assets/remoteEntry.js",
  }
})
```

**Không cần sửa Shell.tsx.** MountPoint tự đọc config và render.

### 8.5 Mount Points chuẩn

| Mount Point ID | Vị trí trong layout | Dùng cho |
|---|---|---|
| `login-page` | Full page, không có Shell | LoginSlot của auth PBC |
| `main-content` | Content area trong Shell | Slot chính của PBC nghiệp vụ |
| `toolbar` | Thanh công cụ trên content | ActionBar, filter slots |
| `modal` | Modal overlay | Form slots, detail slots |
| `sidebar-widget` | Widget trong sidebar | Quick stats, shortcuts |

## 10. KAFKA GATEWAY

Vai trò: Node.js service làm cầu nối giữa browser (WebSocket) và Kafka Broker (kafkajs).
Chạy như một service độc lập trong docker-compose và Kubernetes.
Không là App Shell — App Shell chỉ kết nối vào gateway này.

### 8.1 kafka-gateway/src/index.ts

```typescript
// kafka-gateway/src/index.ts
import { WebSocketServer, WebSocket } from "ws";
import { createKafkaClient } from "./kafka-client";
import { handleWsMessage } from "./ws-handler";
import { ALLOWED_TOPICS } from "./topic-registry";

const PORT = parseInt(process.env.GATEWAY_PORT ?? "4000");
const wss = new WebSocketServer({ port: PORT });

async function bootstrap() {
  const kafka = await createKafkaClient();
  console.info(
    `[KafkaGateway] WebSocket server listening on ws://0.0.0.0:${PORT}`,
  );

  wss.on("connection", (ws: WebSocket, req) => {
    const clientIp = req.socket.remoteAddress;
    console.info(`[KafkaGateway] Client connected: ${clientIp}`);

    // Mỗi connection có một consumer group riêng để nhận đúng message
    const clientId = crypto.randomUUID();
    handleWsMessage(ws, kafka, clientId, ALLOWED_TOPICS);

    ws.on("close", () => {
      console.info(
        `[KafkaGateway] Client disconnected: ${clientIp} (${clientId})`,
      );
    });
  });
}

bootstrap().catch((err) => {
  console.error("[KafkaGateway] Fatal error:", err);
  process.exit(1);
});
```

### 8.2 kafka-gateway/src/kafka-client.ts

```typescript
// kafka-gateway/src/kafka-client.ts
import { Kafka, Producer, Admin } from "kafkajs";
import { ALLOWED_TOPICS } from "./topic-registry";

export interface KafkaClient {
  producer: Producer;
  kafka: Kafka;
}

export async function createKafkaClient(): Promise<KafkaClient> {
  const kafka = new Kafka({
    clientId: "kafka-gateway",
    brokers: (process.env.KAFKA_BROKERS ?? "kafka:9092").split(","),
    retry: { retries: 5, initialRetryTime: 300 },
  });

  const admin = kafka.admin();
  await admin.connect();

  // Tự động tạo topic nếu chưa có
  const existingTopics = await admin.listTopics();
  const toCreate = ALLOWED_TOPICS.filter((t) => !existingTopics.includes(t));
  if (toCreate.length > 0) {
    await admin.createTopics({
      topics: toCreate.map((topic) => ({
        topic,
        numPartitions: parseInt(process.env.KAFKA_NUM_PARTITIONS ?? "6"),
        replicationFactor: parseInt(
          process.env.KAFKA_REPLICATION_FACTOR ?? "1",
        ),
      })),
    });
    console.info("[KafkaGateway] Created topics:", toCreate);
  }
  await admin.disconnect();

  const producer = kafka.producer();
  await producer.connect();
  console.info("[KafkaGateway] Kafka producer connected");

  return { kafka, producer };
}
```

### 8.3 kafka-gateway/src/ws-handler.ts

```typescript
// kafka-gateway/src/ws-handler.ts
import { WebSocket } from "ws";
import { KafkaClient } from "./kafka-client";
import { Consumer } from "kafkajs";

interface WsMessage {
  type: "publish" | "subscribe" | "unsubscribe";
  topic: string;
  payload?: unknown;
}

export function handleWsMessage(
  ws: WebSocket,
  { kafka, producer }: KafkaClient,
  clientId: string,
  allowedTopics: string[],
): void {
  // Map topic → consumer (mỗi subscription 1 consumer)
  const consumers = new Map<string, Consumer>();

  ws.on("message", async (raw) => {
    let msg: WsMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      console.warn("[KafkaGateway] Invalid JSON from client:", clientId);
      return;
    }

    // Whitelist check — không cho publish/subscribe topic tự do
    if (!allowedTopics.includes(msg.topic)) {
      console.warn(
        `[KafkaGateway] Blocked topic: ${msg.topic} from ${clientId}`,
      );
      return;
    }

    switch (msg.type) {
      case "publish": {
        await producer.send({
          topic: msg.topic,
          messages: [{ value: JSON.stringify(msg.payload), key: clientId }],
        });
        break;
      }

      case "subscribe": {
        if (consumers.has(msg.topic)) return; // Đã subscribe rồi
        const consumer = kafka.consumer({
          groupId: `gateway-${clientId}-${msg.topic}`,
        });
        await consumer.connect();
        await consumer.subscribe({ topic: msg.topic, fromBeginning: false });
        await consumer.run({
          eachMessage: async ({ message }) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "event",
                  topic: msg.topic,
                  payload: JSON.parse(message.value?.toString() ?? "null"),
                }),
              );
            }
          },
        });
        consumers.set(msg.topic, consumer);
        console.debug(`[KafkaGateway] ${clientId} subscribed: ${msg.topic}`);
        break;
      }

      case "unsubscribe": {
        const consumer = consumers.get(msg.topic);
        if (consumer) {
          await consumer.disconnect();
          consumers.delete(msg.topic);
        }
        break;
      }
    }
  });

  ws.on("close", async () => {
    // Cleanup tất cả consumer khi client disconnect
    for (const [topic, consumer] of consumers) {
      await consumer.disconnect().catch(() => {});
      console.debug(
        `[KafkaGateway] Cleaned up consumer for ${clientId}:${topic}`,
      );
    }
    consumers.clear();
  });
}
```

### 8.4 kafka-gateway/src/topic-registry.ts

```typescript
// kafka-gateway/src/topic-registry.ts
//
// WHITELIST — chỉ các topic trong danh sách này mới được publish/subscribe qua gateway
// Đồng bộ với EVENTS constants trong shared/shared-events/index.ts
//
export const ALLOWED_TOPICS: string[] = [
  // Auth
  "auth.user.loggedIn",
  "auth.user.loggedOut",
  "auth.token.refreshed",
  "auth.user.loginFailed",
  // User
  "user.created",
  "user.updated",
  "user.deleted",
  "user.roleChanged",
  // Notification
  "notification.triggered",
  "notification.read",
  "notification.dismissed",
];
```

### 8.5 kafka-gateway/package.json

```json
{
  "name": "kafka-gateway",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "kafkajs": "^2.2.4",
    "ws": "^8.17.0"
  },
  "devDependencies": {
    "@types/ws": "^8.5.10",
    "typescript": "^5.4.0",
    "ts-node-dev": "^2.0.0"
  }
}
```

## 11. SHARED — SHARED-EVENTS

```typescript
// shared/shared-events/index.ts
//
// Quy ước đặt tên event: <domain>.<entity>.<verb>
// Dùng past tense cho facts (đã xảy ra): loggedIn, created, updated
// Dùng verb cho commands (yêu cầu xảy ra): trigger, send
//
export const EVENTS = {
  AUTH: {
    USER_LOGGED_IN: "auth.user.loggedIn",
    USER_LOGGED_OUT: "auth.user.loggedOut",
    TOKEN_REFRESHED: "auth.token.refreshed",
    LOGIN_FAILED: "auth.user.loginFailed",
  },
  USER: {
    CREATED: "user.created",
    UPDATED: "user.updated",
    DELETED: "user.deleted",
    ROLE_CHANGED: "user.roleChanged",
  },
  NOTIFICATION: {
    TRIGGERED: "notification.triggered",
    READ: "notification.read",
    DISMISSED: "notification.dismissed",
  },
} as const;

// ─── Payload Types ───────────────────────────────────────────────────────────

export interface EventAuthUserLoggedIn {
  sub: string;
  name: string;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface EventAuthUserLoggedOut {
  sub: string;
  reason?: "manual" | "expired" | "forced";
}

export interface EventAuthTokenRefreshed {
  sub: string;
  accessToken: string;
  expiresIn: number;
}

export interface EventUserCreated {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string; // ISO 8601
}

export interface EventUserUpdated {
  userId: string;
  changes: Partial<{ name: string; email: string; roles: string[] }>;
  updatedAt: string;
}

export interface EventUserDeleted {
  userId: string;
  deletedAt: string;
}

export interface EventNotificationTriggered {
  type: "info" | "warning" | "error" | "success";
  message: string;
  userId?: string; // undefined = broadcast to all
  metadata?: Record<string, unknown>;
}
```

### 9.2 event-contracts.ts (Zod validation)

```typescript
// shared/shared-events/event-contracts.ts
// Dùng Zod để validate payload runtime — đặc biệt hữu ích khi nhận từ Kafka

import { z } from "zod";

export const AuthUserLoggedInSchema = z.object({
  sub: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  roles: z.array(z.string()),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().positive(),
});

export const NotificationTriggeredSchema = z.object({
  type: z.enum(["info", "warning", "error", "success"]),
  message: z.string().min(1),
  userId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Helper: validate và throw rõ ràng thay vì crash ngầm
export function validateEvent<T>(schema: z.ZodSchema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    console.error(
      "[EventValidation] Payload không hợp lệ:",
      result.error.format(),
    );
    throw new Error(`[EventValidation] Payload không hợp lệ`);
  }
  return result.data;
}
```

## 12. SHARED — SHARED-UI / DESIGNTOKENPROVIDER

### 10.1 tokens.css — Chuẩn CSS Variables

```css
/* shared/shared-ui/design-tokens/tokens.css
   Quy tắc cho PBC:
   ✅ Dùng: var(--color-primary)
   ❌ Không được: override :root, không hardcode màu, không dùng Tailwind class riêng
*/

:root {
  /* Brand Colors */
  --color-primary: #0d6efd;
  --color-primary-dark: #0a58ca;
  --color-primary-light: #cfe2ff;
  --color-secondary: #6c757d;
  --color-success: #198754;
  --color-warning: #ffc107;
  --color-danger: #dc3545;

  /* Neutral */
  --color-bg: #ffffff;
  --color-bg-subtle: #f8f9fa;
  --color-border: #dee2e6;
  --color-text: #212529;
  --color-text-muted: #6c757d;

  /* Typography */
  --font-family-base: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Spacing (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);

  /* Z-index layers */
  --z-modal: 1000;
  --z-overlay: 900;
  --z-navbar: 800;
  --z-dropdown: 700;
}
```

### 10.2 DesignTokenProvider.tsx

```tsx
// app-shell/src/layout/DesignTokenProvider.tsx
//
// Inject CSS variables vào :root dựa trên theme config trong app-manifest.json
// PBC PHẢI dùng var(--color-primary) v.v. — không được override :root từ PBC
//
import React, { useEffect } from "react";
import manifest from "../../app-manifest.json";

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

interface Props {
  children: React.ReactNode;
}

export function DesignTokenProvider({ children }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", manifest.theme.primaryColor);
    // Tự động sinh các biến derived từ primary
    root.style.setProperty(
      "--color-primary-rgb",
      hexToRgb(manifest.theme.primaryColor),
    );
  }, []);

  return <>{children}</>;
}
```

## 13. DOCKER-COMPOSE.YML

```yaml
# docker-compose.yml
# Stack: Kafka (KRaft — không cần Zookeeper) + Kafka UI + kafka-gateway + App Shell + PBCs
# Convention: App Shell = 3000, kafka-gateway = 4000, PBC từ 3001, Kafka broker = 9092

version: "3.9"

services:
  # ── Kafka Broker (KRaft mode — không cần Zookeeper) ─────────────────────────
  kafka:
    image: bitnami/kafka:3.7
    container_name: crm-kafka
    ports:
      - "9092:9092" # Internal broker
      - "9094:9094" # External access (từ host machine)
    environment:
      # KRaft config — không dùng Zookeeper
      KAFKA_CFG_NODE_ID: 1
      KAFKA_CFG_PROCESS_ROLES: "broker,controller"
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: "1@kafka:9093"
      # Listeners
      KAFKA_CFG_LISTENERS: "PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:9094"
      KAFKA_CFG_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:9092,EXTERNAL://localhost:9094"
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,EXTERNAL:PLAINTEXT"
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_CFG_INTER_BROKER_LISTENER_NAME: "PLAINTEXT"
      # Topic defaults
      KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: "false" # Tắt auto-create — để kafka-gateway quản lý
      KAFKA_CFG_NUM_PARTITIONS: 6
      KAFKA_CFG_DEFAULT_REPLICATION_FACTOR: 1 # Local: 1, Production: 3
      KAFKA_CFG_LOG_RETENTION_HOURS: 168 # 7 ngày
    volumes:
      - kafka_data:/bitnami/kafka
    healthcheck:
      test:
        [
          "CMD",
          "kafka-topics.sh",
          "--bootstrap-server",
          "localhost:9092",
          "--list",
        ]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  # ── Kafka UI — Monitor topics, messages, consumers ───────────────────────────
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: crm-kafka-ui
    ports:
      - "8080:8080" # → http://localhost:8080
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      KAFKA_CLUSTERS_0_NAME: "crm-local"
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: "kafka:9092"

  # ── Kafka Gateway — WebSocket bridge cho browser ─────────────────────────────
  kafka-gateway:
    build:
      context: ./kafka-gateway
      dockerfile: Dockerfile
    container_name: crm-kafka-gateway
    ports:
      - "4000:4000" # WebSocket: ws://localhost:4000
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      KAFKA_BROKERS: "kafka:9092"
      GATEWAY_PORT: "4000"
      KAFKA_NUM_PARTITIONS: "6"
      KAFKA_REPLICATION_FACTOR: "1"
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "require('net').createConnection(4000,'localhost').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))",
        ]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── App Shell ─────────────────────────────────────────────────────────────────
  app-shell:
    build:
      context: ./app-shell
      dockerfile: Dockerfile
    container_name: crm-app-shell
    ports:
      - "3000:3000"
    depends_on:
      kafka-gateway:
        condition: service_healthy
    environment:
      VITE_KAFKA_GATEWAY_URL: "ws://localhost:4000" # Browser dùng localhost
      VITE_ENV: "local"
      VITE_API_BASE_URL: "http://localhost:8090"
      VITE_CDN_BASE_URL: "http://localhost:3000"
    volumes:
      - ./app-shell/src:/app/src

  # ── PBC Services (backend kết nối Kafka trực tiếp) ───────────────────────────
  pbc-auth-service:
    build:
      context: ./pbcs/pbc-auth-service
    container_name: crm-pbc-auth
    ports:
      - "3001:3001"
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      KAFKA_BROKERS: "kafka:9092" # Backend dùng broker trực tiếp
      KAFKA_GROUP_ID: "pbc-auth-consumers"
      PORT: "3001"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  pbc-user-management:
    build:
      context: ./pbcs/pbc-user-management
    container_name: crm-pbc-users
    ports:
      - "3002:3002"
    depends_on:
      kafka:
        condition: service_healthy
      pbc-auth-service:
        condition: service_healthy
    environment:
      KAFKA_BROKERS: "kafka:9092"
      KAFKA_GROUP_ID: "pbc-user-consumers"
      PORT: "3002"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3002/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  pbc-notification-center:
    build:
      context: ./pbcs/pbc-notification-center
    container_name: crm-pbc-notifications
    ports:
      - "3003:3003"
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      KAFKA_BROKERS: "kafka:9092"
      KAFKA_GROUP_ID: "pbc-notification-consumers"
      PORT: "3003"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3003/health"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  kafka_data:
    driver: local

networks:
  default:
    name: crm-network
```

## 14. CI/CD — .GITLAB-CI.YML

```yaml
# .gitlab-ci.yml
# Stages bổ sung so với v2.0:
#   - pbc-compatibility-check: verify version PBC trước khi build
#   - integration-test: test event flow E2E xuyên PBC
#   - notify-pbc-teams: báo các team PBC khi App deploy

variables:
  NODE_VERSION: "20"
  DOCKER_REGISTRY: registry.vnpt.vn
  APP_NAME: crm-app

stages:
  - validate
  - pbc-compatibility-check # ← MỚI
  - build
  - test
  - integration-test # ← MỚI
  - security-scan
  - push
  - deploy
  - notify-pbc-teams # ← MỚI

# ── Stage: Validate ─────────────────────────────────────────────────────────
lint:
  stage: validate
  image: node:${NODE_VERSION}-alpine
  script:
    - npm ci
    - npm run lint
    - npm run type-check

validate-manifests:
  stage: validate
  image: node:${NODE_VERSION}-alpine
  script:
    - node scripts/validate-manifests.js # Kiểm tra app-manifest.json + pbc-registry.json schema

# ── Stage: PBC Compatibility Check ── MỚI ────────────────────────────────────
pbc-version-check:
  stage: pbc-compatibility-check
  image: node:${NODE_VERSION}-alpine
  script:
    # Đọc pbc-registry.json và verify version PBC có available trên CDN không
    - node scripts/check-pbc-versions.js
  artifacts:
    reports:
      # Lưu báo cáo compatibility để review khi có breaking change
      dotenv: pbc-compatibility-report.env

# ── Stage: Build ─────────────────────────────────────────────────────────────
build-app-shell:
  stage: build
  image: node:${NODE_VERSION}-alpine
  script:
    - cd app-shell && npm ci && npm run build
  artifacts:
    paths: [app-shell/dist/]
    expire_in: 1 hour

# ── Stage: Test ──────────────────────────────────────────────────────────────
unit-test:
  stage: test
  image: node:${NODE_VERSION}-alpine
  script:
    - npm run test:unit -- --coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# ── Stage: Integration Test ── MỚI ───────────────────────────────────────────
integration-test-event-flow:
  stage: integration-test
  image: docker/compose:latest
  services:
    - docker:dind
  script:
    # Khởi động toàn bộ stack, chạy test event flow xuyên PBC
    - docker-compose up -d --wait
    - npm run test:integration # Test: auth.loggedIn → notification.triggered
    - npm run test:e2e-event-flow # Test: user.deleted → auth.loggedOut
  after_script:
    - docker-compose down -v
  artifacts:
    when: always
    paths: [test-results/integration/]

# ── Stage: Security Scan ──────────────────────────────────────────────────────
dependency-scan:
  stage: security-scan
  image: node:${NODE_VERSION}-alpine
  script:
    - npm audit --audit-level=high
    - npx license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause"

# ── Stage: Push ──────────────────────────────────────────────────────────────
push-image:
  stage: push
  image: docker:latest
  services: [docker:dind]
  script:
    - docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:${CI_COMMIT_SHA} .
    - docker push ${DOCKER_REGISTRY}/${APP_NAME}:${CI_COMMIT_SHA}
  only: [main, develop]

# ── Stage: Deploy ─────────────────────────────────────────────────────────────
deploy-staging:
  stage: deploy
  image: alpine/helm:latest
  script:
    - helm upgrade --install ${APP_NAME} ./infra/helm
      --namespace staging
      --set image.tag=${CI_COMMIT_SHA}
      --set env=staging
  environment:
    name: staging
    url: https://crm-staging.vnpt.vn
  only: [develop]

deploy-production:
  stage: deploy
  image: alpine/helm:latest
  script:
    - helm upgrade --install ${APP_NAME} ./infra/helm
      --namespace production
      --set image.tag=${CI_COMMIT_SHA}
      --set env=production
  environment:
    name: production
    url: https://crm.vnpt.vn
  when: manual
  only: [main]

# ── Stage: Notify PBC Teams ── MỚI ───────────────────────────────────────────
notify-pbc-teams-success:
  stage: notify-pbc-teams
  image: curlimages/curl:latest
  script:
    # Gửi thông báo tới Slack/Teams của từng PBC team khi deploy thành công
    - |
      curl -X POST ${SLACK_WEBHOOK_URL} \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"✅ ${APP_NAME} v${CI_COMMIT_TAG} deployed to production. PBC versions: $(cat pbc-compatibility-report.env)\"}"
  when: on_success
  only: [main]

notify-pbc-teams-failure:
  stage: notify-pbc-teams
  image: curlimages/curl:latest
  script:
    - |
      curl -X POST ${SLACK_WEBHOOK_URL} \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"❌ ${APP_NAME} deploy FAILED at stage: ${CI_JOB_STAGE}. Check: ${CI_PIPELINE_URL}\"}"
  when: on_failure
  only: [main, develop]
```

## 15. INFRA — HELM CHART

### 13.1 Chart.yaml

```yaml
# infra/helm/Chart.yaml
apiVersion: v2
name: crm-app
description: CRM Application — Composed from multiple PBCs
type: application
version: 0.1.0
appVersion: "1.0.0"
```

### 13.2 values.yaml (mẫu)

```yaml
# infra/helm/values.yaml
replicaCount: 2

image:
  repository: registry.vnpt.vn/crm-app
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  host: crm.vnpt.vn
  tls: true

# Kafka config
kafka:
  brokers:
    - "kafka-broker-1:9092"
    - "kafka-broker-2:9092"
    - "kafka-broker-3:9092"
  clientId: "crm-app"
  groupId: "crm-app-consumer-group"
  topicPrefix: "crm."
  replicationFactor: 3
  numPartitions: 6

# Kafka Gateway (WebSocket bridge)
kafkaGateway:
  replicaCount: 2
  image: registry.vnpt.vn/kafka-gateway
  port: 4000
  wsUrl: "wss://kafka-gateway.vnpt.vn"

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

## 16. QUY ƯỚC ĐẶT TÊN & VERSIONING

### 14.1 Event Naming Convention

| Pattern                               | Ví dụ                | Dùng khi                 |
| ------------------------------------- | -------------------- | ------------------------ |
| `<domain>.<entity>.<verb_past>`       | auth.user.loggedIn   | Sự kiện đã xảy ra (fact) |
| `<domain>.<entity>.<verb_infinitive>` | notification.trigger | Command (yêu cầu xảy ra) |
| `<domain>.<entity>.<state>`           | user.status.active   | Trạng thái thay đổi      |

Quy tắc bắt buộc:

- Tất cả event phải được khai báo trong `shared/shared-events/index.ts`
- Không dùng chuỗi thô `"auth.user.loggedIn"` — luôn dùng `EVENTS.AUTH.USER_LOGGED_IN`
- Event name không dùng chữ hoa, dùng camelCase sau dấu chấm cuối

### 14.2 PBC Version Contract

| Loại thay đổi            | Semver bump    | Cần cập nhật pbc-registry.json?             |
| ------------------------ | -------------- | ------------------------------------------- |
| Bugfix, style            | Patch (x.x.+1) | Không bắt buộc                              |
| Thêm event mới           | Minor (x.+1.0) | Nên cập nhật                                |
| Đổi event name / payload | Major (+1.0.0) | Bắt buộc + cập nhật event-mapping.config.ts |
| Xóa event                | Major (+1.0.0) | Bắt buộc + báo tất cả teams                 |

### 14.3 Port Convention (Local)

| Service                      | Port |
| ---------------------------- | ---- |
| App Shell                    | 3000 |
| PBC thứ 1 (auth)             | 3001 |
| PBC thứ 2                    | 3002 |
| PBC thứ N                    | 300N |
| kafka-gateway (WebSocket)    | 4000 |
| Kafka Broker (internal)      | 9092 |
| Kafka Broker (external/host) | 9094 |
| Kafka UI Monitor             | 8080 |
| API Gateway                  | 8090 |

## 17. BÀI HỌC TỪ THỰC TẾ TRIỂN KHAI (v3.0)

Những vấn đề phát sinh khi tích hợp pbc-auth vào app-shell và cách xử lý:

### 15.1 Import path trong monorepo

**Vấn đề:** `app-shell/src/guards/auth-guard.ts` import `../../app-contract.json` nhưng file thật nằm ở `student-management/app-contract.json` — cách 3 cấp so với `src/guards/`.

**Quy tắc:** Trước khi sinh code, AI phải tính đúng số cấp `../` dựa trên vị trí thực tế của file trong monorepo:
```
app-shell/src/guards/auth-guard.ts  →  ../../../app-contract.json  ✅
app-shell/src/config/app-contract.ts →  ../../../app-contract.json  ✅
app-shell/src/core/pbc-loader.ts    →  ../../../pbc-registry.json  ✅
```

### 15.2 KafkaJS không chạy trong browser

**Vấn đề:** Import `kafkajs` vào Vite bundle gây warnings `Module "net" has been externalized` và runtime error vì browser không có Node.js modules.

**Giải pháp (đã có trong v2.8):** Dùng `kafka-gateway` WebSocket bridge. App Shell frontend chỉ dùng `WebSocket` API native của browser.

**Nếu chưa có kafka-gateway** (dev nhanh): wrap `initEventBus` trong try/catch, log warning và tiếp tục — không crash app:
```typescript
try {
  await initEventBus(KAFKA_BROKERS);
} catch (err) {
  console.warn('[app-shell] Event bus unavailable, continuing without events');
}
```

### 15.3 Auth PBC cần route đặc biệt

**Vấn đề:** Route `/login` cần render `LoginSlot` từ pbc-auth **không có Shell** (không có Navbar/Sidebar) — khác với các PBC khác render trong Shell.

**Quy tắc:**
- `/login` phải có trong `security.publicRoutes` của `app-contract.json`
- `main.tsx` phải xử lý route `/login` riêng, không wrap trong `<Shell>`
- Sau khi login thành công, redirect về `appContract.appShell.defaultRoute`
- Lưu `returnTo` vào `sessionStorage` trước khi redirect về `/login`

### 15.4 Token storage

**Vấn đề:** Dùng `localStorage.getItem("token")` — key không nhất quán với pbc-auth dùng `accessToken`.

**Quy tắc:** Thống nhất key storage:
- `accessToken` — JWT access token
- `refreshToken` — refresh token  
- `tenantId` — tenant context
- `currentUser` — user info (JSON) trong `sessionStorage`

**Tốt hơn (v2.8):** Dùng in-memory storage qua `token-manager.ts` để tránh XSS.

### 15.5 Dockerfile app-shell cần nginx.conf riêng

**Vấn đề:** Nginx mặc định listen port 80, nhưng app-shell chạy port 3010 — container start nhưng không accessible.

**Quy tắc:** Luôn tạo `nginx.conf` với `listen <port>;` khi port khác 80, mount vào `/etc/nginx/conf.d/default.conf`. Thêm SPA fallback `try_files $uri $uri/ /index.html;`.

### 15.6 pbc-registry.json — port conflict

**Vấn đề:** pbc-auth API đang dùng port 3001, nhưng pbc-registry.json của app cũng gán port 3001 cho `pbc-student-profile` → conflict khi chạy cùng lúc.

**Quy tắc:** Khi thêm PBC auth vào app, phải remap port các PBC khác:
- `pbc-auth-api`: 3001 (giữ nguyên theo pbc-auth config)
- `pbc-auth-ui`: 3011
- Các PBC nghiệp vụ: 3012, 3013, 3014...

### 15.7 Checklist tích hợp PBC mới vào App

Khi thêm một PBC mới vào App Shell, AI phải thực hiện đủ các bước:

- [ ] Thêm `{ "pbcId": "...", "version": "..." }` vào `app-contract.json.includedPBCs`
- [ ] Thêm entry vào `pbc-registry.json.pbcList` với port không trùng
- [ ] Nếu là auth PBC: thêm route vào `security.publicRoutes`, xử lý riêng trong `main.tsx`
- [ ] Cập nhật `docker-compose.yml` với service mới + volume nếu có DB
- [ ] Cập nhật `security.authPBC` nếu đây là PBC xác thực
- [ ] Kiểm tra port conflict với tất cả PBC đang chạy
- [ ] Verify `pbcId` trong registry khớp với `pbcId` trong `pbc-contract.json` của PBC

### 17.8 vite-env.d.ts bắt buộc (v3.0)

**Vấn đề:** TypeScript báo lỗi `Property 'env' does not exist on type 'ImportMeta'` trong `pbc-loader.ts` và `env.ts` khi dùng `import.meta.env`.

**Quy tắc:** Luôn tạo `app-shell/src/vite-env.d.ts` với đầy đủ các biến môi trường:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAFKA_GATEWAY_URL: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV: "local" | "staging" | "production";
  readonly VITE_TENANT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 17.9 enabledSlots — checklist khi thêm PBC mới (v3.0)

Khi thêm PBC mới vào App Shell theo pattern enabledSlots:

- [ ] Thêm entry vào `app-contract.json.includedPBCs` với `enabledSlots[]`
- [ ] Khai báo đúng `mountPoint` — phải là một trong các mount point chuẩn (xem section 8.5)
- [ ] Thêm literal import vào `remote-imports.ts` cho **mỗi slot** (R-18)
- [ ] Thêm remote vào `vite.config.ts` federation config
- [ ] Thêm entry vào `pbc-registry.json` với đúng `scope` khớp với tên federation
- [ ] **Không sửa Shell.tsx** — MountPoint tự đọc config
