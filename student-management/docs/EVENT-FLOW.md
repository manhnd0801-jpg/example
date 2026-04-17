# EVENT BUS FLOW — Student Management Portal

## Tổng quan kiến trúc

Hệ thống có **2 kênh event song song**, phục vụ 2 mục đích khác nhau:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KÊNH 1: UI Events (trong browser, cùng tab)                                │
│  Cơ chế: window.CustomEvent("pbc-event")                                    │
│  Mục đích: PBC UI → App Shell giao tiếp tức thì, không qua mạng            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  KÊNH 2: Business Events (qua Kafka)                                        │
│  Cơ chế: Browser → WebSocket → kafka-gateway → Kafka → PBC Backend         │
│  Mục đích: Đồng bộ trạng thái giữa các backend service                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## KÊNH 1: UI Events (CustomEvent)

### Cơ chế hoạt động

```
PBC UI (LoginSlot.tsx)
    │
    │  emitAuthEvent('pbc.auth.user.logged-in', { userId, username, role })
    │  → window.dispatchEvent(new CustomEvent('pbc-event', { detail: { topic, payload } }))
    │
    ▼
window (shared giữa App Shell + tất cả PBC UI trong cùng tab)
    │
    │  App Shell lắng nghe: window.addEventListener('pbc-event', handler)
    │
    ▼
event-mapper.ts (App Shell)
    │
    ├─ Xử lý 'pbc.auth.user.logged-in':
    │   ├─ sessionStorage.setItem('currentUser', ...)
    │   ├─ window.dispatchEvent('shell:user-changed')  → Navbar/Shell re-render
    │   └─ publish(EVENTS.AUTH.USER_LOGGED_IN, ...)    → Kênh 2 (Kafka)
    │
    └─ Xử lý 'pbc.auth.user.logged-out':
        ├─ sessionStorage.removeItem('currentUser')
        ├─ localStorage.removeItem('accessToken', 'refreshToken')
        ├─ window.dispatchEvent('shell:user-changed')  → Navbar/Shell re-render
        ├─ publish(EVENTS.AUTH.USER_LOGGED_OUT, ...)   → Kênh 2 (Kafka)
        └─ window.location.href = '/login'
```

### Các CustomEvent trong hệ thống

| Event name | Nguồn phát | Người lắng nghe | Mục đích |
|---|---|---|---|
| `pbc-event` | Mọi PBC UI | App Shell (event-mapper) | PBC UI → App Shell |
| `shell:user-changed` | App Shell | Navbar, Shell | Cập nhật UI khi user thay đổi |

---

## KÊNH 2: Business Events (Kafka qua WebSocket)

### Kiến trúc tổng thể

```
BROWSER                    NODE.JS                    KAFKA
─────────────────────────────────────────────────────────────────────
App Shell
  event-bus.ts
  (WebSocket client)
       │
       │  ws://localhost:4000
       │  { type: "publish", topic: "auth.user.loggedIn", payload: {...} }
       │
       ▼
  kafka-gateway             ┌─────────────────────────────────────────┐
  (WebSocket server)        │  Kafka Broker (apache/kafka:latest)     │
       │                    │  Topics:                                │
       │  kafkajs producer  │  - auth.user.loggedIn                  │
       ├──────────────────► │  - auth.user.loggedOut                 │
       │                    │  - student.created                     │
       │  kafkajs consumer  │  - student.selected                    │
       ◄──────────────────  │  - class.created                       │
       │                    │  - course.created                      │
       │  ws push           │  - subject.created                     │
       ▼                    │  - notification.triggered              │
  App Shell                 └─────────────────────────────────────────┘
  event-bus.ts                         │
  (nhận event từ Kafka)                │  kafkajs consumer (trực tiếp)
                                       ▼
                              PBC Backend APIs
                              - pbc-auth-api (cg.auth)
                              - pbc-student-api (cg.student-management)
                              - pbc-class-api (cg.class-management)
                              - pbc-course-api (cg.course-management)
                              - pbc-subject-api (cg.subject-management)
                              - pbc-notification-api (cg.notification)
```

