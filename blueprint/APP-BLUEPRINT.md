# VNPT COMPOSABLE APP BLUEPRINT (AI Generation Template)
Phiên bản: 2.7
Nền tảng: VNPT Composable Platform (App Composition Layer)

## QUY TẮC BẮT BUỘC AI PHẢI TUÂN THEO (KHÔNG ĐƯỢC VI PHẠM)
1. App là lớp compose nhiều PBC, không phải một PBC đơn lẻ.
2. `app-shell/` chỉ làm orchestration (load remote, map event, guard route), không chứa logic domain nghiệp vụ.
3. Không hard-code danh sách PBC trong source shell; luôn đọc từ `app-contract.json` và `pbc-registry.json`.
4. Tích hợp UI liên framework qua Web Components; hỗ trợ Shadow DOM theo cấu hình contract.
5. Giao tiếp liên-PBC theo Event Bus (Kafka) và contract của từng PBC; không gọi chéo DB giữa PBC.

## CẤU TRÚC THƯ MỤC APP (BẮT BUỘC)

```text
my-composed-app/
├── app-shell/                          # App Shell - trung tâm orchestration
├── pbcs/                               # Thư mục chứa các PBC được compose
├── shared/                             # Shared packages (ui, events, utils)
├── app-contract.json                   # Metadata & Contract của App (quan trọng nhất)
├── pbc-registry.json                   # Registry để load remote PBC
├── app-openapi.yaml                    # Optional: API expose của App
├── app-asyncapi.yaml                   # Optional: Event orchestration của App
├── docker-compose.yml
├── .gitlab-ci.yml
├── README.md
└── .gitignore
```

## CẤU TRÚC NỘI BỘ `app-shell/` (THAM CHIẾU CHO AI SINH CODE)

Đây là cấu trúc chuẩn bên trong `app-shell/`. AI phải sinh đủ các file này khi tạo App Shell:

```text
app-shell/
├── src/
│   ├── core/
│   │   ├── event-bus.ts              # Khởi tạo NATS client, expose publish/subscribe
│   │   ├── event-mapper.ts           # Map event giữa các PBC (translate subject/payload)
│   │   └── pbc-loader.ts             # Dynamic load PBC từ pbc-registry.json (Module Federation)
│   ├── guards/
│   │   └── auth-guard.ts             # Route guard đọc security config từ app-contract.json
│   ├── layout/
│   │   ├── Shell.tsx                 # Root layout: Navbar + Sidebar + <slot> cho PBC
│   │   ├── Navbar.tsx
│   │   └── DesignTokenProvider.tsx   # Inject theme tokens từ app-contract.json
│   ├── pages/
│   │   └── NotFound.tsx              # Fallback route
│   ├── config/
│   │   ├── app-contract.ts           # Load & parse app-contract.json
│   │   └── pbc-registry.ts           # Load & parse pbc-registry.json
│   └── main.tsx                      # Entry point: khởi tạo router, event-bus, mount Shell
├── public/
├── vite.config.ts                    # Module Federation host config
└── package.json
```

### Nguyên tắc sinh code `app-shell/`
- `event-bus.ts`: chỉ wrap NATS client, không chứa logic nghiệp vụ.
- `event-mapper.ts`: đọc mapping từ `app-asyncapi.yaml` hoặc config tĩnh, không hard-code subject.
- `pbc-loader.ts`: đọc `pbc-registry.json` runtime, lazy load từng PBC theo route.
- `auth-guard.ts`: đọc `security.publicRoutes` và `security.defaultPolicy` từ `app-contract.json`.
- `DesignTokenProvider.tsx`: inject CSS variables từ `theme` block của `app-contract.json`.

## TEMPLATE 1: `app-contract.json` (HOÀN CHỈNH)

```json
{
  "appId": "crm-portal",
  "version": "1.2.0",
  "name": "CRM Portal",
  "description": "Composed app for CRM capabilities",
  "category": "CRM",
  "domain": "customer-relationship-management",
  "includedPBCs": [
    { "pbcId": "user-management", "version": "1.0.0" },
    { "pbcId": "product-catalog", "version": "1.0.0" },
    { "pbcId": "order-management", "version": "1.0.0" }
  ],
  "eventBus": {
    "type": "kafka",
    "version": "3.x",
    "topicPrefix": "app.crm-portal"
  },
  "appShell": {
    "framework": "react",
    "moduleFederation": true,
    "uiStrategy": "module-federation",
    "federationPlugin": "@originjs/vite-plugin-federation",
    "basePath": "/",
    "defaultRoute": "/dashboard"
  },
  "theme": {
    "primaryColor": "#0d6efd",
    "radius": "8px",
    "fontFamily": "Inter, sans-serif"
  },
  "security": {
    "authPBC": "auth-service",
    "publicRoutes": ["/health"],
    "defaultPolicy": "authenticated"
  },
  "i18n": {
    "defaultLocale": "vi",
    "supportedLocales": ["vi", "en"]
  },
  "uiStrategy": {
    "type": "module-federation",
    "shadowDOM": false,
    "styleIsolation": false
  }
}
```

