#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
BUILD_DIR="${BUILD_DIR:?BUILD_DIR is required}"
SOURCE_DB_DIR="$PROJECT_DIR/db"
SOURCE_DB_PATH="$SOURCE_DB_DIR/custom.db"
TARGET_DB_DIR="$BUILD_DIR/db"
TARGET_DB_PATH="$TARGET_DB_DIR/custom.db"

mkdir -p "$TARGET_DB_DIR"

if [ -f "$SOURCE_DB_PATH" ]; then
  echo "🗄️ Copying project database to build artifact..."
  cp -a "$SOURCE_DB_DIR/." "$TARGET_DB_DIR/"
else
  echo "ℹ️ No db/custom.db found; initializing an empty production database"
fi

(
  cd "$PROJECT_DIR"
  DATABASE_URL="file:$TARGET_DB_PATH" bun run db:push
)

if [ ! -f "$TARGET_DB_PATH" ]; then
  echo "❌ Database initialization did not create $TARGET_DB_PATH"
  exit 1
fi

echo "✅ Build database prepared"
ls -lah "$TARGET_DB_DIR"
