# Checklist review code PBC (sau khi AI generate)

**Đối tượng:** Tài liệu này dùng cho **AI** (hoặc người) sau khi đã sinh source PBC — để **tự kiểm tra** và **sửa code** cho tới khi đạt chuẩn blueprint.

**Nguồn chuẩn duy nhất:** mọi tiêu chí căn theo [PBC-BLUEPRINT.md](./PBC-BLUEPRINT.md). Không lấy thêm spec/repo khác làm chuẩn trong vòng review này.

---

## Quy trình bắt buộc cho AI (lặp tới khi pass)

1. **Đọc** `pbc-contract.json` của PBC (đặc biệt `type`, `pbcId`, `capabilities`, `messaging`) và nếu cần tra cứu chi tiết thì đối chiếu **chỉ** `PBC-BLUEPRINT.md`.
2. **Duyệt lần lượt** các mục §1 → §15: với mỗi mục, xác định mục con **Pass** / **Fail** / **N/A** (N/A phải ghi lý do một dòng, ví dụ `ui-only` không có `openapi.yaml`).
3. **Ghi kết quả ngắn** (trong chat hoặc comment nội bộ): bảng hoặc list các § có Fail + file/dòng hoặc hành vi sai (ví dụ "topic Kafka lệch contract", "thiếu envelope `metadata`").
4. **Sửa code / contract / OpenAPI / AsyncAPI** tối thiểu để khắc phục từng Fail; ưu tiên: đồng bộ contract ↔ OpenAPI/AsyncAPI ↔ implementation, ranh giới PBC (không DB chéo), Flexible Payload, Kafka đúng blueprint.
5. **Chạy lại** bước 2–4 cho tới khi không còn Fail (hoặc chỉ còn N/A có lý do). Cuối cùng điền §16 (có thể ghi `Reviewer: AI`).

**Quy tắc sửa:** Chỉ thay đổi phạm vi cần thiết cho tiêu chí Fail; không refactor rộng không liên quan. Giữ marker `// AI-GENERATED` / `# AI-GENERATED` trên phần đã sửa nếu blueprint yêu cầu dấu vết AI.

**Thứ tự gợi ý:** Làm §1–§2 trước (contract + `type`), sau §3 (kiến trúc/ranh giới), rồi §4–§15 theo phần PBC có (API/UI/DB/event).

---

## §1. `pbc-contract.json` & metadata

- [ ] Có `pbc-contract.json` ở gốc PBC; JSON hợp lệ (**không** có comment `//` trong file thật).
- [ ] Có đủ field bắt buộc: `pbcId`, `version`, `name`, `description`, `category`, `domain`, `type`, `technologies`, `capabilities`, `i18n`.
- [ ] `type` là một trong: `full` | `ui-only` | `api-only` | `event-only`.
- [ ] Nếu `type` do AI suy luận: có `properties.inferredTypeReason` một dòng giải thích lý do.
- [ ] `pbcId` **kebab-case**, không nhân đôi tiền tố `pbc-` (thư mục `pbc-user-management` → `pbcId: "user-management"`).
- [ ] `capabilities.ui.slots` và `slots` top-level (nếu có) **không lệch** nhau — chỉ duy trì một nguồn sự thật.
- [ ] `capabilities.api.supportsMetadata: true` khi API tuân Flexible Payload.
- [ ] `messaging.broker: "kafka"` (mặc định); có `topicPrefix`, `groupId`, `notes` khi cần.
- [ ] `properties.tenantResolution` mô tả cách resolve tenant (jwt-claim / header / subdomain).
- [ ] `properties.requiredEnvVars` liệt kê đủ biến môi trường bắt buộc, khớp `api/.env.example`.
- [ ] `properties.dockerLayout` ghi rõ vị trí Dockerfile/compose nếu không dùng layout mặc định `docker/`.
- [ ] `properties.apiAuthNotes` mô tả route nào public, route nào cần JWT, route nào cần role cụ thể.

---

## §2. Ràng buộc theo `type` (cấu trúc repo)

| Kiểm tra | full | ui-only | api-only | event-only |
|----------|:----:|:-------:|:--------:|:----------:|
| [ ] Có `ui/` khi và chỉ khi type cần UI | ✓ | ✓ | ✗ | ✗ |
| [ ] **Không** có `api/` khi `ui-only` | | ✓ | | |
| [ ] Có `api/` hoặc `worker/` khi `full` / `api-only` / `event-only` | ✓ | | ✓ | ✓ |
| [ ] Có `db/` chỉ khi thực sự có persistence | tùy | ✗ | tùy | tùy |
| [ ] `openapi.yaml` có khi có HTTP nghiệp vụ; **không** có cho `ui-only` | ✓ | ✗ | ✓ | chỉ health |
| [ ] `asyncapi.yaml` có khi có `businessEvents` hoặc `uiInteraction` qua Kafka | nếu có | nếu có | nếu có | ✓ |
| [ ] **Không** có `src/` ở root PBC cùng cấp `api/` / `ui/` (quy tắc 14) | ✓ | ✓ | ✓ | ✓ |

