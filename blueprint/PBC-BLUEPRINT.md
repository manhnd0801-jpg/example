# VNPT COMPOSABLE PBC BLUEPRINT (AI Generation Template)
Phiên bản: 2.5
Nền tảng: VNPT Composable Platform (AI-First & Cloud Development)

## QUY TẮC BẮT BUỘC AI PHẢI TUÂN THEO (KHÔNG ĐƯỢC VI PHẠM)
1. Đọc TOÀN BỘ blueprint này trước khi generate bất kỳ file nào.
2. Luôn tạo file `pbc-contract.json` ĐẦU TIÊN và phải tuân thủ 100% template; mỗi field trong contract phải có mô tả rõ ràng (trong comment tài liệu kèm theo hoặc trong `_fieldDescriptions` nếu pipeline cho phép — **không** dùng `//` trong file JSON thực tế).
3. Sinh đủ bộ contract theo **mục "RÀNG BUỘC THEO `type`"**:
   - Luôn có `pbc-contract.json`.
   - `openapi.yaml`: **bắt buộc** chỉ khi PBC có HTTP API (`full`, `api-only`). **Không** sinh khi `ui-only` hoặc `event-only` (trừ khi có yêu cầu riêng health/metrics — khi đó ghi rõ trong contract).
   - `asyncapi.yaml`: **bắt buộc** khi PBC tham gia event (`full`, `api-only` có publish/subscribe, `event-only`). **Không** sinh khi không có `businessEvents` và không có `uiInteraction` cross-PBC.
4. UI (nếu có) phải Slot-based + Design Tokens + Event-Driven (UI emit/listen theo contract, không hard-code gọi DB PBC khác).
5. API (nếu có) phải dùng Flexible Payload `{ "data": {}, "metadata": {} }` + Hook Pattern; chuẩn hóa `metadata` theo mục **Ví dụ Flexible Payload** bên dưới.
6. DB (nếu có) phải có cột `attributes JSON` + Isolated Schema per Tenant; chi tiết tenant & bảo mật theo mục **Bảo mật & đa tenant**.
7. Không JOIN giữa các PBC → chỉ giao tiếp qua **Event Bus (NATS)** hoặc HTTP theo OpenAPI **đã công bố** (BFF / PBC khác), không truy cập schema DB ngoài viền PBC.
8. Tất cả code sinh ra phải có comment `// AI-GENERATED` hoặc `# AI-GENERATED`.
9. Hỗ trợ Docker multi-stage build cho UI và API (đường dẫn file có thể theo **mục Docker** — không bắt buộc nằm trong `docker/` nếu monorepo đã chuẩn hóa khác).
10. Phải tuân thủ đúng loại PBC (`type`) và chỉ tạo những thư mục cần thiết. **Nếu người dùng không nêu `type`**, AI **phải tự phân tích** mô tả nghiệp vụ / phạm vi kỹ thuật (có UI riêng không, có REST không, có DB riêng không, có chỉ xử lý message không), chọn **một** giá trị trong `full | ui-only | api-only | event-only`, ghi vào `pbc-contract.json` → `type`, và ghi **một dòng** lý do chọn vào `properties.inferredTypeReason` (hoặc cuối `description` nếu không dùng thêm key). Khi người dùng **đã chỉ định** `type` thì **không** đổi, trừ khi yêu cầu mâu thuẫn rõ ràng — khi đó hỏi lại hoặc ghi cảnh báo trong `properties`.
11. **Messaging mặc định của nền tảng: NATS.** Code và `asyncapi.yaml` phải mô tả subject, consumer group (queue), và tùy chọn JetStream khi cần độ bền; không mặc định Kafka trừ khi `pbc-contract.json` ghi đè có lý do kiến trúc.
12. Tuân thủ **mục QUY TẮC ĐẶT TÊN** cho thư mục gốc, `pbcId`, path HTTP, subject NATS, tên hook, slot, DB, permission, package Docker/K8s — để mọi PBC và công cụ tự động tra cứu thống nhất.
13. PBC có HTTP API (`full`, `api-only`) hoặc HTTP tối thiểu cho health (`event-only` khi có): phải **khởi động độc lập** (entry point rõ ràng), có **health/readiness** kiểm dependency thực (DB, NATS…), **logging** gắn correlation theo mục Quan sát; **bảo vệ** endpoint nghiệp vụ bằng auth khớp OpenAPI (ví dụ JWT Guard); **mọi giá trị nhạy cảm** (URL NATS/DB, secret) chỉ qua **biến môi trường** / secret store — chi tiết mục **API bootstrap**, **Sức bền & quan sát**, **Bảo mật API & cấu hình** bên dưới.
14. **Ranh giới thư mục monorepo (`pbcs/<thư-mục-pbc>/`):** Khi PBC có backend HTTP/worker trong repo này, **mọi** mã runtime backend (Nest module, controller, service, guard, DTO, `main.ts`, `app.module.ts`, health…) **chỉ** nằm trong **`api/`** (ví dụ Nest: `api/src/...`) hoặc trong **`worker/`** (hoặc tên worker đã ghi trong `pbc-contract.properties`) cho `event-only`. **Cấm** tạo **`src/` ở root PBC** cùng cấp với `api/` / `ui/` (ví dụ `pbcs/my-pbc/src/...`) cho backend — đó là anti-pattern (hai cây source, import `../../auth` sai ranh giới, Dockerfile/npm trỏ nhầm). Source UI **chỉ** trong **`ui/src/...`**.
15. **Client HTTP trong UI (TypeScript):** Mọi file gọi REST (`pbc-api.ts`, `api-client.ts`, …) **phải** có chữ ký kiểu rõ ràng: import type/interface từ `ui/src/types/` (hoặc module types đồng bộ OpenAPI) và dùng cho tham số + kiểu trả về; helper `request`/`fetch` nên là **`async function request<TResponse, TBody = unknown>(...): Promise<TResponse>`** (hoặc tương đương). **Cấm** sinh client dạng một khối minify không type, hoặc để `params` / `payload` / kết quả `response.json()` implicit **`any`** khi `strict` bật. **Khuyến nghị:** sinh types từ `openapi.yaml` (ví dụ `openapi-typescript`) rồi map operation → hàm client; ít nhất phải map thủ công tới các interface đã khai trong `ui/src/types/`.

