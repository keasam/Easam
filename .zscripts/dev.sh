#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

wait_for_service() {
  local host="$1" port="$2" service_name="$3" max_attempts="${4:-60}"
  local attempt=1
  echo "Waiting for $service_name on $host:$port..."
  while [ "$attempt" -le "$max_attempts" ]; do
    if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
      echo "$service_name is ready!"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done
  echo "ERROR: $service_name failed to start"
  return 1
}

cleanup() {
  if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
    kill "$DEV_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

if ! command -v bun >/dev/null 2>&1; then
  echo "ERROR: bun is not installed or not in PATH"
  exit 1
fi

bun install
bun run db:push
bun run dev &
DEV_PID=$!
wait_for_service localhost 3000 "Next.js dev server"
curl -fsS localhost:3000 >/dev/null

echo "Next.js dev server is running (PID: $DEV_PID)."
wait "$DEV_PID"