---

## §3. Kiến trúc & ranh giới hệ thống

**Mục tiêu:** PBC đúng tinh thần blueprint — ranh giới nghiệp vụ rõ, giao tiếp chỉ qua **Kafka** hoặc **HTTP theo OpenAPI đã công bố**.

### 3.1. Ranh giới PBC & dữ liệu sở hữu

- [ ] Một `pbcId` gắn với một miền/aggregate chính; không gom nhiều bounded context không liên quan.
- [ ] Bảng/schema trong `db/` chỉ phục vụ nghiệp vụ PBC này — không dùng DB chung với PBC khác.
- [ ] Không JOIN giữa các PBC; không truy cập schema DB ngoài viền PBC (quy tắc 7).

### 3.2. Cấu trúc tầng `api/`

- [ ] Phân tách đúng: `interfaces/` (controller mỏng) → `core/` (domain/service) → `infrastructure/` (persistence, events, hooks).
- [ ] `infrastructure/events/` có Kafka producer/consumer (kafkajs).
- [ ] `infrastructure/hooks/before/` và `hooks/after/` có đủ (validate, enforce-tenant, audit-log, invalidate-cache).
- [ ] `infrastructure/persistence/` có repository implementation.
- [ ] `infrastructure/webhook/` có webhook.service.ts.
- [ ] `config/app.config.ts` có config loader (`registerAs` cho app, kafka, tenant).
- [ ] `interfaces/metadata.helper.ts` có `buildMetadata` helper.

### 3.3. Contract-first

- [ ] `pbc-contract.json` sinh trước; OpenAPI/AsyncAPI đồng bộ contract — code không lệch path/topic/slot đã công bố.
- [ ] Breaking change: tăng version path API (`/v2/...`) hoặc topic version (`v2`) — ghi trong contract và AsyncAPI.

### 3.4. Kafka (AsyncAPI)

- [ ] Topic naming: `pbc.<pbcId>.<domain>.<verb>`, khớp `capabilities.businessEvents`.
- [ ] Consumer groupId khai trong AsyncAPI và `messaging.groupId`.
- [ ] Partition key (tenantId / aggregateId) ghi trong `messaging.notes` khi cần ordering.

### 3.5. Bảo mật & đa tenant

- [ ] Tenant resolution khớp `properties.tenantResolution`; schema-per-tenant hoặc RLS ghi trong contract/migration.
- [ ] Cột `attributes JSON` có JSON Schema validate trong `db/schemas/`.
- [ ] Permissions dạng `<resource>:<action>` trong contract; có kiểm soát runtime tương ứng.

---

## §4. Đặt tên (cross-cutting)

- [ ] `pbcId` **kebab-case**; segment Kafka topic **kebab-case**; segment URL path **kebab-case**.
- [ ] HTTP: base path versioned `/v1/...`; collection danh từ số nhiều; path param **camelCase**; query **camelCase**.
- [ ] OpenAPI `operationId`: **camelCase**, dạng `listUsers`, `getUserById`, `createUser`.
- [ ] Kafka topic: `pbc.<pbcId>.<domain>.<verb>` (chữ thường), khớp AsyncAPI `channels`.
- [ ] Consumer group: `<appId>-<pbcId>-<purpose>`, ghi trong `asyncapi.yaml` và `messaging.notes`.
- [ ] Hook trong contract: **camelCase**, động từ đầu (`validatePayload`, `enforceTenant`, `auditLog`).
- [ ] DB: bảng/cột **snake_case**; cột mở rộng `attributes` (JSON).
- [ ] Permissions: `<resource>:<action>`, chữ thường, resource nhiều từ dùng kebab.
- [ ] Docker/K8s: image/service gắn `pbcId`, service name kebab-case.

---

## §5. `openapi.yaml` (khi có)

- [ ] OpenAPI **3.1**; `info.version` đồng bộ `pbc-contract.json`.
- [ ] Có `servers` (ít nhất một).
- [ ] Mọi request/response body nghiệp vụ dùng envelope **Flexible Payload** `{ data, metadata }`.
- [ ] `metadata` có đủ key chuẩn: `timestamp`, `requestId`, `correlationId`, `traceId`, `tenantId`.
- [ ] Header platform: `X-Tenant-Id`, `X-Correlation-Id`, `X-Request-Id` thống nhất với `metadata`.
- [ ] Có `securitySchemes` (JWT) nếu API có auth; có error responses chuẩn (400, 401, 403, 404, 500).
- [ ] Có examples cho request/response chính.
- [ ] Mọi operation có `security` đều có **guard/middleware tương ứng** trong code.
- [ ] Route public (health, login) được tách biệt rõ ràng, khớp `properties.apiAuthNotes`.