### Giải thích field `app-contract.json`
- `appId`: ID duy nhất của App, kebab-case.
- `version`: phiên bản semantic của App (MAJOR.MINOR.PATCH).
- `name`: tên hiển thị.
- `description`: mô tả nghiệp vụ tổng quan.
- `category`: nhóm nghiệp vụ.
- `domain`: domain chuẩn hóa.
- `includedPBCs`: danh sách PBC được compose — **bắt buộc có `pbcId` và `version`**.
- `includedPBCs[].pbcId`: phải khớp `pbc-contract.json.pbcId`.
- `includedPBCs[].version`: phiên bản PBC kỳ vọng, phải khớp `pbc-registry.json`.
- `eventBus`: cấu hình bus ở mức App.
- `eventBus.topicPrefix`: prefix topic Kafka của App, dạng `app.<appId>`.
- `appShell`: cấu hình host shell (framework, routing, federation).
- `appShell.uiStrategy`: `"module-federation"` khi dùng `@originjs/vite-plugin-federation` hoặc Webpack MF; `"web-components"` khi PBC wrap thành Custom Element.
- `appShell.federationPlugin`: tên plugin đang dùng, ví dụ `"@originjs/vite-plugin-federation"`.
- `appShell.defaultRoute`: route mặc định sau khi đăng nhập.
- `uiStrategy.type`: phải nhất quán với `appShell.uiStrategy`. `"module-federation"` → shell dùng dynamic `import()` để load PBC; `"web-components"` → shell mount bằng `customElementTag`.
- `uiStrategy.shadowDOM`: chỉ có ý nghĩa khi `type = "web-components"`.
- `uiStrategy.styleIsolation`: chỉ có ý nghĩa khi `type = "web-components"`.
- `theme`: token giao diện cấp App — inject thành CSS variables.
- `security`: policy bảo mật shell edge.
- `security.authPBC`: pbcId của PBC xử lý authentication.
- `security.publicRoutes`: các route không cần auth.
- `security.defaultPolicy`: `"authenticated"` hoặc `"public"`.
- `i18n`: cấu hình đa ngôn ngữ.
- `uiStrategy.type`: `"module-federation"` hoặc `"web-components"` — phải nhất quán với `appShell.uiStrategy`.

### Quy tắc versioning App
- Bump **PATCH** khi cập nhật config, theme, không thay đổi PBC.
- Bump **MINOR** khi thêm/bỏ PBC hoặc thay đổi routing.
- Bump **MAJOR** khi thay đổi kiến trúc shell hoặc breaking change event contract.

## TEMPLATE 2: `pbc-registry.json` (MÔ TẢ FIELD CHO AI)

```json
{
  "version": "1.0",
  "pbcList": [
    {
      "pbcId": "user-management",
      "version": "1.0.0",
      "remoteUrl": "http://localhost:3001/assets/remoteEntry.js",
      "scope": "pbc_user_management",
      "module": "./bootstrap",
      "routePrefix": "/users",
      "enabled": true
    }
  ]
}
```

### Giải thích field `pbc-registry.json`
- `version`: version schema registry.
- `pbcList`: danh sách remote PBC để shell load runtime.
- `pbcList[].pbcId`: định danh PBC, khớp `includedPBCs[].pbcId`.
- `pbcList[].version`: version remote, khớp `includedPBCs[].version`.
- `pbcList[].remoteUrl`: URL remote entry (Module Federation `remoteEntry.js`).
- `pbcList[].scope`: federation scope, snake_case, khớp `name` trong `vite.config.ts` của PBC.
- `pbcList[].module`: exposed module để import runtime, khớp key trong `exposes` của PBC.
- `pbcList[].routePrefix`: route namespace trong shell, không được trùng giữa các PBC.
- `pbcList[].enabled`: `false` để tắt PBC mà không cần xóa khỏi registry.
- `pbcList[].customElementTag`: **chỉ thêm** khi `uiStrategy.type = "web-components"`; bỏ qua khi dùng Module Federation.

