# VNPT COMPOSABLE PLATFORM — E2E User Flow

**Phiên bản:** 2.0  
**Mục đích:** Mô tả toàn bộ hành trình người dùng khi sử dụng platform Composable.  
**Nguyên tắc cốt lõi:** Mọi thao tác của user đều trigger codegen ngay lập tức — không có bước "Generate" riêng biệt.

---

## Nguyên tắc: Continuous Codegen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   User action  →  Platform cập nhật config  →  Codegen chạy ngay  →  Sync │
│                                                                             │
│   Không có nút "Generate" — mọi thay đổi được phản ánh vào code ngay lập  │
│   tức, giống như cách Figma sync design hay Terraform apply infrastructure │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tổng quan Flow

```
[1. Đăng nhập]
      │
      ▼
[2. Tạo Project]  ──────────────────────────────────────────────────────────────►
      │                                                                          │
      │  Codegen ngay: sinh app-shell/ + kafka-gateway/ + docker-compose.yml    │
      ▼                                                                          │
[3. Kéo PBC vào]  ──────────────────────────────────────────────────────────────►
      │                                                                          │
      │  Codegen ngay: cập nhật routes, registry, compose, topic-registry       │
      │  (PBC nhiều slot: hiện Slot Picker → chọn slot → codegen routes)        │
      ▼                                                                          │
[4. Nối / Sửa Event]  ──────────────────────────────────────────────────────────►
      │                                                                          │
      │  Codegen ngay: cập nhật event-mapping.config.ts, asyncapi.yaml          │
      ▼                                                                          │
[5. Xóa PBC]  ──────────────────────────────────────────────────────────────────►
      │                                                                          │
      │  Codegen ngay: xóa khỏi registry, routes, compose, event mapping        │
      ▼                                                                          │
[6. Deploy]  ◄───────────────────────────────────────────────────────────────────
      │
      │  Code luôn ở trạng thái sẵn sàng deploy
      ▼
  Download ZIP / Push Git / Preview Sandbox
```

---

## GIAI ĐOẠN 1 — Đăng nhập Platform

```
User mở trình duyệt → Platform UI
        │
        ▼
  Nhập credentials (email / password)
        │
        ▼
  Platform xác thực → Cấp JWT token
        │
        ▼
  Vào Dashboard:
  ┌──────────────────────────────────────────────────┐
  │  My Projects  │  PBC Marketplace  │  Settings    │
  └──────────────────────────────────────────────────┘
```

---

## GIAI ĐOẠN 2 — Tạo Project → Codegen ngay

### 2.1 User điền wizard

```
Dashboard → Click "New Project"
        │
        ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  Step 1: Thông tin cơ bản                                    │
  │    - App Name    : "Student Management Portal"               │
  │    - App ID      : "student-management-portal"  (auto-gen)   │
  │    - Domain      : "education"                               │
  │    - Version     : "1.0.0"                                   │
  ├──────────────────────────────────────────────────────────────┤
  │  Step 2: Cấu hình kỹ thuật                                   │
  │    - Framework   : React                                     │
  │    - UI Strategy : Module Federation                         │
  │    - Event Bus   : Kafka                                     │
  ├──────────────────────────────────────────────────────────────┤
  │  Step 3: Theme & i18n                                        │
  │    - Primary Color  : #0d6efd                                │
  │    - Font Family    : Inter, sans-serif                      │
  │    - Default Locale : vi                                     │
  └──────────────────────────────────────────────────────────────┘
        │
        │  Click "Create Project"
        ▼
```

