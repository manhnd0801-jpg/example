# Checklist review code PBC (sau khi AI generate)

**Đối tượng:** Tài liệu này dùng cho **AI** (hoặc người) sau khi đã sinh source PBC — để **tự kiểm tra** và **sửa code** cho tới khi đạt chuẩn blueprint.

**Nguồn chuẩn duy nhất:** mọi tiêu chí căn theo [PBC-BLUEPRINT.md](./PBC-BLUEPRINT.md). Không lấy thêm spec/repo khác làm chuẩn trong vòng review này.

### Quy trình bắt buộc cho AI (lặp tới khi pass)

1. **Đọc** `pbc-contract.json` của PBC (đặc biệt `type`, `pbcId`, `capabilities`, `messaging`) và nếu cần tra cứu chi tiết thì đối chiếu **chỉ** `PBC-BLUEPRINT.md`.
2. **Duyệt lần lượt** các mục §1 → §14: với mỗi mục, xác định mục con **Pass** / **Fail** / **N/A** (N/A phải ghi lý do một dòng, ví dụ `ui-only` không có `openapi.yaml`).
3. **Ghi kết quả ngắn** (trong chat hoặc comment nội bộ): bảng hoặc list các § có Fail + file/dòng hoặc hành vi sai (ví dụ “subject NATS lệch contract”, “thiếu envelope `metadata`”).
4. **Sửa code / contract / OpenAPI / AsyncAPI** tối thiểu để khắc phục từng Fail; ưu tiên: đồng bộ contract ↔ OpenAPI/AsyncAPI ↔ implementation, ranh giới PBC (không DB chéo), Flexible Payload, NATS đúng blueprint.
5. **Chạy lại** bước 2–4 cho tới khi không còn Fail (hoặc chỉ còn N/A có lý do). Cuối cùng điền §15 (có thể ghi `Reviewer: AI`).

**Quy tắc sửa:** Chỉ thay đổi phạm vi cần thiết cho tiêu chí Fail; không refactor rộng không liên quan. Giữ marker `// AI-GENERATED` / `# AI-GENERATED` trên phần đã sửa nếu blueprint yêu cầu dấu vết AI.

**Thứ tự gợi ý:** Làm §1–§2 trước (contract + `type`), sau §3 (kiến trúc/ranh giới), rồi §4–§14 theo phần PBC có (API/UI/DB/event).

---

## 1. `pbc-contract.json` & metadata

- [ ] Có `pbc-contract.json` ở gốc PBC; JSON hợp lệ (**không** có comment `//` trong file thật).
- [ ] Có đủ field theo template blueprint (ít nhất: `pbcId`, `version`, `name`, `description`, `category`, `domain`, `type`, `technologies`, `capabilities`, `i18n`… tùy PBC).
- [ ] `type` là một trong: `full` | `ui-only` | `api-only` | `event-only`.
- [ ] Nếu `type` do AI suy luận (user không chỉ định): có `properties.inferredTypeReason` **hoặc** một dòng lý do ở cuối `description`.
- [ ] `pbcId` **kebab-case**, khớp quy ước thư mục (`pbcs/<name>/` → `pbcId` không nhân đôi tiền tố `pbc-`).
- [ ] `capabilities.ui.slots` (và `slots` top-level nếu có) **không lệch** nhau; chỉ nên một nguồn sự thật.
- [ ] `capabilities.api.supportsMetadata` = true khi API tuân Flexible Payload.
- [ ] `properties.tenantResolution` (hoặc tương đương) mô tả cách resolve tenant nếu có đa tenant.
- [ ] `properties.dockerLayout` ghi rõ vị trí Dockerfile/compose nếu layout không mặc định `docker/`.
- [ ] `messaging`: broker mặc định **NATS**; nếu không phải NATS thì có lý do trong contract.

---

## 2. Ràng buộc theo `type` (cấu trúc repo)

