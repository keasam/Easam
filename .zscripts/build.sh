#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NEXTJS_PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="${BUILD_DIR:-/tmp/build_fullstack_${BUILD_ID:-local}}"

mkdir -p "$BUILD_DIR"

echo "🚀 Building Easam from $NEXTJS_PROJECT_DIR"

cd "$NEXTJS_PROJECT_DIR"

if ! command -v bun >/dev/null 2>&1; then
  echo "❌ bun is not installed or not in PATH"
  exit 1
fi

bun install --frozen-lockfile
bun run build

mkdir -p "$BUILD_DIR/next-service-dist"
if [ -d ".next/static" ]; then
  cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi
if [ -d "public" ]; then
  cp -r public "$BUILD_DIR/next-service-dist/"
fi
if [ -f ".next/standalone/server.js" ]; then
  cp -r .next/standalone/. "$BUILD_DIR/next-service-dist/"
elif [ -f ".next/server.js" ]; then
  cp .next/server.js "$BUILD_DIR/next-service-dist/"
else
  echo "❌ Next.js standalone server.js was not generated"
  exit 1
fi

PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" bash "$SCRIPT_DIR/python-runtime-build.sh"
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" bash "$SCRIPT_DIR/database-runtime-build.sh"

if [ -f "Caddyfile" ]; then
  cp Caddyfile "$BUILD_DIR/"
fi

if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
  BUILD_ID="${BUILD_ID:-local}" bash "$SCRIPT_DIR/mini-services-build.sh"
  if [ -d "$BUILD_DIR/mini-services-dist" ]; then
    cp -r "$BUILD_DIR/mini-services-dist" "$BUILD_DIR/"
  fi
fi

cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
chmod +x "$BUILD_DIR/start.sh" "$BUILD_DIR/mini-services-start.sh"

echo "✅ Easam build completed: $BUILD_DIR"
ls -lah "$BUILD_DIR"