## CÁC LOẠI PBC ĐƯỢC HỖ TRỢ

**Ai xác định `type`?** Đây là **metadata trong `pbc-contract.json`**. Người dùng có thể gửi kèm (`type: ui-only` …) hoặc **không gửi** — trong mọi trường hợp file contract cuối cùng vẫn **bắt buộc** có field `type`. Nếu không được cung cấp, **AI suy luận** theo quy tắc 10 ở trên (và có thể dùng gợi ý suy luận nhanh dưới đây).

**Gợi ý suy luận nhanh (không thay thế judgment):** chỉ UI nhúng shell, không backend trong repo này → `ui-only`; chỉ HTTP service (có/không DB), không module UI PBC này → `api-only`; chỉ consumer/producer NATS, không REST nghiệp vụ → `event-only`; UI + API + persistence trong cùng PBC → `full`.

- **full**: UI + API + DB (khi nghiệp vụ cần persistence trong PBC). Có `openapi.yaml`, `asyncapi.yaml` nếu có API và/hoặc event.
- **ui-only**: Chỉ UI (nhúng vào App Shell / PBC khác). **Không** có `api/`, **không** `openapi.yaml` của riêng PBC này. Dữ liệu qua: HTTP tới PBC/BFF khác (theo contract họ công bố), **NATS** (subscribe/publish theo `uiInteraction` / `businessEvents`), hoặc props từ host — phải ghi rõ trong `pbc-contract.json` (`capabilities.ui.dataSources` hoặc `properties.uiDataBinding`).
- **api-only**: Chỉ backend HTTP + (tuỳ chọn) event. Có `openapi.yaml`; `asyncapi.yaml` nếu có produce/consume.
- **event-only**: Worker xử lý message NATS (JetStream hoặc core NATS tuỳ thiết kế). **Không** có REST nghiệp vụ mặc định; có thể có HTTP tối thiểu cho health/readiness nếu platform yêu cầu — khi đó thêm vào contract và `openapi.yaml` chỉ các path đó. Luôn có `asyncapi.yaml` phản ánh subscribe/publish.

## EVENT BUS: NATS (MẶC ĐỊNH)
- **Subject naming**: khuyến nghị `pbc.<pbcId>.<domain>.<verb>` (ví dụ: `pbc.user-management.user.created`) — thống nhất với `channels` trong AsyncAPI; chi tiết queue group / JetStream xem **QUY TẮC ĐẶT TÊN**.
- **Core NATS**: fire-and-forget, phù hợp thông báo realtime; consumer dùng **queue group** để scale (ghi trong bindings).
- **JetStream**: khi cần persist, replay, at-least-once; ghi rõ stream name, retention, ack policy trong `asyncapi.yaml` / `pbc-contract.properties.messaging`.
- **Headers gợi ý** (map sang AsyncAPI message headers): `X-Tenant-Id`, `X-Correlation-Id` (đồng bộ với `metadata.correlationId`), `Nats-Msg-Id` (idempotency), `traceparent` (W3C) nếu dùng tracing.
- Mọi PBC khác stack vẫn chỉ cần đúng **subject + payload schema** trong AsyncAPI.

## QUY TẮC ĐẶT TÊN (NAMING) — AI BẮT BUỘC THỐNG NHẤT

### Nguyên tắc chung
- **Chữ thường + dấu gạch ngang (kebab-case)** cho: `pbcId`, segment trong subject NATS, segment trong URL path (resource), tên thư mục gốc PBC, tên file contract cố định (`pbc-contract.json`, `openapi.yaml`, `asyncapi.yaml`).
- **snake_case** cho: bảng/cột DB, tên schema DB (nếu dùng quy ước SQL), biến môi trường `PBC_*` (optional).
- **PascalCase** cho: component React/Vue file (ví dụ `MenuSlot.tsx`, `UserForm.tsx`).
- **camelCase** cho: identifier hook trong contract (`validatePayload`), key JSON nghiệp vụ trong `data` (trừ khi API công khai đã chuẩn snake — khi đó ghi rõ trong OpenAPI và giữ nhất quán trong một PBC).
- **Không dùng** khoảng trắng, tiếng Việt có dấu, ký tự đặc biệt trong `pbcId` / subject / path API.

### Thư mục gốc & `pbcId`
- Thư mục repo PBC: `pbc-<domain>-<capability>` (ví dụ `pbc-user-management`). Một hoặc hai hạt `domain-capability`; tránh tên quá dài, trùng từ dự phòng (`test`, `tmp`).
- `pbc-contract.json` → `pbcId`: **kebab-case**, khớp **phần tên sau tiền tố `pbc-`** của thư mục (ví dụ thư mục `pbc-user-management` → `pbcId`: `user-management`). Nếu monorepo đặt dưới `pbcs/<name>/` thì `pbcId` vẫn theo quy tắc trên, không nhân đôi `pbc-` trong `pbcId`.

### HTTP / OpenAPI
- Base path versioned: `/v1/...`, `/v2/...` (chỉ số major trong path trừ khi tổ chức quy định khác).
- Resource collection: **danh từ số nhiều**, kebab-case: `/v1/users`, `/v1/invoice-lines`. Item: `/v1/users/{userId}` — param name **camelCase** trong OpenAPI.
- Query param: **camelCase** (`pageSize`, `sortBy`). Header chuẩn platform: `X-Tenant-Id`, `X-Correlation-Id`, `X-Request-Id` (khớp `metadata`).
- `operationId`: **camelCase**, gợi ý `<verb><Resource>` (`listUsers`, `getUserById`, `createUser`).

### NATS (subject, consumer, JetStream)
- **Subject** (đồng bộ AsyncAPI `channels`): `pbc.<pbcId>.<aggregate|domain>.<event|verb>` toàn chữ thường, segment cách nhau bằng `.`  
  - Ví dụ: `pbc.user-management.user.created`, `pbc.billing.invoice.paid`.  
  - Không đổi ý nghĩa segment; không nhét version vào subject trừ khi breaking change (`...user.v2.created`).