### 2.2 Codegen chạy ngay sau khi tạo project

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CODEGEN — Tạo project rỗng                                             │
  │                                                                         │
  │  Sinh ra toàn bộ skeleton app-shell (chưa có PBC nào):                 │
  │                                                                         │
  │  student-management/                                                    │
  │  ├── app-manifest.json              ← từ wizard (không có includedPBCs) │
  │  ├── pbc-registry.json              ← { "pbcs": [] }                   │
  │  ├── app-contract.json              ← { "includedPBCs": [] }           │
  │  ├── app-wiring.json                ← skeleton rỗng (xem bên dưới)     │
  │  ├── app-asyncapi.yaml              ← skeleton, chưa có channels       │
  │  ├── docker-compose.yml             ← chỉ kafka + kafka-gateway        │
  │  ├── .gitlab-ci.yml                 ← CI/CD pipeline template          │
  │  │                                                                      │
  │  ├── app-shell/                                                         │
  │  │   ├── src/core/                                                      │
  │  │   │   ├── event-bus.ts           ← WebSocket → kafka-gateway         │
  │  │   │   ├── event-mapper.ts        ← EVENT_MAPPING = [] (rỗng)        │
  │  │   │   ├── pbc-loader.ts          ← đọc pbc-registry.json            │
  │  │   │   ├── auth-guard.ts          ← publicRoutes từ manifest         │
  │  │   │   ├── token-manager.ts                                           │
  │  │   │   ├── session-context.tsx                                        │
  │  │   │   ├── slot-registry.ts                                           │
  │  │   │   └── MountPoint.tsx                                             │
  │  │   ├── src/config/                                                    │
  │  │   │   ├── routes.config.ts       ← ROUTES = [] (rỗng)               │
  │  │   │   ├── event-mapping.config.ts ← EVENT_MAPPING = [] (rỗng)       │
  │  │   │   ├── feature-flags.ts                                           │
  │  │   │   └── env.ts                                                     │
  │  │   ├── src/layout/                                                    │
  │  │   │   ├── Shell.tsx              ← render "No PBC loaded" placeholder│
  │  │   │   ├── Navbar.tsx                                                 │
  │  │   │   └── DesignTokenProvider.tsx ← inject theme từ manifest        │
  │  │   ├── index.html                                                     │
  │  │   ├── vite.config.ts             ← Module Federation host (remotes: {})│
  │  │   └── package.json                                                   │
  │  │                                                                      │
  │  └── kafka-gateway/                                                     │
  │      ├── src/topic-registry.ts      ← ALLOWED_TOPICS = [] (rỗng)       │
  │      └── ...                                                            │
  └─────────────────────────────────────────────────────────────────────────┘
```

**`app-wiring.json` skeleton khi tạo project (chưa có PBC):**

```json
{
  "version": "1.0.0",
  "updatedAt": "<timestamp>",
  "metadata": {
    "appId": "student-management-portal",
    "totalNodes": 0,
    "totalEdges": 0,
    "autoWiredEdges": 0
  },
  "nodes": [],
  "edges": []
}
```

> **Tại sao sinh ngay từ đầu?**  
> `app-wiring.json` là nguồn sự thật duy nhất cho event wiring (R-19). Platform UI (tab Wiring) đọc file này ngay khi mở project — nếu file không tồn tại sẽ lỗi. Skeleton rỗng đảm bảo tab Wiring luôn render được canvas trống, sẵn sàng nhận PBC kéo vào.

```
        │
        ▼
  Platform mở Project Canvas — sẵn sàng kéo PBC vào
  Code đã có trong repo, có thể clone và chạy ngay (dù chưa có PBC)
```

---

## GIAI ĐOẠN 3 — Kéo PBC vào → Codegen ngay

### 3.1 User kéo PBC từ Marketplace vào Canvas

```
  PBC Marketplace (sidebar)            Project Canvas
  ┌──────────────────────┐             ┌──────────────────────────────────┐
  │  🔍 Search PBC...    │             │                                  │
  │                      │             │  ┌──────────────┐               │
  │  ▶ pbc-auth          │  ─drag──►   │  │  pbc-auth    │               │
  │  ▶ pbc-student-mgmt  │             │  │  v0.1.0      │               │
  │  ▶ pbc-class-mgmt    │             │  └──────────────┘               │
  │  ...                 │             │                                  │
  └──────────────────────┘             └──────────────────────────────────┘
