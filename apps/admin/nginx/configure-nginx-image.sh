#!/bin/sh
# Aligns nginx with VITE_ADMIN_BASE_PATH from the Docker build:
# - "/" or empty (after trim) → SPA at site root, no redirect from GET /
# - e.g. "/god-mode" → static files under html/god-mode and 302 / → /god-mode/

set -eu

trim_path() {
  printf '%s' "$1" | sed -e 's|^/*||' -e 's|/*$||'
}

RAW="${VITE_ADMIN_BASE_PATH:-/god-mode}"
TRIMMED=$(trim_path "$RAW")

DEST_ROOT="/usr/share/nginx/html"
SRC="/tmp/admin-build"

rm -rf "${DEST_ROOT:?}"/*
mkdir -p "$DEST_ROOT"

if [ -z "$TRIMMED" ]; then
  cp -a "$SRC"/. "$DEST_ROOT"/
  FALLBACK="/index.html"
  ROOT_LOCATION=""
else
  SUBDIR="$TRIMMED"
  mkdir -p "$DEST_ROOT/$SUBDIR"
  cp -a "$SRC"/. "$DEST_ROOT/$SUBDIR"/
  PREFIX="/$SUBDIR"
  FALLBACK="${PREFIX}/index.html"
  ROOT_LOCATION="    location = / {
      return 302 ${PREFIX}/;
    }

"
fi

cat > /etc/nginx/nginx.conf <<EOF
worker_processes 4;

events {
  worker_connections 1024;
}

http {
  include mime.types;

  default_type  application/octet-stream;

  set_real_ip_from        0.0.0.0/0;
  real_ip_recursive       on;
  real_ip_header          X-Forward-For;
  limit_req_zone          \$binary_remote_addr zone=mylimit:10m rate=10r/s;

  access_log /dev/stdout;
  error_log /dev/stderr;

  server {
    listen 3000;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-XSS-Protection "1; mode=block" always;
${ROOT_LOCATION}    location / {
      root   ${DEST_ROOT};
      try_files \$uri \$uri/ ${FALLBACK};
    }
  }
}
EOF

rm -rf "$SRC"
