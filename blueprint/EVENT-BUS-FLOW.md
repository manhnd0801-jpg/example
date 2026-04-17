# VNPT COMPOSABLE PLATFORM — Event Bus Flow

**Phiên bản:** 1.0  
**Mục đích:** Mô tả 4 pattern giao tiếp event trong platform Composable.  
**Phạm vi:** Áp dụng cho mọi App được compose từ PBC — không phụ thuộc domain nghiệp vụ cụ thể.

---

## Tổng quan kiến trúc

Platform có **2 transport layer** phục vụ các hướng giao tiếp khác nhau:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRANSPORT 1: window.CustomEvent                                            │
│  Phạm vi: Trong cùng browser tab                                            │
│  Dùng cho: UI → UI (cùng tab, không qua mạng)                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  TRANSPORT 2: Kafka                                                         │
│  Phạm vi: Toàn hệ thống (cross-service, cross-tab, cross-instance)         │
│  Dùng cho: UI → Backend, Backend → Backend, Backend → UI                   │
│  Browser không connect Kafka trực tiếp — phải qua kafka-gateway (R-03a)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
  PBC UI A          PBC UI B          App Shell
  ────────          ────────          ─────────────────────────────────────
     │                 │              event-mapper.ts   event-bus.ts
     │                 │                    │                │
     │──CustomEvent──►│                    │                │
     │                 │                    │                │
     │──CustomEvent──────────────────────►│                │
     │                 │                    │──publish()───►│──WebSocket──►
     │                 │                    │                │
     │◄────────────────────────────────────│◄─subscribe()──│◄─WebSocket──
     │                 │                    │                │
                                                             │
                                                    ws://kafka-gateway:4000
                                                             │
                                                      Kafka Broker
                                                             │
                                              ┌──────────────┴──────────────┐
                                              │                             │
                                        PBC Backend A              PBC Backend B
                                        (producer)                 (consumer)
```

---

## PATTERN 1 — UI → UI

**Khi nào dùng:** Một PBC UI cần thông báo trạng thái cho App Shell hoặc PBC UI khác trong cùng tab — không cần persist, không cần backend biết.

**Cơ chế:** `window.CustomEvent` — zero latency, không qua mạng.

```
PBC UI (ví dụ: LoginSlot)
        │
        │  window.dispatchEvent(
        │    new CustomEvent('pbc-event', {
        │      detail: { topic: 'pbc.<pbcId>.<event>', payload: {...} }
        │    })
        │  )
        │
        ▼
window (shared giữa App Shell + tất cả PBC UI trong cùng tab)
        │
        │  App Shell lắng nghe:
        │  window.addEventListener('pbc-event', handler)
        │
        ▼
event-mapper.ts (App Shell)
        │
        ├─ Xử lý event → cập nhật UI state
        │   ví dụ: sessionStorage, window.dispatchEvent('shell:user-changed')
        │
        └─ Forward lên Kafka nếu cần (→ Pattern 2)
```

**Ví dụ thực tế:**

| PBC phát | Event | App Shell xử lý |
|---|---|---|
| pbc-auth (LoginSlot) | `pbc.auth.user.logged-in` | Cập nhật Navbar, lưu session |
| pbc-auth (ProfileSlot) | `pbc.auth.user.logged-out` | Xóa session, redirect `/login` |
| pbc-student (ListSlot) | `pbc.student.student.selected` | Highlight row, trigger prefill |

**Quy tắc:**
- PBC UI **không** gọi `window.addEventListener` trực tiếp để lắng nghe event của PBC khác — chỉ App Shell làm điều này.
- PBC UI chỉ **emit** qua `window.dispatchEvent('pbc-event', ...)` và **nhận** qua `window.addEventListener('shell:*', ...)` (event từ App Shell xuống).
- Không dùng CustomEvent cho data lớn hoặc cần delivery guarantee.

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  LUỒNG UI → UI                                                          │
  │                                                                         │
  │  PBC UI A                App Shell               PBC UI B               │
  │  ──────────              ──────────              ──────────             │
  │  dispatchEvent           addEventListener         addEventListener       │
  │  ('pbc-event')  ──────►  ('pbc-event')           ('shell:xyz')         │
  │                           │                            ▲                │
  │                           │  xử lý + re-dispatch       │                │
  │                           └──── dispatchEvent ─────────┘                │
  │                                 ('shell:xyz')                           │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## PATTERN 2 — UI → Backend

**Khi nào dùng:** PBC UI phát event cần backend của PBC khác xử lý — persist data, trigger side-effect, notify service khác.

**Cơ chế:** CustomEvent → App Shell → WebSocket → kafka-gateway → Kafka → PBC Backend Consumer.

```
PBC UI
        │
        │  window.dispatchEvent('pbc-event', { topic, payload })
        ▼
