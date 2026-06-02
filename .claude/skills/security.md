# Skill: Security

## Best Practices

- **Deny by default**: every protected route has authn + authz + ownership.
- Passwords: argon2id (or bcrypt ≥12); generic errors (no enumeration); rate-limit auth.
- Tokens: short access JWT (15m, no PII in claims); rotating opaque refresh (7d) stored **hashed** with reuse detection; refresh in HttpOnly/Secure/SameSite cookie; access token in memory client-side.
- Validate (Zod) + sanitize all inputs; cap sizes/pagination. Helmet, HSTS, strict CORS allowlist, TLS.
- Secrets only from Secrets Manager/env (Zod-validated); never committed (gitleaks). Least-privilege IAM.
- Redact PII/secrets from logs; audit security events. Scan deps (npm audit/Trivy/CodeQL).
- Frontend: CSP, escape output (no `dangerouslySetInnerHTML` with untrusted), CSRF defense for cookie endpoints.

## Checklist

- [ ] authn + authz + ownership on protected routes
- [ ] Inputs validated + sanitized; sizes capped
- [ ] Tokens: rotation, reuse detection, hashed storage, short TTL
- [ ] Secrets not in code/logs; redaction on
- [ ] Rate limiting on auth/sensitive endpoints
- [ ] Headers (Helmet/CSP/HSTS) + CORS allowlist + TLS
- [ ] Deps scanned; no high/critical
- [ ] OWASP Top 10 mapped

## Anti-Patterns

- Trusting client-supplied user/role/ownership IDs.
- Access tokens in localStorage; long-lived non-revocable tokens.
- Verbose error messages leaking internals / enabling enumeration.
- Logging tokens, passwords, raw emails.
- Wildcard CORS with credentials; disabling Helmet "to fix a bug".
- Relaxing security "because it's urgent" (mitigate first instead).

## Examples

- Refresh rotation with family revoke on reuse (theft signal).
- `cors({ origin: allowlist, credentials: true })` per env.
- Winston redaction format stripping `authorization`, `password`, `token`, `refreshToken`, `cookie` before transports.
