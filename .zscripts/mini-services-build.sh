#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../mini-services" && pwd)"
BUILD_ID="${BUILD_ID:-local}"
BUILD_ROOT="${BUILD_DIR:-/tmp/build_fullstack_$BUILD_ID}"
DIST_DIR="$BUILD_ROOT/mini-services-dist"

mkdir -p "$DIST_DIR"

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
  entry_path=""
  for entry in src/index.ts index.ts src/index.js index.js; do
    if [ -f "$dir/$entry" ]; then entry_path="$dir/$entry"; break; fi
  done
  [ -n "$entry_path" ] || { echo "⚠️ Skipping $project_name: no entry file"; continue; }
  output_file="$DIST_DIR/mini-service-$project_name.js"
  if bun build "$entry_path" --outfile "$output_file" --target bun --minify; then
    success_count=$((success_count + 1))
  else
    fail_count=$((fail_count + 1))
  fi
done

cp "$SCRIPT_DIR/mini-services-start.sh" "$DIST_DIR/mini-services-start.sh"
chmod +x "$DIST_DIR/mini-services-start.sh"
echo "✅ Mini-services build complete: $success_count succeeded, $fail_count failed"