---

## §6. `asyncapi.yaml` & Kafka (khi có)

- [ ] AsyncAPI **2.6**; `info` đồng bộ contract.
- [ ] Server Kafka (`url: kafka:9092`, protocol `kafka`).
- [ ] Mỗi channel = một Kafka topic, khớp `capabilities.businessEvents` / `uiInteraction`.
- [ ] Payload: JSON Schema đủ chi tiết; có headers (`X-Tenant-Id`, `X-Correlation-Id`, `X-Message-Id`, `traceparent`); có ít nhất một example.
- [ ] Producer/consumer ghi rõ; `groupId` / partition key khi dùng.
- [ ] Bindings Kafka: topic, partitions, groupId khi áp dụng.

---

## §7. Triển khai API (runtime)

*(Ví dụ NestJS chỉ là mẫu — stack khác kiểm hành vi tương đương theo quy tắc 13.)*

- [ ] PBC là **service triển khai được** — có `main.ts` + `app.module.ts` (hoặc tương đương), không chỉ là Nest module thư viện (quy tắc 14).
- [ ] Controller/handler nhận-trả đúng envelope `{ data, metadata }` (khớp OpenAPI).
- [ ] Hook pattern: before (validate/transform/tenant) / after (audit/enrich/emit) khi contract khai báo.
- [ ] Không JOIN hoặc truy cập DB/schema của PBC khác; chỉ HTTP/OpenAPI đã công bố hoặc Kafka theo contract.
- [ ] `npm run start` / Docker CMD chạy được API độc lập, không phụ thuộc host không tài liệu.
- [ ] **Health / readiness:** probe DB (nếu có) và Kafka (nếu có messaging); không trả 200 khi dependency bắt buộc down.
- [ ] **JWT guard** trên controller nghiệp vụ khớp OpenAPI; health/public route tách biệt.
- [ ] URL Kafka, DB, JWT secret chỉ từ **env** — không hard-code trong source.
- [ ] Có `api/.env.example` liệt kê đủ biến, khớp `properties.requiredEnvVars`.

---

## §8. `EventPublisher` & Kafka client (quy tắc 22)

- [ ] `onModuleInit` wrap `producer.connect()` trong try/catch — log warning thay vì throw khi Kafka không available.
- [ ] Retry config: `retries: 3, initialRetryTime: 300, factor: 2`.
- [ ] `publish()` catch lỗi và log error thay vì throw — HTTP response không bị block bởi event publish failure.
- [ ] Consumer graceful shutdown: disconnect khi app stop.
- [ ] Idempotency: message có `eventId` / `X-Message-Id`; consumer xử lý idempotent khi cần.
- [ ] `schemaVersion` trong payload; breaking change tăng version topic (`v2`).

---

## §9. UI (khi có `ui/`)

- [ ] Kiến trúc **slot-based**; slot trong code khớp `capabilities.ui.slots` / `manifest.json`.
- [ ] File slot: **PascalCase** + hậu tố `Slot` (ví dụ `MenuSlot.tsx`).
- [ ] Slot là **thin wrapper** — không gọi `axios`/`fetch` thô trực tiếp (quy tắc 16); mọi HTTP call qua `services/pbc-api.ts`.
- [ ] `pbc-api.ts` dùng **named exports** — không dùng namespace object `export const xxxApi = { ... }` (quy tắc 17).
- [ ] `pbc-api.ts` có chữ ký kiểu rõ ràng: `async function request<TResponse, TBody = unknown>(...): Promise<TResponse>` — không để implicit `any` (quy tắc 15).
- [ ] **Design tokens** (`--pbc-...`) được dùng thay vì hard-code màu/spacing.
- [ ] **Event-driven:** emit/listen theo contract (`uiInteraction` / Kafka topic qua kafka-gateway); không hard-code gọi DB PBC khác.
- [ ] i18n: file locale tại `ui/locales/<locale>.json`, khớp `pbc-contract.i18n`.
- [ ] `manifest.json` có: `pbcId`, version, slots, scope, module, requiredEvents, design-tokens.
- [ ] `ui/.env.example` liệt kê đủ biến `VITE_*`; không hard-code URL API hay tenant ID trong source.

---

## §10. Vite config & Module Federation (quy tắc 18, 19, 23)

- [ ] `vite.config.ts`: `shared` là **object** với `singleton: true` và `requiredVersion` — không phải array (quy tắc 18).
  ```typescript
  shared: {
    react: { singleton: true, requiredVersion: "^18.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
  }
  ```