### Chi tiết WebSocket Protocol (Browser ↔ kafka-gateway)

```
Browser → Gateway:
  { "type": "publish",     "topic": "auth.user.loggedIn", "payload": {...} }
  { "type": "subscribe",   "topic": "notification.triggered" }
  { "type": "unsubscribe", "topic": "notification.triggered" }

Gateway → Browser:
  { "type": "event", "topic": "notification.triggered", "payload": {...} }
```

---

## FLOW CHI TIẾT: Login

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: User nhập username/password trong LoginSlot                          │
└──────────────────────────────────────────────────────────────────────────────┘

LoginSlot.tsx (pbc-auth UI)
    │
    │  POST /api/auth/v1/auth/login
    │  { data: { username, password }, metadata: { tenantId, correlationId } }
    │
    ▼
nginx (App Shell, port 3000)
    │  proxy_pass → pbc-auth-api:3001
    ▼
pbc-auth-api (NestJS, port 3001)
    │
    ├─ validatePayload.hook (before)
    ├─ enforceTenant.hook (before)
    ├─ AuthService.login()
    │   ├─ bcrypt.compare(password, hash)
    │   └─ jwt.sign({ sub, username, role, tenantId })
    ├─ auditLog.hook (after)
    └─ EventPublisher.publish('pbc.auth.user.logged-in', { userId, username, role })
           │
           │  kafkajs producer → Kafka topic: pbc.auth.user.logged-in
           ▼
        Kafka Broker
           │
           │  consumer group: cg.notification
           ▼
        pbc-notification-api
           └─ Tạo notification "Đăng nhập thành công" cho userId

    Response: { data: { accessToken, refreshToken, user }, metadata: {...} }

┌──────────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 2: LoginSlot nhận response, phát UI event                               │
└──────────────────────────────────────────────────────────────────────────────┘

LoginSlot.tsx
    │
    │  localStorage.setItem('accessToken', ...)
    │  localStorage.setItem('refreshToken', ...)
    │  emitAuthEvent('pbc.auth.user.logged-in', { userId, username, role })
    │  → window.dispatchEvent(CustomEvent 'pbc-event')
    │
    ▼
event-mapper.ts (App Shell)
    │
    ├─ sessionStorage.setItem('currentUser', { userId, username, role })
    ├─ window.dispatchEvent('shell:user-changed', { userId, username, role })
    │       │
    │       ▼
    │   Navbar.tsx → re-render hiển thị tên user + role
    │   Shell.tsx  → re-render menu theo role
    │
    └─ publish(EVENTS.AUTH.USER_LOGGED_IN, normalizedPayload)
           │
           │  WebSocket → kafka-gateway → Kafka topic: auth.user.loggedIn
           ▼
        token-manager.ts (App Shell, subscribe)
           └─ _session = { accessToken, refreshToken, sub, name, roles, expiresAt }

┌──────────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 3: Redirect về dashboard                                                │
└──────────────────────────────────────────────────────────────────────────────┘

LoginSlot.tsx
    └─ onLoginSuccess(data) → window.location.href = '/dashboard'