- **Queue group** (competing consumers): `q.<pbcId>.<handler>` (ví dụ `q.user-management.projection`).
- **JetStream stream** (nếu có): `STREAM_<PBCID_SNAKE_UPPER>` hoặc `pbc_<pbcIdNormalized>_main` — trong đó `<pbcIdNormalized>` = `pbcId` đổi `-` → `_` (ví dụ `user-management` → `user_management`). Chọn **một** quy ước trong platform và ghi trong `messaging.notes`; tránh ký tự lạ.
- **Durable consumer** (JetStream): `durable-<pbcId>-<purpose>` (kebab).

### Hook (API runtime)
- Tên hook trong contract: **camelCase**, động từ đầu (`validatePayload`, `enforceTenant`, `auditLog`).
- File triển khai: khớp tên hoặc `kebab-case.ts` tùy ngôn ngữ — **nhất quán trong cùng một PBC**; export map rõ trong README hoặc registry nội bộ.

### Slot & UI
- Tên slot trong contract (`capabilities.ui.slots`): **kebab-case** hoặc **lowercase một từ** (`menu`, `list`, `form`, `detail`) — nhất quán trong một PBC.
- File component slot: `PascalCase` + hậu tố `Slot` (`MenuSlot.tsx`).
- CSS design token: `--pbc-<token>` chung hoặc `--pbc-<pbcId>-<token>` khi cần tránh xung đột nhiều PBC trên cùng shell (`--pbc-primary-color`, `--pbc-user-management-accent`).
- File i18n trong `ui/locales/`: mã locale **chữ thường**, gạch ngang nếu cần (`vi.json`, `en.json`, `pt-br.json`).

### DB
- Schema per tenant: quy ước `tenant_<tenantIdNormalized>` hoặc `t_<shortId>` — ghi trong `tenant-init.sql` / contract `properties`.
- Bảng/cột: **snake_case** (`user_profiles`, `created_at`). Cột mở rộng: `attributes` (JSON).

### Permission
- Chuỗi quyền: `<resource>:<action>`, chữ thường, kebab cho resource nhiều từ (`invoice-line:read`, `user:write`).

### Docker / Helm / K8s (khi sinh kèm)
- Image name / chart: gắn với `pbcId` (ví dụ `registry/pbc-user-management-api:0.1.0`). Service name: **kebab-case**, không trùng từ reserved của cluster.

### Ghi chéo file
- Mọi tên **xuất hiện ở cả** `pbc-contract.json`, `openapi.yaml`, `asyncapi.yaml`, code phải **khớp** (cùng `pbcId`, cùng subject, cùng path đã version).

## RÀNG BUỘC THEO `type` (TÓM TẮT CHO AI)

| type        | `ui/` | `api/` | `db/` | `openapi.yaml`      | `asyncapi.yaml`        |
|------------|-------|--------|-------|---------------------|-------------------------|
| full       | Có    | Có     | Có*   | Có                  | Có nếu có event         |
| ui-only    | Có    | Không  | Không | Không               | Có nếu UI/event bus     |
| api-only   | Không | Có     | Có*   | Có                  | Có nếu có event         |
| event-only | Không | Worker | Có*   | Chỉ health nếu cần  | Có                      |

\*Tạo `db/` chỉ khi PBC thực sự có persistence; `api-only` / `event-only` có thể không có DB.

## CẤU TRÚC THƯ MỤC & MÔ TẢ CHI TIẾT TỪNG FILE