| Kiểm tra | full | ui-only | api-only | event-only |
|----------|:----:|:-------:|:--------:|:----------:|
| [ ] Có `ui/` khi và chỉ khi type cần UI | ✓ | ✓ | ✗ | ✗ |
| [ ] **Không** có `api/` (backend PBC) khi `ui-only` | | ✓ | | |
| [ ] Có `api/` hoặc worker tương đương khi `full` / `api-only` / `event-only` | ✓ | | ✓ | ✓ (worker) |
| [ ] Có `db/` chỉ khi thực sự có persistence | tùy | ✗ | tùy | tùy |
| [ ] `openapi.yaml`: có khi có HTTP nghiệp vụ / health đã cam kết; **không** có cho `ui-only` (trừ exception đã ghi contract) | ✓ | ✗* | ✓ | chỉ health nếu có |
| [ ] `asyncapi.yaml`: có khi có `businessEvents` hoặc `uiInteraction` qua bus | nếu có event | nếu UI/event | nếu có event | ✓ |

\*Theo blueprint: `ui-only` không có OpenAPI của riêng PBC.

---

## 3. Kiến trúc & ranh giới hệ thống (theo blueprint)

**Mục tiêu:** Xác minh PBC đúng **tinh thần blueprint**: ranh giới nghiệp vụ, không JOIN / không truy cập DB PBC khác, giao tiếp chỉ qua **Event Bus (NATS)** hoặc **HTTP theo OpenAPI đã công bố** (quy tắc 7); cấu trúc tầng và hợp đồng khớp các mục **CẤU TRÚC THƯ MỤC**, **EVENT BUS: NATS**, **Bảo mật & đa tenant**.

### 3.1. Ranh giới PBC & dữ liệu sở hữu

- [ ] **Phạm vi nghiệp vụ:** Một `pbcId` gắn với một miền/aggregate chính rõ ràng; không gom nhiều bounded context không liên quan vào cùng PBC chỉ vì “tiện code”.
- [ ] **Sở hữu dữ liệu:** Bảng/schema trong `db/` chỉ phục vụ nghiệp vụ PBC này; không dùng DB chung kiểu “mọi PBC đọc cùng bảng core” thay cho gọi API/event.
- [ ] **Không vượt viền:** Không JOIN giữa các PBC; không truy cập schema DB ngoài viền PBC. Chỉ giao tiếp qua **NATS** (theo AsyncAPI/contract) hoặc **HTTP** theo OpenAPI **đã công bố** (BFF / PBC khác) — đúng quy tắc 7 blueprint.

### 3.2. Cấu trúc tầng (theo mục cấu trúc thư mục blueprint)

- [ ] **Tách tầng:** Thư mục `api/` (khi có) phản ánh phân tách blueprint: `interfaces`/controller (mỏng) → `core` (domain/service) → `infrastructure` (persistence, events NATS, hooks) — không gom toàn bộ nghiệp vụ vào một lớp controller duy nhất.
- [ ] **UI:** Slot-based + event-driven (quy tắc 4): không hard-code gọi DB PBC khác; dữ liệu qua HTTP tới BFF/PBC khác (theo OpenAPI họ công bố), NATS (`uiInteraction` / `businessEvents`), hoặc props từ host — khai báo trong `pbc-contract.json` (ví dụ `capabilities.ui.dataSources` hoặc `properties.uiDataBinding` khi `ui-only`).

### 3.3. Contract-first (design-first trong blueprint)

- [ ] **Thứ tự:** `pbc-contract.json` sinh trước; OpenAPI/AsyncAPI đồng bộ contract; code không lệch path/subject/slot đã công bố (mục “Quy tắc chung cho openapi và asyncapi”).
- [ ] **Breaking change:** Tăng version path API (`/v2/...`) hoặc `schemaVersion` / subject `v2` trên NATS — ghi trong contract và file contract API/event, không chỉ sửa code (mục “Sự kiện: idempotency & phiên bản”).

### 3.4. HTTP (OpenAPI) vs NATS (AsyncAPI)

- [ ] **NATS mặc định:** Subject `pbc.<pbcId>...`, queue group / JetStream / durable ghi trong AsyncAPI và `pbc-contract.json` (`messaging`) khi áp dụng (mục EVENT BUS & QUY TẮC ĐẶT TÊN NATS).
- [ ] **Không Kafka mặc định:** Chỉ khi contract ghi đè có lý do kiến trúc (quy tắc 11).
- [ ] **Core vs JetStream:** Chọn đúng mô hình (fire-and-forget vs persist/replay) và mô tả trong contract/AsyncAPI.

