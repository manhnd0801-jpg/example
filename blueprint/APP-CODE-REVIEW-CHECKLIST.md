# Checklist review code App (sau khi AI generate)

**Đối tượng:** Tài liệu này dùng cho **AI** (hoặc người) sau khi đã sinh source App Shell + wiring — để **tự kiểm tra** và **sửa code** cho tới khi đạt chuẩn blueprint.

**Nguồn chuẩn duy nhất:** mọi tiêu chí căn theo [APP-BLUEPRINTV2.md](./APP-BLUEPRINTV2.md). Không lấy thêm spec/repo khác làm chuẩn trong vòng review này.

---

## Quy trình bắt buộc cho AI (lặp tới khi pass)

1. **Đọc** `app-manifest.json`, `app-contract.json`, `pbc-registry.json`, `app-wiring.json` trước khi review bất kỳ file code nào.
2. **Duyệt lần lượt** các mục §1 → §12: với mỗi mục, xác định mục con **Pass** / **Fail** / **N/A** (N/A phải ghi lý do một dòng).
3. **Ghi kết quả ngắn**: bảng hoặc list các § có Fail + file/dòng hoặc hành vi sai.
4. **Sửa code / config** tối thiểu để khắc phục từng Fail.
5. **Chạy lại** bước 2–4 cho tới khi không còn Fail. Cuối cùng điền §13.

**Thứ tự gợi ý:** §1 (config files) → §2 (App Shell core) → §3 (event wiring) → §4 (enabledSlots) → §5–§12 (từng layer).

---

## §1. Config files — nguồn sự thật

### 1.1 app-manifest.json

- [ ] Có `appId`, `version`, `name`, `description`.
- [ ] `includedPBCs[]` liệt kê đủ PBC với `id` và `version` semver range.
- [ ] `eventBus.type: "kafka"`, có `brokers`, `clientId`, `groupId`, `gatewayUrl`, `topicPrefix`.
- [ ] `security.authProvider` khớp đúng `id` của auth PBC trong `pbc-registry.json` (không phải tên thư mục).
- [ ] `security.publicRoutes` có `/login` (và các route public khác).
- [ ] `security.tokenStorage: "memory"` — không dùng localStorage.
- [ ] `theme.primaryColor` và `theme.tokenFile` trỏ đúng file tokens.css.
- [ ] `featureFlags` khai báo đủ flag cho các PBC có điều kiện bật/tắt.

### 1.2 app-contract.json

- [ ] `includedPBCs[].pbcId` khớp đúng `id` trong `pbc-registry.json` (R-14).
- [ ] `security.authPBC` khớp đúng `pbcId` của auth PBC — không phải tên thư mục (R-14).
- [ ] `security.publicRoutes` có `/login` và route `/login` có entry trong `pbc-registry.json` (R-15).
- [ ] Mỗi PBC có `enabledSlots[]` khai báo đúng `slotName`, `mountPoint`, `visible`, `order`.
- [ ] `mountPoint` của mỗi slot là một trong các mount point chuẩn: `login-page`, `main-content`, `toolbar`, `modal`, `sidebar-widget`.

### 1.3 pbc-registry.json

- [ ] Mỗi PBC entry có: `id`, `version`, `remoteEntry`, `exposedModule`, `mountPath`, `scope`, `lazy`, `order`.
- [ ] `scope` dạng camelCase (ví dụ `pbcAuthService`) — khớp với `name` trong `vite.config.ts` của PBC.
- [ ] `requiredEvents` và `emittedEvents` khai báo đúng Kafka topic name (dạng `pbc.<pbcId>.<domain>.<verb>`).
- [ ] `environments.local.remoteEntry` trỏ đúng port local của PBC UI.
- [ ] Không có port conflict giữa các PBC (R-15.6).
- [ ] `healthCheck` URL trỏ đúng endpoint health của PBC API.

### 1.4 app-wiring.json

- [ ] Có `version`, `updatedAt`, `metadata.appId`.
- [ ] `nodes[]` liệt kê đủ PBC, mỗi node có `pbcId` khớp `pbc-registry.json`, `ports.emits[]`, `ports.listens[]`.
- [ ] `ports[].topic` khớp đúng Kafka topic trong `asyncapi.yaml` của PBC tương ứng.
- [ ] `edges[]` mỗi edge có `id` duy nhất, `source`, `target`, `enabled`, `autoWired`.
- [ ] `edges[].source.portId` và `target.portId` tồn tại trong `nodes[].ports`.
- [ ] `app-wiring.json` là **nguồn sự thật** — `event-mapping.config.ts` và `topic-registry.ts` là output codegen từ đây, không phải ngược lại (R-19).