```

---

## FLOW CHI TIẾT: Student Selected → Enrollment Prefill

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ User click chọn sinh viên trong StudentListSlot                              │
└──────────────────────────────────────────────────────────────────────────────┘

StudentListSlot.tsx (pbc-student-management UI)
    │
    │  emitStudentEvent('student.selected', { studentId, tenantId })
    │  → window.dispatchEvent(CustomEvent 'pbc-event')
    │
    ▼
event-mapper.ts (App Shell)
    │
    │  Nhận 'student.selected' từ CustomEvent
    │  → publish('student.selected', { studentId, tenantId })
    │
    ▼
event-bus.ts (App Shell)
    │  WebSocket → kafka-gateway
    ▼
kafka-gateway
    │  kafkajs producer → Kafka topic: student.selected
    ▼
Kafka Broker

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ event-mapping.config.ts (App Shell) đang subscribe 'student.selected'  │
    │ và map → 'enrollment.prefill.requested'                                 │
    └─────────────────────────────────────────────────────────────────────────┘

    kafka-gateway → WebSocket → event-bus.ts (App Shell)
    │
    │  Nhận 'student.selected' từ Kafka
    │  EVENT_MAPPING: student.selected → enrollment.prefill.requested
    │  transform: { studentId, source: 'student-profile', tenantId }
    │
    └─ publish('enrollment.prefill.requested', transformedPayload)
           │
           │  WebSocket → kafka-gateway → Kafka topic: enrollment.prefill.requested
           ▼
        Kafka Broker
           │
           │  (future: pbc-enrollment-management-api subscribe topic này)
           ▼
        pbc-enrollment-management-api (khi được implement)
           └─ Pre-fill enrollment form với studentId
```

---

## FLOW CHI TIẾT: Backend publish event → Notification

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ pbc-student-api tạo sinh viên mới                                            │
└──────────────────────────────────────────────────────────────────────────────┘

StudentController (POST /v1/students)
    │
    ├─ StudentService.create(data)
    ├─ auditLog.hook (after)
    └─ EventPublisher.publish('student.created', { studentId, fullName, ... })
           │
           │  kafkajs producer (trực tiếp, không qua gateway)
           │  Kafka topic: student.created
           ▼
        Kafka Broker
           │
           ├─ consumer group: cg.notification
           │       ▼
           │   pbc-notification-api
           │       └─ Tạo notification "Sinh viên mới được tạo"
           │
           └─ consumer group: cg.class-management (nếu cần)
                   ▼
               pbc-class-api (future: cập nhật danh sách sinh viên)
```

---

## SƠ ĐỒ TỔNG HỢP: Tất cả event flows

```
                    ┌─────────────────────────────────────────────────────┐
                    │                   BROWSER (Tab)                     │
                    │                                                     │
                    │  ┌──────────────┐    CustomEvent    ┌────────────┐ │
                    │  │  pbc-auth UI │ ──'pbc-event'──► │            │ │
                    │  │  LoginSlot   │                   │            │ │
                    │  └──────────────┘                   │            │ │
                    │                                     │ App Shell  │ │
                    │  ┌──────────────┐    CustomEvent    │            │ │
                    │  │  pbc-student │ ──'pbc-event'──► │ event-     │ │
                    │  │  UI Slots    │                   │ mapper.ts  │ │
                    │  └──────────────┘                   │            │ │
                    │                                     │            │ │
                    │  ┌──────────────┐  'shell:user-    │            │ │
                    │  │   Navbar     │ ◄─changed'──────  │            │ │
                    │  │   Shell      │                   │            │ │
                    │  └──────────────┘                   └─────┬──────┘ │
                    │                                           │        │
                    │                              event-bus.ts│        │
                    │                              WebSocket   │        │
                    └───────────────────────────────────────────┼────────┘
                                                                │
                                                    ws://localhost:4000
                                                                │
                    ┌───────────────────────────────────────────▼────────┐
                    │                  kafka-gateway                      │
                    │  WebSocket Server ←→ kafkajs Producer/Consumer     │
                    └───────────────────────────────────────────┬────────┘
                                                                │
                                                    kafkajs (TCP)
                                                                │
                    ┌───────────────────────────────────────────▼────────┐
                    │                  Kafka Broker                       │
                    │                                                     │
                    │  Topics:                                            │
                    │  ┌─────────────────────────────────────────────┐   │
                    │  │ auth.user.loggedIn    ──► cg.notification   │   │
                    │  │ auth.user.loggedOut   ──► cg.notification   │   │
                    │  │ student.created       ──► cg.notification   │   │
                    │  │ student.selected      ──► (App Shell sub)   │   │
                    │  │ class.created         ──► cg.notification   │   │
                    │  │ course.created        ──► cg.notification   │   │
                    │  │ subject.created       ──► cg.notification   │   │
                    │  │ notification.triggered ──► (App Shell sub)  │   │
                    │  └─────────────────────────────────────────────┘   │
                    └───────────────────────────────────────────┬────────┘
                                                                │
                                                    kafkajs (TCP, trực tiếp)
                                                                │
                    ┌───────────────────────────────────────────▼────────┐
                    │                  PBC Backend APIs                   │
                    │                                                     │
                    │  pbc-auth-api      (producer: pbc.auth.*)          │
                    │  pbc-student-api   (producer: student.*)           │
                    │  pbc-class-api     (producer: class.*)             │
                    │  pbc-course-api    (producer: course.*)            │
                    │  pbc-subject-api   (producer: subject.*)           │
                    │  pbc-notification-api (consumer: tất cả topics)    │
                    └────────────────────────────────────────────────────┘
