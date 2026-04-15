// AI-GENERATED
// Entry point: khởi tạo router, event-bus, mount Shell
import React from "react";
import ReactDOM from "react-dom/client";
import { Shell } from "./layout/Shell";
import { initEventBus } from "./core/event-bus";
import { registerEventMappings } from "./core/event-mapper";
import { guardRoute } from "./guards/auth-guard";
import { appContract } from "./config/app-contract";
import { getEnabledPBCs, mountPBC } from "./core/pbc-loader";

const KAFKA_BROKERS = import.meta.env.VITE_KAFKA_BROKERS ?? "localhost:9092";

async function bootstrap() {
  // 1. Khởi tạo Kafka event bus
  await initEventBus(KAFKA_BROKERS);

  // 2. Đăng ký event mappings giữa các PBC
  await registerEventMappings();

  // 3. Guard route hiện tại
  const isAuthenticated = !!localStorage.getItem("token");
  guardRoute(window.location.pathname, isAuthenticated, () => {
    window.location.href = "/login";
  });

  // 4. Mount PBC tương ứng với route hiện tại
  const pbcs = getEnabledPBCs();
  const matched = pbcs.find((pbc) =>
    window.location.pathname.startsWith(pbc.routePrefix)
  );

  // 5. Render shell
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <Shell>
        {matched ? (
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el && !el.hasChildNodes()) {
                mountPBC(matched, el);
              }
            }}
          />
        ) : (
          <div>
            <h2>Welcome to {appContract.name}</h2>
            <p>Chọn module từ sidebar để bắt đầu.</p>
          </div>
        )}
      </Shell>
    </React.StrictMode>
  );
}

bootstrap().catch(console.error);