- [ ] `package.json` dùng **pinned versions** (ví dụ `"react": "18.3.1"`) — không dùng range `^` (quy tắc 19).
- [ ] `bootstrap.ts` **không import React** — chỉ re-export `StandaloneApp` + `index.ts` (quy tắc 23).
- [ ] `StandaloneApp.tsx` **không** khai trong `exposes` của `vite.config.ts`.
- [ ] `src/index.ts` chỉ export các slot/component cần expose cho App Shell.
- [ ] `name` trong federation config khớp `scope` trong `pbc-registry.json` (dạng `pbc_<pbcId_snake>`).

---

## §11. Database (khi có `db/`)

- [ ] **Schema per tenant** (hoặc RLS + mô tả trong contract/migration).
- [ ] Migration / entity có cột `attributes JSON` khi blueprint yêu cầu mở rộng.
- [ ] JSON Schema cho `attributes` trong `db/schemas/`.
- [ ] `tenant-init.sql` khớp quy ước đặt tên schema tenant.
- [ ] Seed scripts không hard-code `tenant_id` — dùng `current_setting('app.tenant_id')` hoặc psql param.
- [ ] Bcrypt hash trong seed đã được verify (`node -e "require('bcrypt').compare(...)"` → `true`).
- [ ] Seed dev/local dùng plain SQL (không DO block) để `docker-entrypoint-initdb.d` tự chạy được.

---

## §12. Docker & vận hành local

- [ ] Có **multi-stage** Dockerfile cho UI và API (đúng `properties.dockerLayout`).
- [ ] Compose dev gồm **Kafka** (và kafka-gateway nếu có UI) khi PBC có async.
- [ ] `depends_on` DB/broker dùng `condition: service_healthy` — không chỉ `service_started`.
- [ ] DB có `healthcheck` thực sự (ví dụ `pg_isready`).
- [ ] Dockerfile dùng `npm ci` chỉ khi có `package-lock.json`; nếu không có thì dùng `npm install`.
- [ ] Nginx port: khi UI serve trên port khác 80, có `nginx.conf` riêng với `listen <port>;` và SPA fallback `try_files`.

---

## §13. `extensions/` vs `api/.../hooks`

- [ ] Hook **chạy runtime** nằm dưới `api/infrastructure/hooks/` — không đặt trong `extensions/`.
- [ ] `extensions/hooks/` chỉ template/tài liệu — không giả định tự load trừ khi README ghi rõ có loader.
- [ ] Mọi endpoint khai trong `openapi.yaml` có controller tương ứng được đăng ký trong module (không để route 404 ngầm).

---

## §14. Observability & chất lượng code

- [ ] Log có `requestId` / `correlationId` / `traceId` khớp metadata & header Kafka.
- [ ] **Logging có cấu trúc** (JSON/key-value) — không chỉ `console.log` cho môi trường production.
- [ ] `package.json` khai báo dependency thực tế cho những gì code dùng (`@nestjs/terminus`, `winston`/`pino`…).
- [ ] Có endpoint **health** (và **readiness** nếu K8s); path khớp OpenAPI + Docker/K8s probe.
- [ ] `/metrics` (Prometheus): ghi N/A có lý do nếu platform chưa chuẩn; bắt buộc nếu tổ chức yêu cầu.
- [ ] File/code do AI sinh có marker `// AI-GENERATED` hoặc `# AI-GENERATED`.

---

## §15. Đồng bộ chéo (bắt buộc trước khi merge)

- [ ] Cùng `pbcId` trên: contract, OpenAPI, AsyncAPI, Kafka topic trong code, path `/v1/...`, Docker image name.
- [ ] Mọi endpoint trong OpenAPI có implementation (hoặc stub/TODO có kế hoạch rõ ràng).
- [ ] Mọi channel/topic trong AsyncAPI có publish/subscribe tương ứng trong code.
- [ ] `manifest.json.scope` khớp `pbc-registry.json` scope; `manifest.json.module` khớp exposed module.
- [ ] Topic trong `capabilities.uiInteraction`/`businessEvents` khớp `asyncapi.yaml`.
- [ ] `pbc-contract.json.pbcId` khớp `app-contract.json.includedPBCs[*].pbcId` (nếu đã tích hợp vào App).

---

## §16. Kết luận review

| Mục | Kết quả |
|-----|---------|
| Reviewer (người hoặc AI) | |
| Ngày / phiên bản PBC-BLUEPRINT | |
| `pbcId` / đường dẫn PBC trong repo | |
| **Pass / Pass có điều kiện / Fail** (sau vòng sửa) | |
| Các § đã Fail trước khi sửa (tóm tắt) | |
| Ghi chú còn lại (nợ kỹ thuật có chủ đích) | |

---

*AI: dùng file này như **definition of done** sau generate — không kết thúc phiên nếu §16 vẫn Fail mà chưa sửa hoặc chưa ghi rõ lý do ngoại lệ theo blueprint.*
