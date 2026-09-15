#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../mini-services" && pwd)"

if [ ! -d "$ROOT_DIR" ]; then
  echo "ℹ️ mini-services directory not found, skipping"
  exit 0
fi

success_count=0
fail_count=0
for dir in "$ROOT_DIR"/*; do
  [ -d "$dir" ] || continue
  [ -f "$dir/package.json" ] || continue
  project_name=$(basename "$dir")
  echo "📦 Installing dependencies: $project_name"
  if (cd "$dir" && bun install); then
    success_count=$((success_count + 1))
  else
    fail_count=$((fail_count + 1))
  fi
done

echo "✅ Installation complete: $success_count succeeded, $fail_count failed"
[ "$fail_count" -eq 0 ]