```

### 3.2 Codegen chạy ngay sau mỗi lần kéo PBC

```
User kéo "pbc-auth" vào canvas
        │
        ▼
  Platform đọc pbc-contract.json của pbc-auth
        │
        ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CODEGEN — Thêm pbc-auth (PBC đầu tiên)                                 │
  │                                                                         │
  │  Cập nhật app-manifest.json:                                            │
  │    includedPBCs: [{ id: "pbc-auth", version: "0.1.0" }]                │
  │                                                                         │
  │  Cập nhật pbc-registry.json:                                            │
  │    pbcs: [{ id: "pbc-auth", mountPath: "/login", scope: "pbcAuth" }]   │
  │                                                                         │
  │  Cập nhật app-contract.json:                                            │
  │    includedPBCs: [{ pbcId: "pbc-auth", version: "0.1.0",               │
  │                     enabledSlots: [{ slotName: "LoginSlot",             │
  │                       mountPoint: "login-page", visible: true }] }]    │
  │                                                                         │
  │  Cập nhật app-wiring.json — thêm node (chưa có edge vì chỉ 1 PBC):    │
  │    {                                                                    │
  │      "metadata": { "totalNodes": 1, "totalEdges": 0, ... },            │
  │      "nodes": [                                                         │
  │        {                                                                │
  │          "pbcId": "pbc-auth",                                           │
  │          "displayName": "Authentication & Authorization",               │
  │          "position": { "x": 400, "y": 200 },                           │
  │          "ports": {                                                     │
  │            "emits": [                                                   │
  │              { "id": "AUTH:USER_LOGGED_IN",  "topic": "pbc.auth.user.logged-in" },│
  │              { "id": "AUTH:USER_LOGGED_OUT", "topic": "pbc.auth.user.logged-out" },│
  │              { "id": "AUTH:USER_CREATED",    "topic": "pbc.auth.user.created" }   │
  │            ],                                                           │
  │            "listens": []                                                │
  │          }                                                              │
  │        }                                                                │
  │      ],                                                                 │
  │      "edges": []   ← rỗng, chưa có PBC nào để nối                     │
  │    }                                                                    │
  │                                                                         │
  │  Regenerate app-shell/src/config/routes.config.ts:                     │
  │    ROUTES = [{ path: "/login", pbcId: "pbc-auth", ... }]               │
  │                                                                         │
  │  Regenerate app-shell/vite.config.ts:                                  │
  │    remotes: { pbcAuth: "http://localhost:3001/remoteEntry.js" }         │
  │                                                                         │
  │  Regenerate kafka-gateway/src/topic-registry.ts:                       │
  │    ALLOWED_TOPICS = [                                                   │
  │      "pbc.auth.user.logged-in",                                         │
  │      "pbc.auth.user.logged-out",                                        │
  │      "pbc.auth.user.created"                                            │
  │    ]                                                                    │
  │                                                                         │
  │  Cập nhật docker-compose.yml:                                           │
  │    + service: pbc-auth-api  (port 3001)                                 │
  │    + service: pbc-auth-db   (postgres)                                  │
  └─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
  Canvas hiển thị card pbc-auth với event produces/consumes
  Tab Wiring hiển thị 1 node, 0 edges — bình thường, chờ PBC tiếp theo
  Code trong repo đã được cập nhật — có thể pull và chạy ngay
```

### 3.3 Xử lý PBC có nhiều Slot

Một PBC có thể expose nhiều slot (ví dụ `pbc-auth` có `LoginSlot`, `RegisterSlot`, `ProfileSlot`, `ForgotPasswordSlot`). Platform xử lý theo flow sau:

```
User kéo "pbc-auth" vào canvas (PBC có nhiều slot)
        │
        ▼
  Platform đọc pbc-contract.json → phát hiện PBC có nhiều slot
        │
        ▼
  Hiển thị Slot Picker dialog:
  ┌──────────────────────────────────────────────────────────────┐
  │  pbc-auth — Chọn slots muốn sử dụng                         │
  │                                                              │
  │  ☑ LoginSlot         → mount tại /login                     │
  │  ☑ RegisterSlot      → mount tại /register                  │
  │  ☐ ProfileSlot       → mount tại /profile  (optional)       │
  │  ☐ ForgotPasswordSlot → mount tại /forgot-password          │
  │                                                              │
  │  💡 Có thể bật/tắt slot bất kỳ lúc nào sau này              │
  │                                                              │
  │  [Xác nhận]                                                  │
  └──────────────────────────────────────────────────────────────┘
        │
        │  User chọn LoginSlot + RegisterSlot → Click "Xác nhận"
        ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CODEGEN — Thêm pbc-auth với 2 slot được enable                        │
  │                                                                         │
  │  Cập nhật app-contract.json:                                            │
  │    includedPBCs: [{                                                     │
  │      pbcId: "pbc-auth",                                                 │
  │      version: "0.1.0",                                                  │
  │      enabledSlots: [                                                    │
  │        { slotName: "LoginSlot",    mountPoint: "login-page",    visible: true },│
  │        { slotName: "RegisterSlot", mountPoint: "register-page", visible: true } │
  │      ]                                                                  │
  │    }]                                                                   │
  │                                                                         │
  │  Regenerate routes.config.ts:                                           │
  │    ROUTES = [                                                           │
  │      { path: "/login",    pbcId: "pbc-auth", slotName: "LoginSlot" },  │
  │      { path: "/register", pbcId: "pbc-auth", slotName: "RegisterSlot" }│
  │    ]                                                                    │
  │                                                                         │
  │  (docker-compose.yml chỉ deploy 1 service pbc-auth-api dù có nhiều slot)│
  └─────────────────────────────────────────────────────────────────────────┘