pbc-[domain]-[capability]/                  # Tên thư mục gốc, ví dụ: pbc-user-management
├── pbc-contract.json                       # BẮT BUỘC - File metadata chính, AI sinh đầu tiên
├── openapi.yaml                            # BẮT BUỘC nếu có API HTTP nghiệp vụ hoặc health (theo bảng trên)
├── asyncapi.yaml                           # BẮT BUỘC nếu có event (AsyncAPI 2.6)
│
├── ui/                                     # CHỈ TẠO nếu type = full hoặc ui-only
│   ├── src/
│   │   ├── main.tsx                        # Entry point DUY NHẤT — dùng cho cả standalone (npm run dev) lẫn bootstrap MF
│   │   ├── StandaloneApp.tsx               # Mini shell chỉ dùng khi chạy PBC độc lập; KHÔNG expose qua Module Federation
│   │   ├── index.ts                        # Export các slot/component cho Module Federation (exposes)
│   │   ├── slots/                          # Các placeholder để App Shell inject UI — thin wrapper, không chứa logic UI
│   │   │   ├── MenuSlot.tsx                # Slot Menu
│   │   │   ├── ActionBarSlot.tsx           # Slot Action Bar
│   │   │   ├── ListSlot.tsx                # Slot danh sách
│   │   │   ├── FormSlot.tsx                # Slot form thêm/sửa
│   │   │   └── DetailSlot.tsx              # Slot chi tiết
│   │   ├── components/                     # Component nội bộ - Theo UI Library user chọn
│   │   │   ├── ui/                         # Re-export / thin wrapper từ UI Library (Ant, MUI, Shadcn...)
│   │   │   │   └── index.ts                # Tập trung export để dễ swap UI library sau này
│   │   │   └── business/                   # Business components — chứa logic UI thật, được slot dùng
│   │   │       ├── UserTable.tsx
│   │   │       └── UserForm.tsx
│   │   ├── hooks/
│   │   │   └── event-handlers.ts           # emit/listen event qua window CustomEvent ↔ App Shell ↔ Kafka/NATS
│   │   ├── services/
│   │   │   └── pbc-api.ts                  # HTTP client gọi API PBC — BẮT BUỘC type-safe (quy tắc 15)
│   │   ├── types/
│   │   │   └── index.ts                    # Interface/DTO UI khớp OpenAPI
│   │   ├── locales/                        # vi.json, en.json (theo i18n trong contract)
│   │   └── styles/
│   │       └── design-tokens.css           # CSS Variables (--pbc-primary-color, --pbc-radius…)
│   ├── index.html                          # HTML entry — trỏ vào src/main.tsx
│   ├── manifest.json                       # Xem mục manifest.json
│   ├── .env.example                        # Biến môi trường UI (VITE_*) — không commit .env thật
│   ├── vite.config.ts                      # Module Federation remote config + dev server
│   └── package.json                        # Package cho UI
│
├── api/                                    # CHỈ TẠO nếu type = full hoặc api-only; event-only → thư mục worker tương đương (ví dụ worker/)
│   ├── core/                               # Business Logic cốt lõi (ít thay đổi)
│   │   ├── domain/                         # Domain models, Entity
│   │   ├── service/                        # UseCase, Service, Orchestration
│   │   └── repository/                     # Repository interface
│   ├── infrastructure/
│   │   ├── persistence/                    # Data Access Layer (Repository implement)
│   │   ├── events/                         # NATS publish/subscribe (core hoặc JetStream)
│   │   ├── hooks/
│   │   │   ├── before/                     # Before hooks: validate, transform
│   │   │   └── after/                      # After hooks: enrich, audit, call external
│   │   └── webhook/                        # Configurable webhook
│   ├── interfaces/
│   │   └── v1/                             # REST Controllers (versioned)
│   ├── config/                             # Config loader (đọc pbc-contract.json)
│   ├── main.ts                             # Entry bootstrap (Node/NestJS — khuyến nghị khi technologies.api = nodejs)
│   ├── app.module.ts                       # Root module (NestJS: import module PBC, Config, health, logging…)
│   └── Main.java                           # Hoặc entry tương đương (main.go, Program.cs…) tùy ngôn ngữ / stack
│
├── db/                                     # CHỈ TẠO nếu type = full và cần DB riêng (hoặc api/event có persistence)
│   ├── migrations/                         # Migration scripts
│   ├── schemas/                            # JSON schema cho cột attributes
│   ├── tenant-init.sql                     # Tạo schema riêng cho từng tenant
│   └── seed/                               # Dữ liệu seed (tùy chọn)
│
├── extensions/                             # Vùng mở rộng dạng khai báo/template; dùng để mô tả điểm mở rộng, KHÔNG đặt logic runtime chính của service trong api/
│   ├── hooks/                              # Spec/template hook bổ sung (before/after, validate, transform, audit...); dùng khi cần chuẩn hóa cách "cắm hook" cho nhiều team/tenant
│   ├── webhooks/                           # Template webhook (payload mẫu, mapping, retry/signature policy); dùng khi tích hợp hệ thống ngoài theo mẫu lặp lại
│   ├── slots/                              # Định nghĩa extension slots trung lập (schema, props, contract đầu vào/ra); dùng khi cần plugin/adapter cắm vào mà không phá core
│   └── prompts/                            # Prompt templates cho Agentic AI (generate/review/spec); dùng khi muốn tái sử dụng prompt theo domain và kiểm soát chất lượng đầu ra
│
> Quy tắc nhanh:
> - `api/`: code chạy thật ở runtime (controller/service/repository/worker...).
> - `extensions/`: spec/template/declaration để mở rộng, sinh code, hoặc cấu hình theo chuẩn.
> - Nếu xoá `extensions/` mà service vẫn chạy đúng nghiệp vụ cốt lõi, cấu trúc đang đúng tinh thần blueprint.
> - Nếu xoá mà service không chạy được logic chính, phần đó phải thuộc `api/` thay vì `extensions/`.
>
├── docker/                                 # Khuyến nghị nếu có UI hoặc API (có thể dùng layout thay thế — xem mục Docker)
│   ├── Dockerfile.ui                       # Multi-stage build cho UI
│   ├── Dockerfile.api                      # Multi-stage build cho API
│   ├── .dockerignore                       # Ignore file cho Docker
│   └── docker-compose.yml                  # Chạy local development (UI + API + DB + NATS)
│
├── helm/                                   # TÙY CHỌN — Helm Chart Kubernetes (bắt buộc khi repo là chart độc lập)
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/                          # deployment, service, ingress…
│
├── .gitlab-ci.yml                          # TÙY CHỌN — CI/CD (theo chuẩn tổ chức)
├── README.md                               # Hướng dẫn sử dụng PBC
├── LICENSE
└── .gitignore

*(Không có `src/` ở root PBC cho backend — xem quy tắc 14.)*

### UI standalone & Module Federation (hai mode trong một entry point)

PBC UI có **hai mode hoạt động từ cùng một codebase**:

| Mode | Lệnh | Entry | Mục đích |
|------|------|-------|---------|
| Standalone | `npm run dev` | `index.html` → `src/main.tsx` → `StandaloneApp.tsx` | Chạy/test PBC độc lập, không cần App Shell |
| Remote MF | `npm run build` | `vite.config.ts` → `exposes` → `remoteEntry.js` | App Shell load slot qua Module Federation |

**Quy tắc bắt buộc:**
- `src/main.tsx` là entry point **duy nhất** — không tạo thêm `src/dev/main.tsx` hay folder `dev/` riêng.
- `StandaloneApp.tsx` là mini shell chỉ dùng khi dev độc lập — **không** được khai trong `exposes` của `vite.config.ts`.
- `src/index.ts` chỉ export các slot/component cần expose cho App Shell.
- Mọi biến môi trường UI dùng prefix `VITE_` và khai trong `ui/.env.example`; không hard-code giá trị runtime (tenant ID, API URL, ...) trong source.
- `VITE_DEV_TENANT_ID` trong `.env.example` — dùng khi chạy standalone, đọc qua `import.meta.env.VITE_DEV_TENANT_ID`.

**Cấu trúc `vite.config.ts` chuẩn:**
```typescript
federation({
  name: 'pbc_<pbcId_snake>',   // khớp scope trong pbc-registry.json
  filename: 'remoteEntry.js',
  exposes: {
    './bootstrap': './src/index.ts',
    './XxxSlot':   './src/slots/XxxSlot',
    // StandaloneApp KHÔNG được expose
  },
  shared: ['react', 'react-dom'],  // thêm UI library nếu dùng
})
```

- **Một** service API chạy được → **một** cây mã dưới `api/` (entry + `package.json` trong `api/` hoặc theo `properties.dockerLayout`).

### Ranh giới thư mục khi đặt dưới `pbcs/<tên>/` (tránh lỗi gen phổ biến)

- **Một** service API chạy được → **một** cây mã dưới `api/` (entry + `package.json` trong `api/` hoặc theo `properties.dockerLayout`).
- **Không** thêm song song `pbcs/<pbc>/src/controllers/...` hoặc `pbcs/<pbc>/src/main.ts` cho Nest nếu đã có `pbcs/<pbc>/api/src/...` — gộp mọi thứ vào `api/`.
- UI: mọi `.tsx`/`.ts` ứng dụng nằm trong `ui/`; không nhân đôi “views” legacy ở root (`views/*.jsx`) trừ khi contract/README **cố ý** mô tả layout legacy; mặc định blueprint chỉ `ui/`.

