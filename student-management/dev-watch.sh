#!/usr/bin/env bash
# dev-watch.sh — Watch một PBC UI và rebuild + restart container khi có thay đổi
#
# Usage:
#   ./dev-watch.sh student     → watch pbc-student-management-ui
#   ./dev-watch.sh class       → watch pbc-class-management-ui
#   ./dev-watch.sh course      → watch pbc-course-management-ui
#   ./dev-watch.sh subject     → watch pbc-subject-management-ui
#   ./dev-watch.sh shell       → watch app-shell
#   ./dev-watch.sh all         → watch tất cả (mỗi cái một terminal riêng)
#
# Yêu cầu: docker, docker compose, inotifywait (Linux) hoặc fswatch (macOS)
# macOS:  brew install fswatch
# Linux:  apt install inotify-tools

set -e

PBC="${1:-student}"

case "$PBC" in
  student)
    WATCH_DIR="./pbcs/pbc-student-management/ui/src"
    SERVICE="pbc-student-management-ui"
    ;;
  class)
    WATCH_DIR="./pbcs/pbc-class-management/ui/src"
    SERVICE="pbc-class-management-ui"
    ;;
  course)
    WATCH_DIR="./pbcs/pbc-course-management/ui/src"
    SERVICE="pbc-course-management-ui"
    ;;
  subject)
    WATCH_DIR="./pbcs/pbc-subject-management/ui/src"
    SERVICE="pbc-subject-management-ui"
    ;;
  shell)
    WATCH_DIR="./app-shell/src"
    SERVICE="app-shell"
    ;;
  all)
    echo "[dev-watch] Starting watchers for all PBCs..."
    bash "$0" student &
    bash "$0" class   &
    bash "$0" course  &
    bash "$0" subject &
    bash "$0" shell   &
    wait
    exit 0
    ;;
  *)
    echo "Usage: $0 [student|class|course|subject|shell|all]"
    exit 1
    ;;
esac

rebuild() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  [$(date '+%H:%M:%S')] Change detected → rebuilding $SERVICE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  docker compose up -d --build --no-deps "$SERVICE"
  echo "  ✓ $SERVICE rebuilt and restarted"
}

echo "[dev-watch] Watching $WATCH_DIR for changes → $SERVICE"
echo "[dev-watch] Press Ctrl+C to stop"

# Debounce: chờ 1.5s sau lần thay đổi cuối cùng trước khi rebuild
LAST_REBUILD=0
DEBOUNCE=2

if command -v fswatch &>/dev/null; then
  # macOS / fswatch
  fswatch -r -e ".*" -i "\\.tsx?$" -i "\\.css$" -i "\\.json$" "$WATCH_DIR" | while read -r event; do
    NOW=$(date +%s)
    if (( NOW - LAST_REBUILD >= DEBOUNCE )); then
      LAST_REBUILD=$NOW
      rebuild
    fi
  done
elif command -v inotifywait &>/dev/null; then
  # Linux / inotify-tools
  while true; do
    inotifywait -r -e modify,create,delete,move \
      --include '\.(tsx?|css|json)$' \
      "$WATCH_DIR" &>/dev/null
    NOW=$(date +%s)
    if (( NOW - LAST_REBUILD >= DEBOUNCE )); then
      LAST_REBUILD=$NOW
      rebuild
    fi
  done
else
  # Fallback: poll mỗi 3 giây (chậm hơn nhưng không cần tool)
  echo "[dev-watch] fswatch/inotifywait not found, using polling (3s interval)"
  LAST_HASH=""
  while true; do
    HASH=$(find "$WATCH_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.css" \
      | sort | xargs md5sum 2>/dev/null | md5sum)
    if [ "$HASH" != "$LAST_HASH" ] && [ -n "$LAST_HASH" ]; then
      rebuild
    fi
    LAST_HASH="$HASH"
    sleep 3
  done
fi