```

**Canvas hiển thị PBC với slot info:**

```
┌──────────────────────────────────────┐
│  pbc-auth  v0.1.0                    │
│  ──────────────────────────────────  │
│  📌 SLOTS:                           │
│    ✅ LoginSlot    → /login          │
│    ✅ RegisterSlot → /register       │
│    ○  ProfileSlot  (disabled)        │
│    ○  ForgotPasswordSlot (disabled)  │
│                                      │
│  ● EMITS: user.login, user.created   │
│  ○ CONSUMES: (none)                  │
└──────────────────────────────────────┘
```

**Toggle slot bất kỳ lúc nào:**

```
User click vào node pbc-auth → Click "⚙️ Manage Slots"
        │
        ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  pbc-auth — Quản lý Slots                                    │
  │                                                              │
  │  ☑ LoginSlot         → /login                               │
  │  ☑ RegisterSlot      → /register                            │
  │  ☐ ProfileSlot       → /profile  ← User tick vào đây       │
  │  ☐ ForgotPasswordSlot → /forgot-password                    │
  │                                                              │
  │  [💾 Lưu thay đổi]                                           │
  └──────────────────────────────────────────────────────────────┘
        │
        │  User tick ProfileSlot → Click "Lưu thay đổi"
        ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CODEGEN — Enable ProfileSlot                                           │
  │                                                                         │
  │  Cập nhật app-contract.json:                                            │
  │    enabledSlots: thêm { slotName: "ProfileSlot", ... }                 │
  │                                                                         │
  │  Regenerate routes.config.ts:                                           │
  │    ROUTES: thêm { path: "/profile", pbcId: "pbc-auth", slotName: "ProfileSlot" }│
  │                                                                         │
  │  (app-wiring.json KHÔNG thay đổi — slot không ảnh hưởng event wiring) │
  └─────────────────────────────────────────────────────────────────────────┘