App Shell — event-mapper.ts
        │
        │  publish(topic, payload)          ← gọi event-bus.ts
        ▼
event-bus.ts (App Shell)
        │
        │  WebSocket message:
        │  { type: "publish", topic: "...", payload: {...} }
        ▼
kafka-gateway (Node.js — WebSocket Server)
        │
        │  Kiểm tra topic có trong ALLOWED_TOPICS không
        │  → Nếu không: drop, log warning
        │  → Nếu có: producer.send()
        ▼
Kafka Broker (topic: pbc.<pbcId>.<domain>.<verb>)
        │
        │  consumer group: <appId>-<pbcId>-consumers
        ▼
PBC Backend — EventConsumer (NestJS OnModuleInit)
        │
        │  Deserialize envelope:
        │  { eventId, eventType, schemaVersion, occurredAt,
        │    tenantId, correlationId, data: {...} }
        │
        └─ Xử lý nghiệp vụ (persist, call service, ...)
```

**Envelope chuẩn (backend nhận):**

```json
{
  "eventId": "uuid-v4",
  "eventType": "pbc.auth.user.created",
  "schemaVersion": "1.0",
  "occurredAt": "2026-04-17T10:00:00.000Z",
  "tenantId": "tenant-abc",
  "correlationId": "uuid-v4",
  "data": {
    "userId": "...",
    "email": "..."
  }
}
```

**Lưu ý quan trọng:**
- kafka-gateway là **whitelist gateway** — chỉ topic có trong `topic-registry.ts` mới được phép publish. Topic này được **codegen từ `app-wiring.json`**.
- Browser không bao giờ connect Kafka trực tiếp (KafkaJS không chạy trong browser).
- Nếu WebSocket chưa connect, `event-bus.ts` buffer message trong `pendingPublish[]` và flush sau khi reconnect.

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  LUỒNG UI → BACKEND                                                     │
  │                                                                         │
  │  PBC UI        App Shell       kafka-gateway      Kafka    PBC Backend  │
  │  ──────        ─────────       ─────────────      ─────    ───────────  │
  │  dispatch  ──► event-mapper                                             │
  │                │                                                        │
  │                publish()  ───► ws.send()                               │
  │                                │                                        │
  │                                whitelist check                          │
  │                                │                                        │
  │                                producer.send() ──► topic ──► consumer  │
  │                                                              │          │
  │                                                              handleEvent│
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## PATTERN 3 — Backend → Backend

**Khi nào dùng:** PBC Backend hoàn thành một nghiệp vụ và cần thông báo cho PBC Backend khác — không liên quan đến UI, không qua browser.

**Cơ chế:** PBC Backend → KafkaJS Producer (trực tiếp) → Kafka → PBC Backend Consumer (trực tiếp).

**Không đi qua kafka-gateway** — gateway chỉ dành cho browser.

```
PBC Backend A — Service Layer
        │
        │  Hoàn thành nghiệp vụ (ví dụ: tạo user thành công)
        ▼
EventPublisher.publish(topic, data, tenantId, correlationId)
        │
        │  Wrap thành envelope chuẩn
        │  producer.send({ topic, messages: [{ key: tenantId, value: envelope }] })
        ▼
Kafka Broker
        │
        │  Partition theo key = tenantId (đảm bảo ordering trong tenant)
        │
        ├─ consumer group: cg.<pbcId-B>  ──► PBC Backend B — EventConsumer
        │                                         └─ xử lý nghiệp vụ B
        │
        └─ consumer group: cg.<pbcId-C>  ──► PBC Backend C — EventConsumer
                                                  └─ xử lý nghiệp vụ C
```

**Ví dụ thực tế:**

```
pbc-auth-api publish 'pbc.auth.user.created'
        │
        ├─► pbc-student-api (cg.student-mgmt)
        │       └─ linkAuthUserCreated() → tìm student khớp email, gán userId
        │
        └─► pbc-notification-api (cg.notification)
                └─ processEvent() → tạo notification "Tài khoản mới được tạo"
