# AI-GENERATED
# Multi-stage build cho App Shell
#
# Build context: student-management/ (thư mục cha — không phải app-shell/)
# Usage từ student-management/:
#   docker build -t student-mgmt-app-shell -f app-shell/Dockerfile .
#
# Hoặc qua docker-compose (context: . dockerfile: app-shell/Dockerfile)

FROM node:20-alpine AS builder
WORKDIR /workspace

# Copy các file config ở root (pbc-registry.json, app-contract.json, app-manifest.json)
COPY app-shell/         ./app-shell/
COPY pbc-registry.json  ./pbc-registry.json
COPY app-contract.json  ./app-contract.json
COPY app-manifest.json  ./app-manifest.json
COPY app-wiring.json    ./app-wiring.json
COPY shared/            ./shared/

WORKDIR /workspace/app-shell
RUN npm install
RUN npm run build

# ── Runner stage ──────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Custom nginx config — listen 3000, proxy /remotes/* → PBC UI containers
COPY app-shell/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /workspace/app-shell/dist /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
