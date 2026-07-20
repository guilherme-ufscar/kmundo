#!/bin/sh
set -eu

: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

export PGPASSWORD="$POSTGRES_PASSWORD"
export PGHOST="${PGHOST:-postgres}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="$POSTGRES_USER"

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-56}"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
FINAL_FILE="$BACKUP_DIR/kmundo-$STAMP.dump"
TEMP_FILE="$FINAL_FILE.part"

mkdir -p "$BACKUP_DIR"
umask 077
trap 'rm -f "$TEMP_FILE"' EXIT

echo "Starting full database backup at $STAMP"
pg_dump --format=custom --compress=9 --no-owner --no-privileges --file="$TEMP_FILE" "$POSTGRES_DB"
pg_restore --list "$TEMP_FILE" >/dev/null
mv "$TEMP_FILE" "$FINAL_FILE"
trap - EXIT
sha256sum "$FINAL_FILE" > "$FINAL_FILE.sha256"
find "$BACKUP_DIR" -type f \( -name 'kmundo-*.dump' -o -name 'kmundo-*.dump.sha256' \) -mtime +"$RETENTION_DAYS" -delete
echo "Backup completed: $FINAL_FILE (retention: $RETENTION_DAYS days)"