```

> **Nguyên tắc thiết kế:**
> - **1 PBC = 1 node trên canvas** — dù có nhiều slot, vẫn chỉ là 1 card
> - **1 PBC = 1 deployment unit** — docker-compose chỉ deploy 1 service dù enable nhiều slot
> - **Slot không ảnh hưởng event wiring** — event thuộc về PBC, không phải slot
> - **app-wiring.json không track slot** — chỉ track node (PBC) và edge (event)
> - **Slot chỉ ảnh hưởng routing** — `routes.config.ts` và `app-contract.json`

### 3.4 Kéo thêm PBC thứ 2 — platform tự detect event connection (AUTO-WIRING)

```
User kéo "pbc-student-mgmt" vào canvas
        │
        ▼
  Platform đọc pbc-contract.json của pbc-student-mgmt
        │
        ▼
  Platform chạy auto-wiring algorithm:
    
    FOR EACH emittedEvent của pbc-student-mgmt:
      FOR EACH PBC đã có trong canvas:
        IF PBC.requiredEvents chứa emittedEvent:
          → Tạo edge: pbc-student-mgmt → PBC
    
    FOR EACH PBC đã có trong canvas:
      FOR EACH emittedEvent của PBC:
        IF pbc-student-mgmt.requiredEvents chứa emittedEvent:
          → Tạo edge: PBC → pbc-student-mgmt
    
    Kết quả:
      ✅ pbc-auth.emits("pbc.auth.user.created")
         ↔ pbc-student-mgmt.listens("pbc.auth.user.created")
         → Auto-create edge!
        │
        ▼
  Hiển thị popup:
  ┌──────────────────────────────────────────────────────────────┐
  │  🔗 Phát hiện 1 kết nối event tự động                        │
  │                                                              │
  │  pbc-auth ──[pbc.auth.user.created]──► pbc-student-mgmt     │
  │  Mục đích: Liên kết tài khoản với hồ sơ sinh viên           │
  │                                                              │
  │  [✅ Chấp nhận]   [✏️ Thêm Transform]   [❌ Bỏ qua]          │
  └──────────────────────────────────────────────────────────────┘
        │
        │  User click "Chấp nhận"
        ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CODEGEN — Thêm pbc-student-mgmt + wire event                           │
  │                                                                         │
  │  Cập nhật app-manifest.json, pbc-registry.json, docker-compose.yml     │
  │                                                                         │
  │  Cập nhật app-wiring.json — thêm node mới + auto-edge:                 │
  │    {                                                                    │
  │      "metadata": { "totalNodes": 2, "totalEdges": 1, "autoWiredEdges": 1 },│
  │      "nodes": [                                                         │
  │        { "pbcId": "pbc-auth", ... },          ← đã có từ trước         │
  │        { "pbcId": "pbc-student-mgmt",                                  │
  │          "position": { "x": 200, "y": 300 },                           │
  │          "ports": { "emits": [...], "listens": [...] } }               │
  │      ],                                                                 │
  │      "edges": [                                                         │
  │        {                                                                │
  │          "id": "edge-001",                                              │
  │          "source": { "pbcId": "pbc-auth", "portId": "AUTH:USER_CREATED" },│
  │          "target": { "pbcId": "pbc-student-mgmt", "portId": "AUTH:USER_CREATED" },│
  │          "transform": null,                                             │
  │          "enabled": true,                                               │
  │          "autoWired": true                                              │
  │        }                                                                │
  │      ]                                                                  │
  │    }                                                                    │
  │                                                                         │
  │  Regenerate app-shell/src/config/routes.config.ts:                     │
  │    ROUTES = [                                                           │
  │      { path: "/login",    pbcId: "pbc-auth" },                         │
  │      { path: "/students", pbcId: "pbc-student-mgmt" }                  │
  │    ]                                                                    │
  │                                                                         │
  │  Regenerate app-shell/src/config/event-mapping.config.ts:              │
  │    (đọc từ app-wiring.json.edges[])                                     │
  │    EVENT_MAPPING = [                                                    │
  │      {                                                                  │
  │        source: { pbcId: "pbc-auth", event: "pbc.auth.user.created" },  │
  │        targets: [{ event: "pbc.student-mgmt.user.link-profile" }]      │
  │      }                                                                  │
  │    ]                                                                    │
  │                                                                         │
  │  Cập nhật app-asyncapi.yaml: thêm channel mới                          │
  │  Cập nhật kafka-gateway/src/topic-registry.ts: thêm topics mới        │
  └─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Canvas sau khi kéo đủ 6 PBC

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐            │
│  │  pbc-auth    │   │ pbc-student-mgmt │   │ pbc-class-mgmt   │            │
│  │ ● PRODUCES:  │   │ ● PRODUCES:      │   │ ● PRODUCES:      │            │
│  │  user.login  │   │  student.created │   │  class.created   │            │
│  │  user.logout │   │  student.updated │   │  student.assign  │            │
│  │  user.created│   │  student.deleted │   │  student.remove  │            │
│  │ ○ CONSUMES:  │   │ ○ CONSUMES:      │   │ ○ CONSUMES:      │            │
│  │  (none)      │   │  student.assign  │   │  student.created │            │
│  │              │   │  user.created    │   │  student.deleted │            │
│  └──────┬───────┘   └────────┬─────────┘   └────────┬─────────┘            │
│         │                    │                       │                      │
│         └──────── event wires (đường kẻ màu) ────────┘                     │
│                                                                             │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐        │
│  │ pbc-course-mgmt  │   │ pbc-subject-mgmt │   │ pbc-notification │        │
│  │ ● PRODUCES:      │   │ ● PRODUCES:      │   │ ● PRODUCES: -    │        │
│  │  course.created  │   │  subject.created │   │ ○ CONSUMES:      │        │
│  │  course.updated  │   │  subject.assign  │   │  ALL events      │        │
│  │ ○ CONSUMES:      │   │ ○ CONSUMES:      │   │  từ mọi PBC      │        │
│  │  subject.assign  │   │  course.created  │   │                  │        │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## GIAI ĐOẠN 4 — Sửa Event Wiring → Codegen ngay