## TEMPLATE 3: `app-openapi.yaml` (OPTIONAL - KHI APP CÓ HTTP API RIÊNG)

```yaml
openapi: 3.1.0
info:
  title: CRM Portal App API
  version: 1.0.0
servers:
  - url: http://localhost:3000
paths:
  /health:
    get:
      summary: Liveness check
      responses:
        "200":
          description: OK
```

### Giải thích field `app-openapi.yaml`
- `openapi`: version đặc tả.
- `info`: metadata API cấp App.
- `servers`: base URL API.
- `paths`: endpoint App expose thực tế (thường chỉ `/health` và các BFF endpoint nếu có).
- **Bỏ file này nếu App không expose HTTP API riêng.**

## TEMPLATE 4: `app-asyncapi.yaml` (OPTIONAL - KHI APP ORCHESTRATE EVENT)

```yaml
asyncapi: 2.6.0
info:
  title: CRM Portal App Event Map
  version: 1.0.0
servers:
  localKafka:
    url: localhost:9092
    protocol: kafka
channels:
  app.crm-portal.ui.user-selected:
    subscribe:
      operationId: onUserSelected
      message:
        payload:
          type: object
          properties:
            userId: { type: string }
  pbc.order-management.order.prefill-requested:
    publish:
      operationId: publishOrderPrefillRequested
      message:
        payload:
          type: object
          properties:
            userId: { type: string }
            source: { type: string }
```

### Giải thích field `app-asyncapi.yaml`
- `asyncapi`: version đặc tả.
- `info`: metadata event contract App.
- `servers`: cấu hình broker (Kafka).
- `channels`: topic/channels orchestration ở cấp App.
- `subscribe`: shell lắng nghe event từ PBC (PBC publish → shell nhận).
- `publish`: shell phát event đến PBC (shell publish → PBC nhận).
- `message.payload`: schema payload bắt buộc phải khai báo để AI sinh đúng type.
- **Bỏ file này nếu App không orchestrate event giữa các PBC.**

## TEMPLATE 5: `docker-compose.yml` (CHẠY LOCAL TOÀN APP)

```yaml
version: "3.9"

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.1
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.6.1
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper

  app-shell:
    build:
      context: ./app-shell
    ports:
      - "3000:3000"
    environment:
      - VITE_KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka

  pbc-user-management:
    build:
      context: ./pbcs/pbc-user-management
    ports:
      - "3001:3001"
    environment:
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka

  pbc-product-catalog:
    build:
      context: ./pbcs/pbc-product-catalog
    ports:
      - "3002:3002"
    environment:
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka

  pbc-order-management:
    build:
      context: ./pbcs/pbc-order-management
    ports:
      - "3003:3003"
    environment:
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
```

### Nguyên tắc sinh `docker-compose.yml`
- Kafka cần Zookeeper (hoặc KRaft mode từ Kafka 3.3+); blueprint dùng Zookeeper cho tương thích rộng.
- Kafka expose 2 listener: `PLAINTEXT` (internal compose network `kafka:29092`) và `PLAINTEXT_HOST` (host `localhost:9092`).
- Biến môi trường `KAFKA_BROKERS` của PBC/shell phải trỏ internal listener (`kafka:29092`), không dùng `localhost`.
- Mỗi PBC chiếm một port riêng biệt, không được trùng.
- Port của `app-shell` là `3000` (convention), PBC bắt đầu từ `3001` tăng dần.
- Thêm PBC mới = thêm service mới vào compose, không sửa service khác.

## QUY TẮC ĐỒNG BỘ BẮT BUỘC GIỮA APP VÀ PBC
- `includedPBCs[*].pbcId/version` phải khớp `pbc-registry.json.pbcList[*].pbcId/version`.
- `pbc-registry.json.scope/module/customElementTag` phải khớp manifest/expose của từng PBC UI.
- `pbc-registry.json.routePrefix` không được trùng nhau giữa các PBC trong cùng một App.
- Topic trong `app-asyncapi.yaml` phải map đúng topic đã công bố trong `asyncapi.yaml` của PBC.
- `security.authPBC` phải là `pbcId` có trong `includedPBCs`.
- Nếu App không expose API riêng thì bỏ `app-openapi.yaml`.
- Nếu App không orchestrate event thì bỏ `app-asyncapi.yaml`.
- Port trong `docker-compose.yml` phải khớp `remoteUrl` trong `pbc-registry.json` (môi trường local).
- Biến môi trường `KAFKA_BROKERS` phải dùng internal listener của Kafka trong compose network.
