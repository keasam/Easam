#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
BUILD_DIR="${BUILD_DIR:?BUILD_DIR is required}"
PYTHON_VERSION="${PYTHON_VERSION:-3.12}"
NEXT_DIST_DIR="$BUILD_DIR/next-service-dist"
PYTHON_RUNTIME_DIR="$BUILD_DIR/python-runtime"
PYTHON_PACKAGES_DIR="$PYTHON_RUNTIME_DIR/site-packages"

has_python_sources() {
  find "$PROJECT_DIR" \( -type d \( -name '.git' -o -name '.next' -o -name '.venv' -o -name 'node_modules' -o -name '__pycache__' -o -name 'mini-services' -o -name 'upload' -o -name 'download' \) -prune \) -o -type f \( -name '*.py' -o -name '*.pyi' \) -print -quit | grep -q .
}

if ! has_python_sources && [ ! -f "$PROJECT_DIR/requirements.txt" ] && [ ! -f "$PROJECT_DIR/pyproject.toml" ]; then
  echo "ℹ️ No Python sources or dependency manifest; skipping Python runtime"
  exit 0
fi

command -v uv >/dev/null 2>&1 || { echo "❌ Python project detected but uv is unavailable"; exit 1; }
mkdir -p "$NEXT_DIST_DIR" "$PYTHON_PACKAGES_DIR"

if [ -f "$PROJECT_DIR/requirements.txt" ]; then
  uv pip install --python "$PYTHON_VERSION" --target "$PYTHON_PACKAGES_DIR" --requirements "$PROJECT_DIR/requirements.txt"
elif [ -f "$PROJECT_DIR/pyproject.toml" ]; then
  req="$PYTHON_RUNTIME_DIR/requirements.txt"
  if [ -f "$PROJECT_DIR/uv.lock" ]; then
    uv export --project "$PROJECT_DIR" --frozen --no-dev --no-emit-project --format requirements.txt --output-file "$req"
  else
    uv pip compile "$PROJECT_DIR/pyproject.toml" --python-version "$PYTHON_VERSION" --output-file "$req"
  fi
  uv pip install --python "$PYTHON_VERSION" --target "$PYTHON_PACKAGES_DIR" --requirements "$req"
fi

if has_python_sources; then
  (
    cd "$PROJECT_DIR"
    find . \( -type d \( -name '.git' -o -name '.next' -o -name '.venv' -o -name 'node_modules' -o -name '__pycache__' -o -name 'mini-services' -o -name 'upload' -o -name 'download' \) -prune \) -o -type f \( -name '*.py' -o -name '*.pyi' \) -print0 | tar --null -T - -cf -
  ) | tar -C "$NEXT_DIST_DIR" -xf -
fi

echo "✅ Python runtime prepared"