```

**Quy tắc:**
- `EventPublisher.publish()` **không throw** khi Kafka unavailable — log error, HTTP response không bị block.
- `EventConsumer` phải **idempotent** — xử lý trùng message không gây lỗi (dùng `eventId` để dedup nếu cần).
- Partition key = `tenantId` để đảm bảo ordering trong cùng tenant.
- Consumer group riêng cho từng PBC — không share consumer group giữa các PBC khác nhau.

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  LUỒNG BACKEND → BACKEND                                                │
  │                                                                         │
  │  PBC Backend A          Kafka Broker          PBC Backend B/C           │
  │  ─────────────          ─────────────         ──────────────            │
  │  Service.create()                                                       │
  │  │                                                                      │
  │  EventPublisher                                                         │
  │  .publish()  ─────────► topic partition ────► EventConsumer             │
  │               kafkajs    (key=tenantId)        (cg.<pbcId>)             │
  │               trực tiếp                        │                        │
  │                                                handleEvent()            │
  │                                                (idempotent)             │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## PATTERN 4 — Backend → UI

**Khi nào dùng:** PBC Backend cần push thông tin real-time xuống browser — notification, cập nhật trạng thái, live data.

**Cơ chế:** PBC Backend → Kafka → kafka-gateway Consumer → WebSocket → App Shell → PBC UI.

```
PBC Backend — EventPublisher
        │
        │  producer.send({ topic: 'pbc.notification.triggered', ... })
        ▼
Kafka Broker
        │
        │  consumer group: gateway-{clientId}-{topic}
        │  (mỗi browser tab = 1 consumer group riêng → mỗi tab nhận đủ message)
        ▼
kafka-gateway — Consumer (subscribe khi browser gửi { type: "subscribe", topic })
        │
        │  ws.send({ type: "event", topic, payload })
        ▼
event-bus.ts (App Shell — WebSocket client)
        │
        │  subscriptions.get(topic)?.forEach(handler => handler(payload))
        ▼
Handler đã đăng ký (trong event-mapper.ts hoặc PBC UI component)
        │
        └─ Cập nhật UI (badge, toast, live table, ...)
```

**Ví dụ thực tế:**

```
pbc-notification-api publish 'pbc.notification.triggered'
        │
        ▼
kafka-gateway nhận (consumer group: gateway-{tabId}-notification.triggered)
        │
        ▼
App Shell event-bus nhận → NotificationBellSlot cập nhật badge count
```

**Consumer group per tab:**

```
Browser Tab 1  ──► consumer group: gateway-uuid-A-notification.triggered
Browser Tab 2  ──► consumer group: gateway-uuid-B-notification.triggered
Browser Tab 3  ──► consumer group: gateway-uuid-C-notification.triggered
```

Mỗi tab có `clientId = crypto.randomUUID()` riêng → consumer group riêng → **mỗi tab nhận đủ tất cả message**, không bị Kafka chia message giữa các tab.

**App Shell subscribe topic:**

```ts
// Trong event-mapper.ts hoặc component
subscribe('pbc.notification.triggered', (payload) => {
  // cập nhật UI
})
// → event-bus.ts gửi { type: "subscribe", topic } lên kafka-gateway
// → kafka-gateway tạo consumer cho topic này
```

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  LUỒNG BACKEND → UI                                                     │
  │                                                                         │
  │  PBC Backend    Kafka Broker    kafka-gateway    App Shell    PBC UI    │
  │  ───────────    ─────────────   ─────────────    ─────────    ──────    │
  │  EventPublisher                                                         │
  │  .publish()  ──► topic ────────► consumer                              │
  │                  (per-tab       (per-tab         ws.onmessage           │
  │                   group)         group)          │                      │
  │                                  ws.send() ─────► handler()            │
  │                                                   │                    │
  │                                                   subscribe() ─────────►│
  │                                                               callback  │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## Sơ đồ tổng hợp — 4 Pattern

```
                              BROWSER (Tab)
  ┌───────────────────────────────────────────────────────────────────────┐
  │                                                                       │
  │   PBC UI A          App Shell                    PBC UI B            │
  │   ────────    [1]   ──────────────────────────   ────────            │
  │   dispatch ──────►  event-mapper.ts              addEventListener    │
  │   ('pbc-event')     │  │                         ('shell:*')  ▲      │
  │                     │  └─ re-dispatch('shell:*') ─────────────┘      │
  │                     │                                                 │
  │                     │  [2] publish(topic, payload)                   │
  │                     ▼                                                 │
  │                  event-bus.ts ──── WebSocket ────────────────────►   │
  │                     ▲                                                 │
  │                     │  [4] ws.onmessage                              │
  │                     └──── WebSocket ◄──────────────────────────────  │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
                              │ [2]          ▲ [4]
                         ws://kafka-gateway:4000
                              │              │
  ┌───────────────────────────▼──────────────┴───────────────────────────┐
  │                      kafka-gateway                                    │
  │              WebSocket Server ↔ KafkaJS Producer/Consumer            │
  │              ALLOWED_TOPICS whitelist (codegen từ app-wiring.json)   │
  └───────────────────────────┬──────────────▲───────────────────────────┘
                              │ [2][3]        │ [4]
                         kafkajs (TCP:9092)
                              │              │
  ┌───────────────────────────▼──────────────┴───────────────────────────┐
  │                       Kafka Broker                                    │
  │                                                                       │
  │   topic: pbc.<pbcId>.<domain>.<verb>                                 │
  │   partition key: tenantId                                             │
  │   retention: 7 ngày                                                   │
  └───────────────────────────┬──────────────▲───────────────────────────┘
                              │ [3]           │ [3]
                         kafkajs (TCP:9092, trực tiếp — không qua gateway)
                              │              │
  ┌───────────────────────────▼──────────────┴───────────────────────────┐
  │                    PBC Backend APIs                                   │
  │                                                                       │
  │   EventPublisher  ──[3]──►  Kafka  ──[3]──►  EventConsumer           │
  │   (producer)                                  (consumer)             │
  │                                                                       │
  │   consumer group: <appId>-<pbcId>-consumers                         │
  └───────────────────────────────────────────────────────────────────────┘

  [1] UI → UI        : window.CustomEvent (zero latency, same tab)
  [2] UI → Backend   : CustomEvent → App Shell → WebSocket → kafka-gateway → Kafka → Consumer
  [3] Backend → Backend : KafkaJS trực tiếp → Kafka → KafkaJS trực tiếp
  [4] Backend → UI   : KafkaJS → Kafka → kafka-gateway Consumer → WebSocket → App Shell