```
User click vào đường kẻ event giữa 2 PBC → mở Event Editor
        │
        ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  EVENT EDITOR                                                │
  │                                                              │
  │  Source : pbc-class-mgmt                                     │
  │  Event  : pbc.class-management.student.assigned-to-class     │
  │  Target : pbc-student-mgmt                                   │
  │                                                              │
  │  Transform payload:                                          │
  │  ┌────────────────────────────────────────────────────────┐  │
  │  │  Input  { classId, studentId, assignedAt }             │  │
  │  │  Output { classId }  → update student.classId          │  │
  │  └────────────────────────────────────────────────────────┘  │
  │                                                              │
  │  [💾 Lưu]                                                    │
  └──────────────────────────────────────────────────────────────┘
        │
        │  User click "Lưu"
        ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CODEGEN — Cập nhật event wiring                                        │
  │                                                                         │
  │  Regenerate app-shell/src/config/event-mapping.config.ts:              │
  │    EVENT_MAPPING = [                                                    │
  │      ...existing mappings...,                                           │
  │      {                                                                  │
  │        source: { pbcId: "pbc-class-mgmt",                              │
  │                  event: "pbc.class-management.student.assigned-to-class" },│
  │        targets: [{                                                      │
  │          event: "pbc.student-mgmt.student.class-updated",              │
  │          transform: (p) => ({ classId: p.classId })                    │
  │        }]                                                               │
  │      }                                                                  │
  │    ]                                                                    │
  │                                                                         │
  │  Cập nhật app-asyncapi.yaml: cập nhật channel + transform spec         │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## GIAI ĐOẠN 5 — Xóa PBC khỏi Project → Codegen ngay

```
User click "..." trên card pbc-course-mgmt → "Remove from project"
        │
        ▼
  Platform kiểm tra dependency:
  ┌──────────────────────────────────────────────────────────────┐
  │  ⚠️  Cảnh báo dependency                                     │
  │                                                              │
  │  pbc-subject-mgmt đang CONSUMES event từ pbc-course-mgmt:   │
  │    - pbc.course-management.course.created                    │
  │                                                              │
  │  Xóa pbc-course-mgmt sẽ:                                     │
  │    ✂️  Xóa 2 event wirings liên quan                         │
  │    ✂️  Xóa route /courses khỏi app-shell                     │
  │    ✂️  Xóa service pbc-course-api khỏi docker-compose        │
  │                                                              │
  │  [Xác nhận xóa]   [Hủy]                                     │
  └──────────────────────────────────────────────────────────────┘
        │
        │  User click "Xác nhận xóa"
        ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CODEGEN — Xóa pbc-course-mgmt                                          │
  │                                                                         │
  │  Cập nhật app-manifest.json:                                            │
  │    includedPBCs: xóa entry pbc-course-mgmt                             │
  │                                                                         │
  │  Cập nhật pbc-registry.json:                                            │
  │    pbcs: xóa entry pbc-course-mgmt                                     │
  │                                                                         │
  │  Regenerate app-shell/src/config/routes.config.ts:                     │
  │    ROUTES: xóa { path: "/courses", pbcId: "pbc-course-mgmt" }          │
  │                                                                         │
  │  Regenerate app-shell/src/config/event-mapping.config.ts:              │
  │    EVENT_MAPPING: xóa tất cả mapping liên quan pbc-course-mgmt         │
  │                                                                         │
  │  Regenerate app-shell/vite.config.ts:                                  │
  │    remotes: xóa pbcCourseMgmt                                           │
  │                                                                         │
  │  Cập nhật kafka-gateway/src/topic-registry.ts:                         │
  │    ALLOWED_TOPICS: xóa topics của pbc-course-mgmt                      │
  │                                                                         │
  │  Cập nhật docker-compose.yml:                                           │
  │    xóa service pbc-course-api + pbc-course-db                          │
  │                                                                         │
  │  Cập nhật app-asyncapi.yaml:                                            │
  │    xóa channels liên quan pbc-course-mgmt                              │
  └─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
  Canvas cập nhật — card pbc-course-mgmt biến mất
  Các đường kẻ event liên quan cũng biến mất
  Code trong repo đã được cập nhật ngay
