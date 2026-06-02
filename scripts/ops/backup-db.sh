#!/usr/bin/env bash
# Back up MongoDB to a gzip archive and upload to the versioned backups bucket.
# Secondary to Atlas continuous backup (docs: infrastructure/aws/runbooks/restore.md).
#
# Usage: backup-db.sh <mongodb-uri> <s3-backups-bucket>
set -euo pipefail

MONGO_URI="${1:?usage: backup-db.sh <mongodb-uri> <s3-bucket>}"
BUCKET="${2:?usage: backup-db.sh <mongodb-uri> <s3-bucket>}"

TS="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="/tmp/mongo-${TS}.archive.gz"

echo "[backup] dumping → ${ARCHIVE}"
mongodump --uri="${MONGO_URI}" --gzip --archive="${ARCHIVE}"

echo "[backup] uploading → s3://${BUCKET}/mongo/${TS}.archive.gz"
aws s3 cp "${ARCHIVE}" "s3://${BUCKET}/mongo/${TS}.archive.gz"

rm -f "${ARCHIVE}"
echo "[backup] done (${TS})"