### 3.5. Bảo mật & đa tenant (mục blueprint tương ứng)

- [ ] **Tenant resolution:** Ghi trong `properties.tenantResolution` (JWT claim, `X-Tenant-Id`, subdomain…); schema-per-tenant hoặc RLS ghi trong contract/migration khi dùng RLS.
- [ ] **`attributes`:** JSON mở rộng + JSON Schema trong `db/schemas/` khi blueprint yêu cầu; phân loại dữ liệu có thể ghi `properties.dataClassification`.
- [ ] **permissions:** Chuỗi `<resource>:<action>` trong contract; kiểm tra runtime có kiểm soát tương ứng (không chỉ khai báo).

### 3.6. UI trong nền tảng composable (blueprint)

- [ ] **Slot + design tokens + event-driven** (quy tắc 4); đồng bộ `capabilities.ui.slots` / `manifest.json` (mục `manifest.json` & design tokens).
- [ ] **i18n:** Theo `pbc-contract.i18n` và vị trí file locale blueprint (`ui/locales/` hoặc quy ước tương đương trong cùng PBC).

### 3.7. Docker, health, observability (blueprint)

- [ ] **Docker:** Multi-stage cho UI và API khi có UI/API; vị trí file thống nhất với `properties.dockerLayout` và mục Docker blueprint.
- [ ] **Compose local:** Có NATS (và JetStream nếu dùng) khi PBC có async.
- [ ] **API bootstrap & resilience:** Khớp mục *API bootstrap & chạy độc lập* và *Sức bền vận hành & health* (quy tắc 13); chi tiết kỹ thuật kiểm thêm §7, §13.
- [ ] **event-only:** HTTP tối thiểu chỉ health/readiness nếu platform yêu cầu — đã ghi trong contract và OpenAPI chỉ các path đó (mô tả loại `event-only`).

### 3.8. Sự kiện: idempotency & phiên bản

- [ ] Payload/message có thể mang `eventId`, `schemaVersion`, `occurredAt`; consumer idempotent theo `eventId` hoặc `Nats-Msg-Id` (JetStream) khi blueprint yêu cầu độ tin cậy đó.

---

## 4. Đặt tên (cross-cutting)

- [ ] **kebab-case:** `pbcId`, segment path resource, segment subject NATS, tên file `pbc-contract.json` / `openapi.yaml` / `asyncapi.yaml`.
- [ ] **HTTP:** base path versioned `/v1/...`; collection danh từ số nhiều; path param **camelCase** trong OpenAPI; query **camelCase**.
- [ ] **OpenAPI `operationId`:** camelCase, dạng gợi ý `listUsers`, `getUserById`, …
- [ ] **NATS subject:** `pbc.<pbcId>.<domain>.<verb>` (chữ thường, segment `.`), khớp AsyncAPI `channels`.
- [ ] **Queue group:** `q.<pbcId>.<handler>` khi dùng competing consumers.
- [ ] **JetStream** (nếu có): stream / durable theo quy ước blueprint; ghi trong `asyncapi.yaml` và/hoặc `messaging.notes`.
- [ ] **Hook (contract):** camelCase, động từ đầu; file triển khai nhất quán trong PBC.
- [ ] **DB:** bảng/cột **snake_case**; có cột mở rộng `attributes` (JSON) khi blueprint yêu cầu.
- [ ] **permissions:** `<resource>:<action>`, chữ thường, resource nhiều từ dùng kebab.
- [ ] **Docker/K8s:** image/service gắn `pbcId`, service name kebab-case.

---

## 5. `openapi.yaml` (khi có)

