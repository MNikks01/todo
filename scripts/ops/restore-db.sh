#!/usr/bin/env bash
# Restore MongoDB from an S3 gzip archive. DESTRUCTIVE (--drop) — only run
# against a restore target, never the live primary (runbooks/restore.md A2).
#
# Usage: restore-db.sh <s3-archive-url> <target-mongodb-uri>
set -euo pipefail

ARCHIVE_URL="${1:?usage: restore-db.sh <s3-archive-url> <target-mongodb-uri>}"
TARGET_URI="${2:?usage: restore-db.sh <s3-archive-url> <target-mongodb-uri>}"

echo "WARNING: this runs 'mongorestore --drop' against:"
echo "  ${TARGET_URI%%@*}@<redacted>"
read -r -p "Type 'restore' to proceed: " confirm
[ "${confirm}" = "restore" ] || { echo "aborted"; exit 1; }

LOCAL="/tmp/restore-$(date -u +%s).archive.gz"
echo "[restore] downloading ${ARCHIVE_URL}"
aws s3 cp "${ARCHIVE_URL}" "${LOCAL}"

echo "[restore] restoring (with --drop)"
mongorestore --uri="${TARGET_URI}" --gzip --archive="${LOCAL}" --drop

rm -f "${LOCAL}"
echo "[restore] done — verify with /ready and a smoke login"