---

## §2. App Shell — cấu trúc & build

- [ ] `app-shell/` có `index.html` trỏ vào `src/main.tsx` (R-13).
- [ ] `app-shell/` có `tsconfig.json` (R-13).
- [ ] `app-shell/src/` có `vite-env.d.ts` khai báo `ImportMetaEnv` với đủ biến `VITE_*` (R-16).
- [ ] `app-shell/src/` có `.env.example` liệt kê đủ biến môi trường bắt buộc.
- [ ] Import path từ `app-shell/src/` đến `app-contract.json` / `pbc-registry.json` đúng số cấp `../` (R-11).
  ```
  src/core/     → ../../../app-contract.json   ✅
  src/config/   → ../../../pbc-registry.json   ✅
  src/guards/   → ../../../app-manifest.json   ✅
  ```
- [ ] `vite.config.ts` có Module Federation config với `remotes` cho tất cả PBC trong `pbc-registry.json`.
- [ ] **Không** import `kafkajs` trực tiếp vào bundle Vite — chỉ dùng WebSocket qua `kafka-gateway` (R-12).

---

## §3. App Shell — Core files

### 3.1 event-bus.ts

- [ ] Kết nối Kafka qua `kafka-gateway` WebSocket — không connect trực tiếp broker (R-03a, R-12).
- [ ] Đọc URL từ `ENV.KAFKA_GATEWAY_URL` — không hard-code.
- [ ] Có auto-reconnect khi WebSocket đóng (setTimeout reconnect).
- [ ] Có buffer `pendingPublish` — flush sau khi reconnect.
- [ ] Sau khi reconnect, đăng ký lại tất cả topic đang subscribe.
- [ ] `subscribe()` trả về `{ unsubscribe() }` để cleanup.
- [ ] `publish()` không throw khi chưa connect — buffer message.

### 3.2 event-mapper.ts

- [ ] Không chứa logic nghiệp vụ — chỉ translate/forward event (R-04).
- [ ] Đọc mapping từ `EVENT_MAPPING` trong `event-mapping.config.ts` — không hard-code topic.
- [ ] `initEventMapper()` được gọi trong `main.tsx` sau khi connect event bus.

### 3.3 token-manager.ts

- [ ] Lưu token **in-memory** — không dùng `localStorage` (tránh XSS).
- [ ] `initTokenManager()` subscribe `EVENTS.AUTH.USER_LOGGED_IN` và `EVENTS.AUTH.TOKEN_REFRESHED`.
- [ ] `getSession()` kiểm tra `expiresAt` — trả về `null` nếu hết hạn.
- [ ] `clearSession()` được gọi khi nhận `EVENTS.AUTH.USER_LOGGED_OUT`.

### 3.4 auth-guard.ts

- [ ] `isPublicRoute()` đọc từ `manifest.security.publicRoutes` — không hard-code.
- [ ] `guardRoute()` redirect về `/login` khi chưa auth, `/403` khi thiếu permission.
- [ ] Không chứa logic nghiệp vụ — chỉ kiểm tra session và roles (R-04).

### 3.5 session-context.tsx

- [ ] `SessionProvider` subscribe `EVENTS.AUTH.USER_LOGGED_IN` để cập nhật state.
- [ ] Cleanup subscription trong `useEffect` return.
- [ ] `useSession()` export để PBC dùng qua props — không để PBC import trực tiếp (R-22).

### 3.6 pbc-loader.ts

- [ ] Đọc `remoteEntry` từ `pbc-registry.json` theo `VITE_ENV` (local/staging/production).
- [ ] Kiểm tra `isFeatureEnabled()` trước khi load PBC.
- [ ] Health check trước khi load (optional, graceful nếu fail).
- [ ] Không hard-code URL remote entry.

---

## §4. enabledSlots Pattern (R-17, R-18)