- [ ] OpenAPI **3.1**; `info` / `version` đồng bộ contract.
- [ ] Có `servers` (ít nhất một).
- [ ] Mọi request/response body nghiệp vụ dùng envelope **Flexible Payload** `data` + `metadata`.
- [ ] `metadata` có/khớp các key chuẩn gợi ý: `timestamp`, `requestId`, `correlationId`, `traceId`, `tenantId` (theo blueprint).
- [ ] Header platform: `X-Tenant-Id`, `X-Correlation-Id`, `X-Request-Id` thống nhất với `metadata` / code.
- [ ] Có schema/components, error responses, **securitySchemes** nếu JWT; có ví dụ (examples) cho request/response chính.
- [ ] Mọi operation có `security` trong OpenAPI đều có **guard/middleware tương ứng** trong code; route **public** (health, …) khớp mục *Bảo mật API & cấu hình nhạy cảm* (quy tắc 13).
- [ ] **Không** để cả khối controller nghiệp vụ “mở toang” (không guard) trong khi OpenAPI khai JWT — trừ khi có `apiAuthNotes` + OpenAPI phản ánh API công khai có chủ đích.

---

## 6. `asyncapi.yaml` & NATS (khi có)

- [ ] AsyncAPI **2.6**; `info` đồng bộ contract.
- [ ] Server NATS (ví dụ `nats://...`); bindings phù hợp core NATS hoặc JetStream.
- [ ] Mỗi channel = một **subject** khớp `capabilities.businessEvents` / `uiInteraction`.
- [ ] Payload: JSON Schema đủ chi tiết; có headers (tenant, correlation, trace, idempotency nếu áp dụng); có ít nhất một example.
- [ ] Producer/consumer ghi rõ; queue group / durable / stream nếu dùng.
- [ ] **Không** mặc định Kafka trừ khi contract ghi đè có lý do.
- [ ] (Nâng cao — **Pass có điều kiện** nếu chưa làm) Client publish/consume có xử lý lỗi/retry hợp lý hoặc ghi nợ production; circuit breaker khi gọi phụ thuộc hay broker không ổn — theo blueprint mục *Khả năng chịu lỗi khi messaging…*.

---

## 7. Triển khai API (runtime)

*(Các ví dụ NestJS dưới đây chỉ là **mẫu** khi stack là Node/Nest; stack khác kiểm **hành vi tương đương** theo blueprint quy tắc 13.)*

- [ ] PBC **không** chỉ là “Nest module thư viện” (chỉ `modules/...` trong app chung): với `full` / `api-only` phải là **service triển khai được** — có bootstrap + cách chạy/build riêng theo blueprint mục *PBC có api/ là dịch vụ…*; thiếu entry root + Docker/pipeline (khi tổ chức bắt buộc) → **Fail**.
- [ ] Controller/handler nhận-trả đúng envelope `data` + `metadata` (khớp OpenAPI).
- [ ] Hook pattern: before (validate/transform/tenant…) / after (audit/enrich/emit…) nếu contract khai báo.
- [ ] **Không** JOIN hoặc truy cập DB/schema của PBC khác; chỉ HTTP/OpenAPI đã công bố hoặc NATS theo contract.
- [ ] **Bootstrap chạy độc lập** (quy tắc 13): có entry rõ (`main.ts` + `app.module.ts` hoặc tương đương stack); `npm run start` / Docker CMD chạy được API không phụ thuộc host không tài liệu.
- [ ] **Health / readiness:** probe DB (nếu có) và **NATS** (nếu có messaging); không 200 khi dependency bắt buộc down — ví dụ Nest: `@nestjs/terminus` + `HealthController` (hoặc tương đương).
- [ ] **JWT / auth:** Guard (hoặc middleware) trên controller nghiệp vụ khớp OpenAPI; health/public route tách biệt có chủ đích.
- [ ] **Secrets & broker:** URL NATS, DB, JWT secret… chỉ từ **env** / secret store; có **`api/.env.example`** (hoặc root PBC); không hard-code trong source. Broker mặc định **NATS** (quy tắc 11); `properties.requiredEnvVars` khớp `.env.example` nếu dùng.

---

## 8. UI (khi có `ui/`)

- [ ] Kiến trúc **slot-based**; slot trong code khớp `capabilities.ui.slots` / `manifest.json` (nếu có).
- [ ] File slot: **PascalCase** + hậu tố `Slot` (ví dụ `MenuSlot.tsx`).
- [ ] **Design tokens** (`--pbc-...` hoặc `--pbc-<pbcId>-...`) được dùng thay vì hard-code màu/spacing lẻ tẻ.
- [ ] **Event-driven:** emit/listen theo contract (`uiInteraction` / subject NATS); không hard-code kết nối DB PBC khác.
- [ ] i18n: locale theo `pbc-contract.i18n`; file locale đặt đúng quy ước (`ui/locales/` hoặc cấu trúc tương đương đã thống nhất trong PBC).
- [ ] `manifest.json` (nếu có): `pbcId`, version, slots, federation/exposed module, tokens, mapping event ↔ bus (nếu cần).