### PBC có `api/` là **dịch vụ (service) triển khai được** — không chỉ “module” thư viện

- **Theo blueprint:** PBC thuộc `full` / `api-only` (và phần HTTP tối thiểu của `event-only`) là **một đơn vị bounded context có thể vận hành riêng**: process HTTP (hoặc worker + health) **có entry point**, **build ra image/binary**, **cấu hình qua env** — tức hành vi giống **microservice / service** trong platform, không phải chỉ gói code để `import` vào một app Nest khác mà **không** có cách `nest start` / `node dist/main` / Docker chạy riêng PBC này.
- **“Giống Module hơn Service”** (chỉ có `api/src/modules/<pbc>/...`, thiếu `main.ts` + root `AppModule` hoặc tương đương, thiếu Dockerfile / compose / pipeline khi tổ chức yêu cầu) = **lệch blueprint** — cần bổ sung bootstrap và lớp triển khai (mục *API bootstrap*, *Docker*, quy tắc 9 & 13).
- **Monorepo:** Cho phép đường dẫn lồng (ví dụ `pbcs/<pbcId>/api/src/main.ts`) miễn **một PBC = một “ranh giới chạy”** rõ: `package.json` / Dockerfile trỏ đúng entry, không ẩn trong app shell chung mà không tài liệu.

### Phân biệt `extensions/` và `api/.../hooks`
- **`api/infrastructure/hooks/`**: hook **chạy thật** trong runtime API (before/after request hoặc use case).
- **`extensions/hooks/`**: tài liệu, template, hoặc artifact để **tùy biến sau** / AI — không giả định được load tự động trừ khi platform có loader riêng (ghi rõ trong README PBC).
- **Controller completeness**: mọi endpoint khai trong `openapi.yaml` và `capabilities.api.endpoints` của `pbc-contract.json` **phải có controller tương ứng** được đăng ký trong module. Sau khi sinh code, AI phải tự kiểm tra: số lượng `@Controller` + route handler phải khớp với số path trong OpenAPI. Thiếu controller = route 404 khi chạy — không phát hiện được lúc build.

### Docker (linh hoạt)
- **Bắt buộc**: multi-stage image cho UI và API khi có UI/API.
- **Đường dẫn**: có thể `docker/Dockerfile.*` hoặc `ui/Dockerfile`, `api/Dockerfile`, `docker-compose.dev.yml` ở root — phải thống nhất trong README và `pbc-contract.properties.dockerLayout`.
- Compose local nên gồm **NATS** (và JetStream nếu dùng) khi PBC có async.
- **`npm ci` yêu cầu `package-lock.json`**. Nếu repo chưa có lockfile, dùng `npm install` trong Dockerfile thay vì `npm ci`; hoặc commit `package-lock.json` vào repo. Không để Dockerfile fail vì thiếu lockfile.
- **Nginx port**: khi UI serve trên port khác 80, phải tạo `nginx.conf` riêng với `listen <port>;` và mount vào `/etc/nginx/conf.d/default.conf`. Không dùng image nginx mặc định mà không cấu hình port.
- **`depends_on` với health check**: API và UI phải `depends_on` DB/broker với `condition: service_healthy`, không chỉ `condition: service_started`. DB phải có `healthcheck` thực sự (ví dụ `pg_isready`).
- **Messaging broker optional trong dev**: khi chạy PBC độc lập không cần broker, tạo `docker-compose.dev.yml` riêng không có Kafka/NATS. Messaging client phải graceful khi broker không available — giới hạn retry (`retries: 3`) và không block `onModuleInit`.

**Mẫu `docker-compose.dev.yml` chuẩn (PBC độc lập, không Kafka):**
```yaml
services:
  pbc-xxx-db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d <dbname>"]
      interval: 5s
      retries: 10
      start_period: 5s

  pbc-xxx-api:
    build: { context: .., dockerfile: docker/Dockerfile.api }
    depends_on:
      pbc-xxx-db:
        condition: service_healthy
    restart: on-failure   # tự restart nếu crash khi DB chưa sẵn sàng

  pbc-xxx-ui:
    build: { context: .., dockerfile: docker/Dockerfile.ui }
    depends_on:
      pbc-xxx-api:
        condition: service_healthy
```

### `manifest.json` (UI)
Tối thiểu nên có: `pbcId`, `version`, danh sách **slots** (id + component entry), **exposedModule** / federation name, tham chiếu `design-tokens.css`, `defaultLocale`, và mapping **event** UI ↔ subject NATS (hoặc tên channel AsyncAPI).

Khuyến nghị chuẩn hóa thêm để tương thích App Blueprint:
- `scope`: tên federation scope (ví dụ `pbc_user_management`) để khớp `pbc-registry.json`.
- `module`: exposed module chính (ví dụ `./bootstrap` hoặc `./wc`) để App Shell load đúng entry.
- `customElementTag`: tên custom element root theo kebab-case (ví dụ `pbc-user-management-root`) để host mount nhất quán.
- `requiredPermissions` (nếu có): danh sách quyền tối thiểu cho UI route/widget.
- `requiredEvents`: subject/channel mà UI cần subscribe để render đúng dữ liệu.

### Đồng bộ `slots` trong `pbc-contract.json`
- **Nguồn sự thật**: `capabilities.ui.slots` (và `capabilities.ui.widgets` nếu cần).
- Trường top-level `slots` (nếu có) phải **trùng** với `capabilities.ui.slots` hoặc bỏ hẳn top-level để tránh lệch — AI chỉ duy trì một danh sách chính.

### Đồng bộ với App Compose (`app-contract.json`, `pbc-registry.json`)
- `pbc-contract.json.pbcId` phải trùng giá trị `app-contract.json.includedPBCs[*].pbcId`.
- `manifest.json.scope` và `manifest.json.module` phải trùng `pbc-registry.json.pbcList[*].scope/module`.
- Nếu UI export Web Component, `manifest.json.customElementTag` phải trùng tag mà App Shell dùng để mount.
- Subject trong `capabilities.uiInteraction`/`businessEvents` phải khớp `asyncapi.yaml` để App Shell map event không lệch.