- [ ] `Shell.tsx` **không** hard-code tên slot hay PBC cụ thể — chỉ đặt `<MountPoint id="...">` (R-17).
- [ ] `slot-registry.ts` đọc config từ `app-contract.json.includedPBCs[].enabledSlots`.
- [ ] `getSlotsForMountPoint()` filter đúng theo `mountPoint`, `visible`, `routeMatch`, `requiredRoles`.
- [ ] `MountPoint.tsx` dùng `lazy()` + `Suspense` để load slot.
- [ ] `SlotRenderer` subscribe `triggerEvent` nếu có — set `visible: true` khi nhận event.
- [ ] `remote-imports.ts` có **literal import string** cho **mỗi slot** được khai trong `enabledSlots` (R-18):
  ```typescript
  "pbc_auth/LoginSlot": () => import("pbc_auth/LoginSlot").then(m => m.default ?? m),
  ```
- [ ] Khi thêm PBC mới: chỉ cần cập nhật `app-contract.json` + `remote-imports.ts` + `vite.config.ts` — **không sửa Shell.tsx**.

---

## §5. App Shell — Config files

### 5.1 event-mapping.config.ts

- [ ] Là **output codegen** từ `app-wiring.json.edges[]` — không viết tay (R-19).
- [ ] Mọi event name dùng từ `EVENTS` constants trong `@shared/shared-events` — không dùng chuỗi thô (R-07).
- [ ] Mỗi mapping có `source.pbcId`, `source.event`, `targets[]` với `event` và optional `transform`.
- [ ] `transform` function type-safe — không dùng `any`.

### 5.2 routes.config.ts

- [ ] Sinh tự động từ `pbc-registry.json` — không khai báo thủ công.
- [ ] Mỗi route có `path`, `pbcId`, `permissions`, `lazy`.

### 5.3 feature-flags.ts

- [ ] Đọc flags từ `app-manifest.json.featureFlags` — không hard-code.
- [ ] `isFeatureEnabled()` trả về `true` mặc định nếu PBC không có flag.

### 5.4 env.ts

- [ ] Wrap tất cả `import.meta.env.VITE_*` vào một object `ENV` — không import trực tiếp ở nhiều chỗ.
- [ ] `validateEnv()` kiểm tra biến bắt buộc khi khởi động — throw rõ ràng nếu thiếu.

---

## §6. App Shell — Layout

- [ ] `Shell.tsx` không biết PBC cụ thể — chỉ render `<MountPoint>` và `<Routes>` từ config (R-04, R-17).
- [ ] Route `/login` được xử lý **riêng** trong `main.tsx` — không wrap trong `<Shell>` (bài học 15.3).
- [ ] `DesignTokenProvider` inject CSS variables từ `app-manifest.json.theme` vào `:root`.
- [ ] `Navbar` đọc menu items từ config — không hard-code tên PBC.
- [ ] `window.__PLATFORM__` được gắn trước khi mount bất kỳ PBC nào (R-21):
  ```typescript
  window.__PLATFORM__ = { session: getSession, eventBus: { publish, subscribe } };
  ```

---

## §7. Kafka Gateway

- [ ] `topic-registry.ts` là **output codegen** từ `app-wiring.json.edges[]` — ALLOWED_TOPICS = unique topics từ edges (R-19).
- [ ] Whitelist check trong `ws-handler.ts` — block topic không có trong ALLOWED_TOPICS.
- [ ] Mỗi WebSocket connection có `clientId` riêng (UUID).
- [ ] Consumer cleanup khi WebSocket đóng — không leak consumer.
- [ ] `kafka-client.ts` tự động tạo topic nếu chưa có (dùng Admin API).
- [ ] Retry config: `retries: 5, initialRetryTime: 300`.
- [ ] `KAFKA_BROKERS` đọc từ env — không hard-code.

---

## §8. Shared — shared-events

- [ ] `EVENTS` constants khai báo đủ tất cả event đang dùng trong `app-wiring.json`.
- [ ] Mỗi event có payload type interface tương ứng (ví dụ `EventAuthUserLoggedIn`).
- [ ] Không có chuỗi topic thô trong code App Shell — luôn dùng `EVENTS.DOMAIN.EVENT_NAME`.
- [ ] `event-contracts.ts` có Zod schema cho các event quan trọng (auth, notification).
- [ ] `validateEvent()` helper được dùng khi nhận event từ Kafka (không tin tưởng payload).

---

## §9. Docker & vận hành local