---

## 9. Database (khi có `db/`)

- [ ] **Schema per tenant** (hoặc RLS + mô tả trong contract/migration nếu platform chọn RLS).
- [ ] Migration / entity có cột **`attributes` JSON** khi blueprint yêu cầu mở rộng.
- [ ] Có JSON Schema cho `attributes` trong `db/schemas/` khi blueprint yêu cầu validate.
- [ ] `tenant-init.sql` hoặc tương đương khớp quy ước đặt tên schema tenant.

---

## 10. `extensions/` vs `api/.../hooks`

- [ ] Hook **chạy runtime** nằm dưới `api/.../hooks` (hoặc tương đương).
- [ ] `extensions/hooks` chỉ template/tài liệu — không giả định tự load trừ khi README của PBC ghi rõ có loader (theo blueprint mục phân biệt `extensions/` và `api/.../hooks`).

---

## 11. Docker & vận hành local

- [ ] Có **multi-stage** Dockerfile cho UI và API khi PBC có UI/API (đúng `properties.dockerLayout` trong contract).
- [ ] Compose dev (nếu có) gồm **NATS** (và JetStream nếu dùng) khi PBC có async.

---

## 12. Chất lượng code & dấu vết AI

- [ ] File/code do AI sinh có marker `// AI-GENERATED` hoặc `# AI-GENERATED` theo quy tắc blueprint (áp dụng thống nhất cho phần generated).

---

## 13. Observability & sự kiện

- [ ] Log/metrics có thể bám `requestId` / `correlationId` / `traceId` khớp metadata & header NATS.
- [ ] **Logging có cấu trúc** (JSON/key-value), không chỉ `console.log` production — ví dụ Node: **Winston** hoặc **Pino** (một chuẩn tổ chức; blueprint mục *Quan sát*).
- [ ] **`package.json` (Nest/Node):** Có dependency thực tế cho những gì code dùng (ví dụ `@nestjs/terminus` nếu dùng Terminus, `winston`/`pino` nếu dùng cho log) — không “code gọi thư viện” mà không khai báo trong PBC.
- [ ] **Health:** Có endpoint live/ready (tên path khớp OpenAPI + probe); **Fail** nếu không có health khi PBC có HTTP theo quy tắc 13.
- [ ] **`/metrics`:** **N/A có lý do** nếu platform chưa chuẩn; nếu tổ chức bắt buộc Prometheus thì phải có (blueprint mục *Quan sát*).
- [ ] Message (nếu có): gợi ý `eventId`, `schemaVersion`, `occurredAt`; consumer xử lý **idempotent** khi có yêu cầu (hoặc `Nats-Msg-Id` với JetStream).

---

## 14. Đồng bộ chéo (bắt buộc trước khi merge)

- [ ] Cùng `pbcId` trên: contract, OpenAPI, AsyncAPI, subject NATS trong code, path `/v1/...`, Docker image name (nếu có).
- [ ] Mọi endpoint trong OpenAPI có implementation (hoặc được ghi rõ stub/TODO có kế hoạch).
- [ ] Mọi channel/subject trong AsyncAPI có publish/subscribe tương ứng trong code (hoặc tài liệu rõ ràng).

---

## 15. Kết luận review

| Mục | Kết quả |
|-----|---------|
| Reviewer (người hoặc AI) | |
| Ngày / phiên bản | |
| `pbcId` / đường dẫn PBC trong repo | |
| **Pass / Pass có điều kiện / Fail** (sau vòng sửa) | |
| Các § đã Fail trước khi sửa (tóm tắt) | |
| Ghi chú còn lại (nợ kỹ thuật có chủ đích) | |

---

*AI: dùng file này như **definition of done** sau generate — không kết thúc phiên nếu §15 vẫn Fail mà chưa sửa hoặc chưa ghi rõ lý do ngoại lệ theo blueprint.*
