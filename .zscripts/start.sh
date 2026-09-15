#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BUILD_DIR="${BUILD_DIR:-$SCRIPT_DIR/..}"
pids=""

cleanup() {
  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then kill -TERM "$pid" 2>/dev/null || true; fi
  done
  sleep 1
  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then kill -KILL "$pid" 2>/dev/null || true; fi
  done
}
trap cleanup INT TERM EXIT

cd "$BUILD_DIR"

if [ -d "$BUILD_DIR/python-runtime/site-packages" ]; then
  export PYTHONPATH="$BUILD_DIR/python-runtime/site-packages:$BUILD_DIR/next-service-dist${PYTHONPATH:+:$PYTHONPATH}"
  export PATH="$BUILD_DIR/python-runtime/site-packages/bin:$PATH"
  export PYTHONDONTWRITEBYTECODE=1
  export PYTHONUNBUFFERED=1
fi

if [ -f "$BUILD_DIR/next-service-dist/server.js" ]; then
  export NODE_ENV=production
  export PORT="${PORT:-3000}"
  export HOSTNAME="${HOSTNAME:-0.0.0.0}"
  export DATABASE_URL="${DATABASE_URL:-file:$BUILD_DIR/db/custom.db}"
  (cd "$BUILD_DIR/next-service-dist" && bun server.js) &
  NEXT_PID=$!
  pids="$pids $NEXT_PID"
fi

if [ -f "$BUILD_DIR/mini-services-start.sh" ]; then
  DIST_DIR="$BUILD_DIR/mini-services-dist" sh "$BUILD_DIR/mini-services-start.sh" &
  pids="$pids $!"
fi

if command -v caddy >/dev/null 2>&1 && [ -f "$BUILD_DIR/Caddyfile" ]; then
  exec caddy run --config "$BUILD_DIR/Caddyfile" --adapter caddyfile
fi

wait