### Bảo mật & đa tenant
- **Tenant resolution**: JWT claim, header `X-Tenant-Id`, hoặc subdomain — ghi rõ trong `pbc-contract.properties.tenantResolution`.
- **Schema-per-tenant** (như `tenant-init.sql`) là mặc định blueprint; nếu dùng PostgreSQL RLS thì ghi thêm trong contract và migration.
- **`attributes`**: validate bằng JSON Schema trong `db/schemas/`; không chứa dữ liệu nhạy cảm không mã hóa nếu policy tổ chức yêu cầu mã hóa — ghi trong `properties.dataClassification`.
- **Seed scripts (`db/seed/*.sql`) không được hard-code `tenant_id`**. Dùng PostgreSQL session variable `current_setting('app.tenant_id')` hoặc tham số psql `-v tenant_id=...`; throw exception nếu biến chưa được set. Mẫu chuẩn:
  ```sql
  DO $$ DECLARE v_tenant_id TEXT := current_setting('app.tenant_id', true);
  BEGIN
    IF v_tenant_id IS NULL OR v_tenant_id = '' THEN
      RAISE EXCEPTION 'app.tenant_id must be set before running seed';
    END IF;
    INSERT INTO ... (tenant_id) VALUES (v_tenant_id) ON CONFLICT DO NOTHING;
  END $$;
  ```
- **Bcrypt hash trong seed phải được verify** trước khi commit. Sau khi tạo hash, chạy lệnh verify trong cùng runtime: `node -e "require('bcrypt').compare('<password>','<hash>').then(console.log)"` — kết quả phải là `true`. Hash sai sẽ khiến login luôn thất bại mà không có lỗi rõ ràng.
- **Seed cho dev/local** (`db/seed/99_admin_seed.sql` hoặc tương đương): dùng plain SQL (không DO block với session variable) để PostgreSQL `docker-entrypoint-initdb.d` tự chạy được. Mount từng file migration và seed trực tiếp vào `/docker-entrypoint-initdb.d/` — PostgreSQL chỉ chạy file `.sql` ở root thư mục đó, không đệ quy vào subfolder.
- **Multi-tenant onboarding**: mỗi tenant mới chạy `tenant-init.sql` với tenant ID riêng. Tenant ID trong production được inject qua subdomain hoặc JWT claim — không dùng `dev-tenant` hay giá trị cố định nào khác ngoài môi trường dev.

### API bootstrap & chạy độc lập
- **Phạm vi stack:** Yêu cầu trong các mục bootstrap, health, logging, JWT, `.env` là **trung lập ngôn ngữ** — áp dụng cho mọi `technologies.api`. Các ví dụ **`main.ts` / `app.module.ts`**, **Terminus**, **JwtAuthGuard**, **Winston / Pino** chỉ là **minh họa cho Node/NestJS**; stack khác (Spring Boot, Gin/Fiber, FastAPI, …) phải có **phần tử tương đương** đạt cùng mục tiêu.
- Mọi PBC có **`api/`** (hoặc worker có HTTP health) phải có **entry point** chạy được riêng (`npm run start`, `nest start`, Docker CMD, …) — không phụ thuộc “nhúng trong monolith” mà không có cách khởi động rõ.
- **NestJS** (khi chọn stack Node): sinh **`main.ts`** (tạo app, listen port, global prefix nếu platform quy định, ví dụ `/api`) và **`app.module.ts`** (import module feature PBC, `ConfigModule`, module health, logger). Các ngôn ngữ khác: tương đương **một file bootstrap + composition root**.
- **`event-only`**: nếu tách process consumer, có entry worker riêng; HTTP health (nếu có) đăng ký trong module/bootstrap tương ứng — đã khai trong `openapi.yaml` + contract.

### Sức bền vận hành & health (resilience)
- Có endpoint **health** và (khi deploy orchestrator/K8s) **readiness** phản ánh dependency thật: ít nhất **DB** (nếu có), **NATS** (nếu PBC dùng messaging), không trả OK khi dependency bắt buộc đã down.
- **NestJS — ví dụ tham chiếu:** `@nestjs/terminus` + `HealthController` (hoặc tương đương) probe DB / NATS; tách route public health vs route nghiệp vụ có auth nếu platform yêu cầu.
- Mục tiêu: align với OpenAPI path health (nếu có) và với Docker/K8s probe.

### Khả năng chịu lỗi khi messaging & gọi ra ngoài (nâng cao — không bắt buộc mọi PBC)
- **Mặc định blueprint là NATS** (quy tắc 11). Code kiểu **`KafkaService`** chỉ hợp lệ khi contract ghi đè broker; khi đó vẫn áp dụng các nguyên tắc dưới đây cho **client messaging** tương đương.
- **Producer/consumer:** Xem xét **retry có giới hạn** + **backoff**, xử lý lỗi không nuốt im lặng, log kèm `correlationId`; với JetStream/NATS: tận dụng ack/nak và chính sách nền tảng thay vì tự chế vô hạn.
- **Circuit breaker / bulkhead** (ví dụ **opossum**, Resilience4j, Polly…) — **khuyến nghị** khi PBC gọi **HTTP tới dịch vụ phụ thuộc** hoặc broker không ổn định; **không** ép mọi PBC CRUD đơn giản phải có ngay lần đầu gen — ghi **nợ có chủ đích** trong review nếu bỏ qua môi trường production.

