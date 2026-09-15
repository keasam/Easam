#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
DIST_DIR="${DIST_DIR:-$SCRIPT_DIR/../mini-services-dist}"
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

[ -d "$DIST_DIR" ] || { echo "ℹ️ No mini-services-dist directory"; exit 0; }

for file in "$DIST_DIR"/mini-service-*.js; do
  [ -f "$file" ] || continue
  bun "$file" &
  pids="$pids $!"
done

[ -n "$pids" ] || { echo "ℹ️ No mini services found"; exit 0; }
wait
