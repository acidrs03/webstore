#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# regenerate-sitemap.sh — Regenerate sitemap.xml and robots.txt.
#
# Run this after adding/removing products or changing BASE_URL.
# The generated files are written to src/public/ and served by the Node app.
#
# Usage:
#   bash scripts/regenerate-sitemap.sh
#
# Add to cron to refresh weekly (Sunday at 3am):
#   0 3 * * 0 /bin/bash /mnt/user/appdata/handcraft-store/scripts/regenerate-sitemap.sh >> /mnt/user/appdata/handcraft-store/logs/sitemap.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

COMPOSE_FILE="$(dirname "$0")/../docker-compose.yml"

echo "$(date '+%Y-%m-%d %H:%M:%S') ▶ Regenerating sitemap and robots.txt..."
docker compose -f "$COMPOSE_FILE" exec -T app node src/scripts/generateSitemap.js
echo "$(date '+%Y-%m-%d %H:%M:%S') ✓ Done."