### Quan sát (Observability)
- Log có `requestId` / `correlationId` / `traceId` khớp `metadata` OpenAPI và header NATS.
- **Logging có cấu trúc** (JSON hoặc key-value ổn định), phù hợp tích hợp log platform — tránh chỉ `console.log` thuần cho môi trường chạy thật.
- **NestJS / Node — ví dụ tham chiếu:** Winston hoặc **Pino** (chọn **một** chuẩn trong tổ chức); inject correlation id từ header / `metadata`.
- **`package.json` (hoặc tương đương):** Khi triển khai bằng Nest/Node, phải **khai báo dependency** cho các thư viện thực sự dùng cho health và log có cấu trúc (ví dụ `@nestjs/terminus`, `winston` hoặc `pino` + adapter Nest) — không chỉ viết code mượn thư viện global của app khác mà không có trong PBC.
- **Endpoint health:** Có route **live/health** và (nếu cần) **ready** phản ánh probe; path cụ thể (`/health`, `/ready`, `/api/v1/health`…) **đồng bộ** `openapi.yaml` và K8s/Docker probe. **Không** Fail review chỉ vì tên path khác `/health` nếu đã thống nhất trong OpenAPI + contract.
- **`/metrics` (Prometheus hoặc tương đương):** **Khuyến nghị** khi platform chuẩn hóa metrics; **không bắt buộc** mọi PBC nhỏ — nếu chưa có thì ghi `N/A` trong review có lý do (ví dụ “chờ platform `@nestjs/prometheus`”). Khi có, không để lộ dữ liệu nhạy cảm trong label.
- Metrics health cho API/worker; tracing W3C (`traceparent`) khuyến nghị khi platform hỗ trợ (đã gợi ý header NATS).

### Bảo mật API & cấu hình nhạy cảm
- **Không** để **toàn bộ** controller nghiệp vụ **mặc định public** (không guard) trừ khi OpenAPI **cố ý** mô tả API công khai và có lý do trong `properties.apiAuthNotes`. Health/metrics (nếu có) có thể public; CRUD/domain phải có **`security`** trong OpenAPI **và** guard/middleware khớp (Nest: `@UseGuards(JwtAuthGuard)` hoặc global JWT + `@Public()` chỉ cho route được liệt kê).
- OpenAPI khai `securitySchemes` (JWT, …) thì **implementation phải áp guard / middleware tương ứng** lên **controller hoặc route nghiệp vụ** — ví dụ Nest: **`JwtAuthGuard`** + **passport-jwt** (hoặc mech JWT chuẩn tổ chức); stack khác: filter/interceptor tương đương.
- **Không** hard-code trong source: URL **NATS** (`nats://…`), connection DB, mật khẩu, API key, broker bất kỳ — chỉ đọc từ **biến môi trường** (hoặc secret manager). Theo quy tắc 11, **mặc định NATS**; nếu dùng broker khác phải ghi trong `pbc-contract.json` và vẫn đọc qua env.
- Kèm **`api/.env.example`** (hoặc root PBC) liệt kê tên biến **không** giá trị thật; `.env` thật trong `.gitignore`. Có thể ghi danh sách biến bắt buộc trong `pbc-contract.properties.requiredEnvVars` (xem template contract).
- Kèm **`ui/.env.example`** liệt kê các biến `VITE_*` cần thiết cho UI (ví dụ `VITE_AUTH_API_URL`, `VITE_DEV_TENANT_ID`); `.env` thật trong `.gitignore`. Không hard-code URL API hay tenant ID trong source UI.
- **Messaging client phải graceful khi broker không available**: giới hạn retry (ví dụ `retries: 3` với KafkaJS, hoặc `maxReconnectAttempts` với NATS), bắt lỗi trong `onModuleInit` và log warning thay vì throw — API vẫn phải start được khi broker chưa sẵn sàng. Ghi rõ trong README rằng event sẽ bị drop cho đến khi broker available.

### Sự kiện: idempotency & phiên bản
- Message có thể mang `eventId`, `schemaVersion`, `occurredAt`; consumer **idempotent** theo `eventId` hoặc `Nats-Msg-Id` khi JetStream.
- Breaking change payload: tăng `schemaVersion` hoặc subject version (`v2`) — ghi trong AsyncAPI.

### i18n (UI)
- `pbc-contract.i18n` định nghĩa locale; UI đặt file tại `ui/locales/<locale>.json` (hoặc namespace tương đương), import trong shell theo `defaultLocale` / `supportedLocales`.

## TEMPLATE pbc-contract.json (MÔ TẢ FIELD CHO AI — KHÔNG COPY NGUYÊN VĂN LÀM FILE THẬT)

Khối JSON dưới đây dùng **chuỗi mô tả semantics** tại từng field để AI hiểu ý nghĩa và kiểu dữ liệu cần sinh. **File `pbc-contract.json` thực tế phải là JSON hợp lệ**: thay mọi giá trị dạng `"string - …"`, `"number - …"`, `"boolean - …"` bằng giá trị cụ thể đúng kiểu; mảng/object mô tả phải trở thành mảng/object thật. Không dùng comment `//` trong file thật.

