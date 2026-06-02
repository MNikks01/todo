# Rule: Security

- **Every protected route** has authentication + authorization (RBAC) + ownership checks. Deny by default.
- **Ownership** is enforced in the query (`{ _id, userId }`), never by trusting client-supplied IDs.
- **Secrets** come only from Secrets Manager/env (Zod-validated). **Never** commit secrets; gitleaks gate in CI.
- **Passwords** hashed with argon2id/bcrypt(≥12); generic auth errors (no enumeration).
- **Tokens:** short-lived access JWT; rotating refresh stored hashed with reuse detection; refresh in HttpOnly cookie.
- **Headers/transport:** Helmet, HSTS, strict CORS allowlist, TLS everywhere.
- **Rate limit** sensitive endpoints (stricter on auth).
- **No secrets/PII in logs** (redaction configured). Errors never leak internals to clients.
- Dependencies scanned (npm audit/Trivy/CodeQL); no unresolved high/critical.

**Verified by:** Security Review gate + automated scans + tests. Never relaxed for urgency.
