#!/usr/bin/env bash
# Rotate JWT_ACCESS_SECRET in Secrets Manager, preserving the other keys
# (runbooks/rotate-keys.md A). Requires `aws` + `jq`. Roll the service after.
#
# Usage: rotate-jwt-secret.sh <env> [new-secret]
set -euo pipefail

ENV="${1:?usage: rotate-jwt-secret.sh <env> [new-secret]}"
NEW_SECRET="${2:-$(openssl rand -base64 48 | tr -d '\n')}"
SECRET_ID="todo/${ENV}/app"

echo "[rotate] reading current secret ${SECRET_ID}"
CURRENT="$(aws secretsmanager get-secret-value --secret-id "${SECRET_ID}" --query SecretString --output text)"

echo "[rotate] writing new JWT_ACCESS_SECRET (other keys preserved)"
UPDATED="$(printf '%s' "${CURRENT}" | jq --arg s "${NEW_SECRET}" '.JWT_ACCESS_SECRET=$s')"
aws secretsmanager put-secret-value --secret-id "${SECRET_ID}" --secret-string "${UPDATED}" >/dev/null

echo "[rotate] done. Now roll the service so tasks pick it up:"
echo "  aws ecs update-service --cluster todo-${ENV}-cluster --service todo-${ENV}-api --force-new-deployment"