```

---

## GIAI ĐOẠN 6 — Deploy (bất kỳ lúc nào)

Vì code luôn ở trạng thái sẵn sàng, user có thể deploy bất kỳ lúc nào:

```
  ┌──────────────────────────────────────────────────────────────┐
  │  PROJECT: student-management-portal                          │
  │  Status: ✅ Code up-to-date  │  6 PBCs  │  12 event wirings  │
  │                                                              │
  │  [📥 Download ZIP]                                           │
  │    → Tải về, chạy: docker-compose up -d                     │
  │                                                              │
  │  [🔗 Push to GitLab]                                         │
  │    → .gitlab-ci.yml tự động: build → test → deploy to K8s   │
  │                                                              │
  │  [▶ Preview Sandbox]                                         │
  │    → Chạy thử ngay trên môi trường sandbox của platform     │
  └──────────────────────────────────────────────────────────────┘
```

---

## FLOW TỔNG HỢP — Continuous Codegen

```
                         ┌─────────────────────────────────────────────────┐
                         │              PROJECT CANVAS                      │
                         │                                                  │
  ┌──────────┐           │   ┌──────────┐        ┌──────────┐              │
  │ Tạo      │──codegen─►│   │ pbc-auth │──────► │ pbc-     │              │
  │ Project  │           │   └──────────┘  event │ student  │              │
  └──────────┘           │                wire   └──────────┘              │
                         │                                                  │
  ┌──────────┐           │   ┌──────────┐        ┌──────────┐              │
  │ Kéo PBC  │──codegen─►│   │ pbc-     │──────► │ pbc-     │              │
  │ vào      │           │   │ class    │  event │ notif    │              │
  └──────────┘           │   └──────────┘  wire  └──────────┘              │
                         │                                                  │
  ┌──────────┐           │                                                  │
  │ Sửa      │──codegen─►│   event-mapping.config.ts cập nhật ngay         │
  │ Event    │           │                                                  │
  └──────────┘           │                                                  │
                         │                                                  │
  ┌──────────┐           │                                                  │
  │ Xóa PBC  │──codegen─►│   routes, registry, compose cập nhật ngay       │
  └──────────┘           │                                                  │
                         └──────────────────────────────────────────────────┘
                                              │
                                              │  Code luôn sẵn sàng
                                              ▼
                                    ┌──────────────────┐
                                    │  Download / Git  │
                                    │  Push / Preview  │
                                    └──────────────────┘