```

---

## BẢNG TÓM TẮT: Event nào đi kênh nào

| Event | Nguồn | Kênh | Đích |
|---|---|---|---|
| `pbc.auth.user.logged-in` | pbc-auth UI (LoginSlot) | CustomEvent → App Shell | event-mapper → Kafka |
| `pbc.auth.user.logged-out` | pbc-auth UI (ProfileSlot) | CustomEvent → App Shell | event-mapper → Kafka |
| `auth.user.loggedIn` | App Shell (event-mapper) | WebSocket → Kafka | token-manager, pbc-notification-api |
| `auth.user.loggedOut` | App Shell (event-mapper) | WebSocket → Kafka | pbc-notification-api |
| `auth.user.loggedIn` | pbc-auth-api (EventPublisher) | kafkajs → Kafka | pbc-notification-api |
| `student.selected` | pbc-student UI (emitStudentEvent) | CustomEvent → App Shell → Kafka | event-mapping.config → enrollment.prefill.requested |
| `student.created` | pbc-student-api (EventPublisher) | kafkajs → Kafka | pbc-notification-api |
| `class.created` | pbc-class-api (EventPublisher) | kafkajs → Kafka | pbc-notification-api |
| `notification.triggered` | Kafka | kafka-gateway → WebSocket → App Shell | NotificationBellSlot (badge update) |

---

## ĐIỂM QUAN TRỌNG CẦN LƯU Ý

### 1. Dual publish của auth.user.loggedIn

Khi user login, event `auth.user.loggedIn` được publish **2 lần**:
- **Lần 1**: pbc-auth-api → kafkajs → Kafka (sau khi API xử lý xong)
- **Lần 2**: App Shell event-mapper → WebSocket → kafka-gateway → Kafka (sau khi UI nhận response)

Consumer phải **idempotent** — xử lý trùng lặp không gây lỗi.

### 2. kafka-gateway đã chạy trong stack

`docker-compose.yml` đã có service `kafka-gateway` (port 4000). Kênh 2 (WebSocket → Kafka) **hoạt động đầy đủ**. App Shell kết nối `ws://localhost:4000` khi `VITE_KAFKA_GATEWAY_URL` được set.

### 3. Backend PBC kết nối Kafka trực tiếp

Backend API không đi qua kafka-gateway — dùng kafkajs kết nối thẳng `kafka:9092`. Đây là thiết kế đúng (R-03b): gateway chỉ dành cho browser.

### 4. App Shell subscribe Kafka để nhận notification

Khi `kafka-gateway` chạy, App Shell subscribe topic `notification.triggered`. Khi pbc-notification-api publish event này, App Shell nhận qua WebSocket và cập nhật `NotificationBellSlot` badge mà không cần polling.
