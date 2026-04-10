#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# entrypoint.sh — Runs automatically when the container starts.
#
# Order of operations:
#   1. Seed default categories, products, settings, and content (idempotent)
#   2. Create admin account from ADMIN_EMAIL / ADMIN_PASSWORD (idempotent)
#   3. Generate sitemap.xml and robots.txt
#   4. Start the Node.js server
#
# All seed steps are safe to run on every start — they skip records that
# already exist, so re-starting the container will not duplicate data.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Handcraft Store — Starting up"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "▶ Seeding default data..."
node src/scripts/seedData.js
echo ""

echo "▶ Creating admin account..."
node src/scripts/seedAdmin.js

echo "▶ Generating sitemap and robots.txt..."
node src/scripts/generateSitemap.js || echo "  (Sitemap generation skipped — BASE_URL not set or DB unavailable)"
echo ""

echo "▶ Starting server..."
exec node src/server.js