```

---

## Bảng: File nào được regenerate theo từng action

| Action | Files được regenerate |
|--------|----------------------|
| Tạo project | `app-manifest.json`, `pbc-registry.json`, `app-contract.json`, **`app-wiring.json` (skeleton rỗng — nodes:[], edges:[])**, `app-asyncapi.yaml`, `docker-compose.yml`, `app-shell/` (toàn bộ skeleton), `kafka-gateway/` |
| Kéo PBC vào (PBC đầu tiên) | `app-manifest.json`, `pbc-registry.json`, `app-contract.json`, **`app-wiring.json` (thêm node, edges vẫn rỗng)**, `routes.config.ts`, `vite.config.ts`, `topic-registry.ts`, `docker-compose.yml` |
| Kéo PBC vào (PBC thứ 2+, có auto-wire) | Tất cả file trên + **`app-wiring.json` (thêm node + auto-edges)** → `event-mapping.config.ts`, `app-asyncapi.yaml` |
| Confirm auto-wire / kéo dây thủ công | **`app-wiring.json` (thêm edge)** → `event-mapping.config.ts`, `app-asyncapi.yaml`, `topic-registry.ts` |
| Sửa event transform | **`app-wiring.json` (cập nhật edge.transform)** → `event-mapping.config.ts`, `app-asyncapi.yaml` |
| Toggle enable/disable edge | **`app-wiring.json` (cập nhật edge.enabled)** → `event-mapping.config.ts` |
| Kéo node trên canvas | **`app-wiring.json` (cập nhật node.position)** — không trigger codegen khác |
| **Enable slot** | `app-contract.json` (thêm vào `enabledSlots`), `routes.config.ts` (thêm route) |
| **Disable slot** | `app-contract.json` (xóa khỏi `enabledSlots`), `routes.config.ts` (xóa route) |
| **Đổi mountPath của slot** | `app-contract.json`, `routes.config.ts`, `pbc-registry.json` |
| Xóa PBC | **`app-wiring.json` (xóa node + edges liên quan)**, tất cả file trên (xóa phần liên quan) |
| Sửa theme / i18n | `DesignTokenProvider.tsx`, `app-manifest.json` |
| Sửa security config | `auth-guard.ts`, `app-manifest.json` |

---

## Nguồn sự thật — Quan hệ giữa các file

```
                    ┌─────────────────────────────────────────────────────┐
                    │              PLATFORM UI (Tab Wiring)               │
                    │                                                     │
                    │  User kéo dây / ngắt dây / sửa transform           │
                    └──────────────────────┬──────────────────────────────┘
                                           │ READ / WRITE
                                           ▼
                    ┌─────────────────────────────────────────────────────┐
                    │              app-wiring.json                        │
                    │  (NGUỒN SỰ THẬT — user chỉnh qua UI)               │
                    │                                                     │
                    │  nodes[]: PBC cards + vị trí x,y trên canvas       │
                    │  edges[]: kết nối + transform + enabled/autoWired   │
                    └──────────────────────┬──────────────────────────────┘
                                           │ CODEGEN (output)
                          ┌────────────────┼────────────────┐
                          ▼                ▼                ▼
              event-mapping.config.ts  app-asyncapi.yaml  topic-registry.ts
              (app-shell runtime)      (documentation)    (kafka-gateway)
```

---

## Ghi chú thiết kế Codegen Engine

### 3 lớp sinh code

| Lớp | Cơ chế | Trigger | Ví dụ file |
|-----|--------|---------|------------|
| Static | Template engine (Handlebars / EJS) | Tạo project | `index.html`, `tsconfig.json`, `package.json` |
| Config-driven | Đọc manifest + registry → render | Mọi action | `routes.config.ts`, `docker-compose.yml`, `topic-registry.ts`, `vite.config.ts` |
| Smart | Blueprint rules + AI (LLM) | Tạo project + thêm PBC | `Shell.tsx`, `event-bus.ts`, `auth-guard.ts`, `MountPoint.tsx` |

### Quy tắc validate trước khi codegen

Platform phải kiểm tra trước khi sinh code:

- `includedPBCs[*].id` trong `app-manifest.json` phải khớp `pbcs[*].id` trong `pbc-registry.json`
- `security.authPBC` phải là `id` có trong `includedPBCs`
- Topic trong `app-asyncapi.yaml` phải khớp topic đã khai trong `asyncapi.yaml` của từng PBC
- Port trong `docker-compose.yml` phải khớp `remoteEntry` URL trong `pbc-registry.json`
- `pbc-registry.json.pbcs[*].scope` phải khớp `name` trong `vite.config.ts` của PBC

### Xử lý breaking changes khi update version PBC

```
User thay đổi version PBC trong registry
        │
        ▼
  Platform kiểm tra field "breaking" trong pbc-contract.json
        │
        ├─ breaking: false → codegen ngay, không cần confirm
        │
        └─ breaking: true  → hiển thị cảnh báo trước khi codegen:
             ⚠️ "pbc-notification v3.0 có breaking change:
                 payload auth.user.loggedIn đổi format.
                 Cần cập nhật transform trong Event Wiring."
             [Xem diff]  [Cập nhật transform rồi codegen]  [Hủy]
```