```

---

## Bảng so sánh 4 Pattern

| | UI → UI | UI → Backend | Backend → Backend | Backend → UI |
|---|---|---|---|---|
| **Transport** | window.CustomEvent | WebSocket → Kafka | KafkaJS trực tiếp | Kafka → WebSocket |
| **Qua kafka-gateway** | Không | Có | Không | Có |
| **Latency** | ~0ms | ~10-50ms | ~5-20ms | ~10-50ms |
| **Delivery guarantee** | None (fire & forget) | At-least-once | At-least-once | At-least-once |
| **Phạm vi** | Cùng browser tab | Cross-service | Cross-service | Cross-service |
| **Dùng khi** | UI state sync, navigation | Trigger backend action | Service choreography | Real-time push to browser |
| **Ví dụ** | Login → Navbar update | Student selected → prefill | User created → link profile | Notification badge |

---

## Quy tắc chung

### Topic naming
```
pbc.<pbcId>.<aggregate>.<verb>

Ví dụ:
  pbc.auth.user.created
  pbc.student-management.student.status-changed
  pbc.class-management.student.assigned-to-class
```

### Consumer group naming
```
<appId>-<pbcId>-<purpose>

Ví dụ:
  student-portal-student-management-consumers
  student-portal-notification-consumers
  gateway-{clientId}-{topic}   ← kafka-gateway (per browser tab)
```

### Envelope chuẩn (Backend publish)
```json
{
  "eventId":       "uuid-v4",          ← dùng để dedup (idempotency)
  "eventType":     "pbc.auth.user.created",
  "schemaVersion": "1.0",
  "occurredAt":    "ISO-8601",
  "tenantId":      "tenant-id",        ← partition key
  "correlationId": "uuid-v4",          ← trace request xuyên suốt
  "data":          { ... }             ← payload nghiệp vụ
}
```

### Idempotency
- Backend consumer **phải** xử lý trùng message không gây lỗi.
- Dùng `eventId` để dedup nếu nghiệp vụ không tự nhiên idempotent.
- Kafka at-least-once delivery → duplicate là bình thường, không phải lỗi.

### Graceful degradation
- `EventPublisher.publish()` không throw khi Kafka unavailable — HTTP response không bị block.
- `event-bus.ts` buffer publish khi WebSocket chưa connect — flush sau khi reconnect.
- kafka-gateway auto-reconnect consumer khi Kafka restart.

### Whitelist (kafka-gateway)
- Chỉ topic có trong `ALLOWED_TOPICS` (`topic-registry.ts`) mới được publish/subscribe qua gateway.
- File này được **codegen từ `app-wiring.json`** — không sửa tay.
- PBC không thể tự ý tạo topic ngoài contract đã khai báo.