```json
{
  "pbcId": "string - ID duy nhất, dạng kebab-case (ví dụ: user-management)",
  "version": "string - Phiên bản semantic (ví dụ: 0.1.0)",
  "name": "string - Tên hiển thị (ví dụ: User Management)",
  "description": "string - Mô tả chi tiết năng lực nghiệp vụ",
  "category": "string - Phân loại (Security, CRM, Finance, HR...)",
  "domain": "string - Domain nghiệp vụ chính",
  "type": "string - full | ui-only | api-only | event-only",

  "sla": {
    "availability": "number - % SLA availability (ví dụ: 99.9)",
    "responseTimeMs": "number - p95/p99 theo chuẩn tổ chức",
    "throughput": "number - req/s hoặc đơn vị đo thống nhất platform"
  },

  "technologies": {
    "ui": "string - react | vue | svelte | null",
    "api": "string - java | nodejs | go | python | null",
    "db": "string - mysql | postgresql | mongodb | null",
    "uiLibrary": "string - ant-design | material-ui | shadcn | chakra | tailwind-only | none",
    "messaging": "string - nats | null (mặc định platform: nats khi có event)"
  },

  "messaging": {
    "broker": "string - nats (hoặc giá trị platform quy định)",
    "jetstream": "boolean - true nếu dùng JetStream persist/replay",
    "subjectPrefix": "string - prefix subject (ví dụ: pbc.<pbcId>)",
    "notes": "string - queue group, durable name, stream name... (ghi chú vận hành)"
  },

  "slots": ["array of string - Danh sách UI slots (đồng bộ với capabilities.ui.slots nếu dùng cả hai)"],

  "hooks": {
    "before": ["array of string - Before hooks (validate, transform, enforceTenant...)"],
    "after": ["array of string - After hooks (audit, enrich, emitDomainEvent...)"]
  },

  "capabilities": {
    "ui": {
      "widgets": ["array of string - Các widget UI"],
      "slots": ["array of string - Các slot UI (nguồn sự thật khuyến nghị)"],
      "designTokens": ["array of string - Tên CSS variables (--pbc-...)"],
      "uiLibrary": "string - trùng technologies.uiLibrary hoặc chi tiết hơn"
    },
    "api": {
      "supportsMetadata": "boolean - luôn true nếu tuân blueprint Flexible Payload",
      "endpoints": ["array of string - Các path chính (vd: /v1/resources)"]
    },
    "uiInteraction": {
      "outputs": ["array of string - Event UI phát ra (tên logical hoặc subject NATS)"],
      "inputs": ["array of string - Event UI lắng nghe"]
    },
    "businessEvents": {
      "produces": ["array of string - Subject/channel NATS publish"],
      "consumes": ["array of string - Subject/channel NATS subscribe"]
    }
  },

  "permissions": ["array of string - Permission dạng resource:action"],

  "properties": {
    "inferredTypeReason": "string - optional - bắt buộc khi type do AI suy luận: một dòng giải thích vì sao chọn full | ui-only | api-only | event-only",
    "tenantResolution": "string - jwt-claim | header | subdomain... (mô tả cách resolve tenant)",
    "dockerLayout": "string - quy ước vị trí Dockerfile / compose",
    "dataClassification": "string - optional - mức phân loại dữ liệu / mã hóa attributes nếu có",
    "requiredEnvVars": ["array of string - optional - tên biến môi trường bắt buộc (ví dụ NATS_URL, DATABASE_URL, JWT_SECRET); khớp api/.env.example"],
    "apiAuthNotes": "string - optional - route public (health) vs JWT; guard global hay per-controller"
  },

  "config": {
    "webhookUrl": "string - URL webhook tùy cấu hình (hoặc rỗng)",
    "aiPromptRegistry": "string - URI registry prompt AI (hoặc rỗng)"
  },

  "i18n": {
    "defaultLocale": "string - ví dụ: vi",
    "supportedLocales": ["array of string - ví dụ: vi, en"]
  },

  "extensions": {
    "supportAIHooks": "boolean",
    "allowCustomSlots": "boolean"
  }
}
```

*Gợi ý: Trường `properties` trong file thật có thể có **thêm** key tùy nghiệp vụ ngoài các ví dụ trên; không bắt buộc giữ đủ mọi key mẫu nếu không dùng. Riêng `inferredTypeReason`: **bắt buộc** khi `type` do AI suy luận (theo quy tắc 10); có thể bỏ khi người dùng đã chỉ định `type` từ đầu.*

## VÍ DỤ FLEXIBLE PAYLOAD (CHUẨN HÓA `metadata`)
Mọi request/response body (OpenAPI) dùng envelope; tối thiểu `metadata` gồm (phần `data` chỉ **minh họa** — thay theo từng endpoint):

```json
{
  "data": {
    "id": "0195f1a2-3c4d-7000-8000-000000000001",
    "email": "user@example.com"
  },
  "metadata": {
    "timestamp": "2026-04-13T10:00:00.000Z",
    "requestId": "req_abc123",
    "correlationId": "corr_xyz789",
    "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "tenantId": "tenant-001"
  }
}
```

Hook `before`: nhận payload đã parse; hook `after`: có thể bổ sung field vào `metadata` (ví dụ `auditRef`) nhưng không phá vỡ các key chuẩn trên.

## HƯỚNG DẪN CHI TIẾT CHO openapi.yaml (OpenAPI 3.1)
AI phải sinh file openapi.yaml theo chuẩn OpenAPI 3.1 với các yêu cầu sau:

- Khi PBC có `ui/` + HTTP: schema/path trong file này là **nguồn sự thật** để UI không rơi vào `any` — áp dụng **quy tắc 15** (types hoặc client sinh từ spec).
- info: title, version, description (lấy từ pbc-contract.json)
- servers: ít nhất 1 server (ví dụ: url: http://localhost:3000)
- paths: liệt kê tất cả endpoint (CRUD + search nếu có)
- Mọi request/response phải dùng Flexible Payload như mục **Ví dụ Flexible Payload**
- Components: schemas (tái sử dụng), responses (có error responses chuẩn), securitySchemes (JWT nếu cần)
- **securitySchemes** (JWT, …) phải có **implementation tương ứng** trên API (Guard/middleware) cho mọi operation được đánh dấu `security` — trừ các path **public** đã cố ý (health, …) theo mục **Bảo mật API & cấu hình nhạy cảm**.
- Tags, summary, description rõ ràng cho từng operation
- Examples cho request và response

## HƯỚNG DẪN CHI TIẾT CHO asyncapi.yaml (AsyncAPI 2.6)
AI phải sinh file asyncapi.yaml theo chuẩn AsyncAPI 2.6 với các yêu cầu sau:

- info: title, version, description (lấy từ pbc-contract.json)
- servers: **NATS** — ví dụ `url: nats://localhost:4222`, mô tả protocol/binding phù hợp spec AsyncAPI NATS (core hoặc JetStream)
- channels: mỗi channel tương ứng **subject** NATS (ví dụ: `pbc.user-management.user.created`) — thống nhất với `businessEvents` / `uiInteraction`
- publish / subscribe operations rõ ràng; consumer ghi **queue group** khi cần competing consumers
- Mỗi message phải có:
  - payload schema chi tiết (JSON Schema)
  - headers (tenant, correlation, trace, idempotency — khớp mục NATS)
  - examples (ít nhất 1 example payload)
- Bindings NATS: subject, (tuỳ chọn) JetStream stream, durable name, ack khi dùng JetStream
- Phải khớp với `capabilities.businessEvents.produces` / `consumes` (và channel UI nếu đi qua bus)

## QUY TẮC CHUNG CHO CẢ HAI FILE openapi.yaml và asyncapi.yaml
- Luôn đồng bộ thông tin với pbc-contract.json (name, version, description, businessEvents, messaging…)
- Sử dụng design-first: contract trước, code sau
- Đảm bảo hai PBC khác tech stack vẫn giao tiếp được qua contract này; **NATS subject + JSON schema** là hợp đồng tối thiểu giữa các dịch vụ