- [ ] `docker-compose.yml` có đủ: Kafka (KRaft), Kafka UI, kafka-gateway, App Shell, tất cả PBC backend.
- [ ] Kafka dùng KRaft mode — không có Zookeeper.
- [ ] `KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: "false"` — để kafka-gateway quản lý topic.
- [ ] `depends_on` dùng `condition: service_healthy` cho tất cả service.
- [ ] Kafka có `healthcheck` thực sự (`kafka-topics.sh --list`).
- [ ] kafka-gateway `depends_on` Kafka với `condition: service_healthy`.
- [ ] App Shell `depends_on` kafka-gateway với `condition: service_healthy`.
- [ ] PBC backend `depends_on` Kafka trực tiếp (không qua gateway) — `KAFKA_BROKERS: "kafka:9092"`.
- [ ] App Shell env: `VITE_KAFKA_GATEWAY_URL: "ws://localhost:4000"` (browser dùng localhost).
- [ ] Port convention: App Shell=3000, kafka-gateway=4000, PBC từ 3001, Kafka=9092, Kafka UI=8080.
- [ ] Không có port conflict giữa các service.

---

## §10. CI/CD — .gitlab-ci.yml

- [ ] Có stage `validate` với lint + type-check + validate-manifests.
- [ ] Có stage `pbc-compatibility-check` verify version PBC trên CDN.
- [ ] Có stage `integration-test` test event flow E2E xuyên PBC.
- [ ] Có stage `notify-pbc-teams` báo khi deploy thành công/thất bại.
- [ ] Deploy production là `when: manual` — không auto-deploy.
- [ ] Image tag dùng `CI_COMMIT_SHA` — không dùng `latest`.

---

## §11. Bảo mật & Platform Contract

- [ ] Token lưu in-memory — không `localStorage`, không `sessionStorage` cho access token (R-08).
- [ ] Auth Guard bảo vệ tất cả route trước khi load PBC (R-08).
- [ ] `window.__PLATFORM__` gắn trước khi mount PBC — PBC marketplace đọc session/eventBus từ đây (R-21).
- [ ] PBC từ marketplace không import từ app-shell hoặc shared package — chỉ nhận props, đọc `window.__PLATFORM__`, dùng CustomEvent (R-22).
- [ ] PBC không override CSS variable ở `:root` — chỉ đọc token từ App Shell (R-10).
- [ ] Mọi secret/URL nhạy cảm chỉ qua biến môi trường — không hard-code trong source.

---

## §12. Đồng bộ chéo (bắt buộc trước khi merge)

- [ ] `app-wiring.json.nodes[].pbcId` khớp `pbc-registry.json.pbcs[].id`.
- [ ] `app-wiring.json.edges[].source/target.portId` tồn tại trong `nodes[].ports`.
- [ ] `event-mapping.config.ts` khớp với `app-wiring.json.edges[]` (enabled edges).
- [ ] `topic-registry.ts` (kafka-gateway) chứa đủ unique topics từ `app-wiring.json.edges[]`.
- [ ] `app-asyncapi.yaml` (nếu có) khớp với `app-wiring.json.edges[]`.
- [ ] `EVENTS` constants trong `shared-events` cover đủ tất cả topic trong `app-wiring.json`.
- [ ] `remote-imports.ts` có literal import cho mỗi slot trong `app-contract.json.includedPBCs[].enabledSlots`.
- [ ] `vite.config.ts` có `remotes` cho mỗi PBC trong `pbc-registry.json`.
- [ ] `app-manifest.json.security.authProvider` khớp `app-contract.json.security.authPBC` khớp `pbc-registry.json.pbcs[].id` của auth PBC.

---

## §13. Kết luận review

| Mục | Kết quả |
|-----|---------|
| Reviewer (người hoặc AI) | |
| Ngày / phiên bản APP-BLUEPRINTV2 | |
| App ID / đường dẫn project | |
| **Pass / Pass có điều kiện / Fail** (sau vòng sửa) | |
| Các § đã Fail trước khi sửa (tóm tắt) | |
| Ghi chú còn lại (nợ kỹ thuật có chủ đích) | |

---

*AI: dùng file này như **definition of done** sau khi generate App Shell — không kết thúc phiên nếu §13 vẫn Fail mà chưa sửa hoặc chưa ghi rõ lý do ngoại lệ theo blueprint.*
