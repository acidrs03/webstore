#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# backup.sh — Back up MongoDB and uploaded files.
#
# Creates a timestamped archive in BACKUP_DIR (default: ./backups/).
# Safe to run while the app is running — mongodump is consistent.
#
# Usage:
#   bash scripts/backup.sh
#   bash scripts/backup.sh /path/to/custom/backup/dir
#
# Schedule with cron (run daily at 2am):
#   0 2 * * * /bin/bash /mnt/user/appdata/handcraft-store/scripts/backup.sh >> /mnt/user/appdata/handcraft-store/logs/backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${1:-$(dirname "$0")/../backups}"
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
# Set MONGO_CONTAINER to the name of your MongoDB Docker container.
# Set DB_NAME to the database name used in your MONGODB_URI.
MONGO_CONTAINER="${MONGO_CONTAINER:-my_mongo}"
DB_NAME="${DB_NAME:-my_store}"
APPDATA_PATH="${APPDATA_PATH:-/mnt/user/appdata/handcraft-store}"

echo ""
echo "▶ Starting backup — $TIMESTAMP"
mkdir -p "$BACKUP_PATH"

# ── MongoDB dump ──────────────────────────────────────────────────────────────
echo "  Dumping MongoDB..."
docker exec "$MONGO_CONTAINER" mongodump \
  --db "$DB_NAME" \
  --out "/tmp/mongodump_$TIMESTAMP" \
  --quiet

docker cp "$MONGO_CONTAINER:/tmp/mongodump_$TIMESTAMP" "$BACKUP_PATH/mongodb"

# Clean up temp dump inside container
docker exec "$MONGO_CONTAINER" rm -rf "/tmp/mongodump_$TIMESTAMP"

echo "  ✓ MongoDB dump saved."

# ── Uploads archive ───────────────────────────────────────────────────────────
UPLOADS_SRC="$APPDATA_PATH/uploads"
if [ -d "$UPLOADS_SRC" ]; then
  echo "  Archiving uploads..."
  tar -czf "$BACKUP_PATH/uploads.tar.gz" -C "$UPLOADS_SRC" .
  echo "  ✓ Uploads archived."
else
  echo "  ! uploads directory not found at $UPLOADS_SRC — skipping."
fi

# ── Summary ───────────────────────────────────────────────────────────────────
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
echo "  Backup complete: $BACKUP_PATH ($BACKUP_SIZE)"

# ── Retention: keep last 14 backups ──────────────────────────────────────────
echo "  Pruning old backups (keeping 14 most recent)..."
ls -1dt "$BACKUP_DIR"/*/  2>/dev/null | tail -n +15 | xargs rm -rf || true
echo "  ✓ Done."
echo ""
