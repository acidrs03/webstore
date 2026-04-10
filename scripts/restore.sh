#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# restore.sh — Restore MongoDB and uploads from a backup created by backup.sh.
#
# WARNING: This will OVERWRITE the current database and uploads.
#          Stop the app container before restoring.
#
# Usage:
#   bash scripts/restore.sh ./backups/20240115_020000
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_PATH="${1:-}"
# Set MONGO_CONTAINER to the name of your MongoDB Docker container.
# Set DB_NAME to the database name used in your MONGODB_URI.
MONGO_CONTAINER="${MONGO_CONTAINER:-my_mongo}"
DB_NAME="${DB_NAME:-my_store}"
APPDATA_PATH="${APPDATA_PATH:-/mnt/user/appdata/handcraft-store}"

if [ -z "$BACKUP_PATH" ] || [ ! -d "$BACKUP_PATH" ]; then
  echo "Usage: bash scripts/restore.sh <path-to-backup-directory>"
  echo "Example: bash scripts/restore.sh ./backups/20240115_020000"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Handcraft Store — Restore from Backup              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Backup source: $BACKUP_PATH"
echo ""
read -r -p "  This will OVERWRITE the current database and uploads. Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "  Aborted."
  exit 0
fi

# ── Stop app (leave mongo running) ────────────────────────────────────────────
echo ""
echo "▶ Stopping app and nginx containers..."
docker compose stop app nginx 2>/dev/null || true

# ── Restore MongoDB ───────────────────────────────────────────────────────────
MONGO_DUMP="$BACKUP_PATH/mongodb"
if [ -d "$MONGO_DUMP" ]; then
  echo "▶ Restoring MongoDB..."
  docker cp "$MONGO_DUMP" "$MONGO_CONTAINER:/tmp/mongorestore_src"
  docker exec "$MONGO_CONTAINER" mongorestore \
    --db "$DB_NAME" \
    --drop \
    "/tmp/mongorestore_src/$DB_NAME" \
    --quiet
  docker exec "$MONGO_CONTAINER" rm -rf "/tmp/mongorestore_src"
  echo "  ✓ MongoDB restored."
else
  echo "  ! No mongodb/ directory found in backup — skipping DB restore."
fi

# ── Restore uploads ───────────────────────────────────────────────────────────
UPLOADS_ARCHIVE="$BACKUP_PATH/uploads.tar.gz"
UPLOADS_DEST="$APPDATA_PATH/uploads"
if [ -f "$UPLOADS_ARCHIVE" ]; then
  echo "▶ Restoring uploads..."
  mkdir -p "$UPLOADS_DEST"
  tar -xzf "$UPLOADS_ARCHIVE" -C "$UPLOADS_DEST"
  echo "  ✓ Uploads restored."
else
  echo "  ! No uploads.tar.gz found in backup — skipping uploads restore."
fi

# ── Restart app ───────────────────────────────────────────────────────────────
echo "▶ Restarting app and nginx..."
docker compose start app nginx 2>/dev/null || true

echo ""
echo "  ✓ Restore complete."
echo ""
