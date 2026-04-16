# AI-GENERATED
# Build context: student-management/ (thư mục cha)
# Usage: docker build -t student-management-app-shell -f app-shell/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /workspace

COPY app-shell/ ./app-shell/
COPY pbc-registry.json ./pbc-registry.json
COPY app-contract.json ./app-contract.json

WORKDIR /workspace/app-shell
RUN npm install
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /workspace/app-shell/dist /usr/share/nginx/html
COPY app-shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3010
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3010/nginx-health || exit 1
CMD ["nginx", "-g", "daemon off;"]
