# Security Strategy & Controls

> **Status:** Draft v1.0 · **Owner:** Security Engineer · Defense-in-depth across edge, app, data, infra, and client.
> Every control here maps to a requirement and is verified in the Security Review gate.

---

## 1. Threat Model (STRIDE, abbreviated)

| Threat                     | Example                 | Primary mitigation                                                    |
| -------------------------- | ----------------------- | --------------------------------------------------------------------- |
| **S**poofing               | Forged identity         | JWT signature verification, short TTL, refresh rotation               |
| **T**ampering              | Modified request/body   | TLS, Zod validation, Mongoose schema, integrity checks                |
| **R**epudiation            | "I didn't do that"      | Audit logs with correlation IDs, immutable log sink                   |
| **I**nfo disclosure        | Data/secret leak        | Least-privilege IAM, Secrets Manager, PII redaction, ownership checks |
| **D**enial of service      | Flood/expensive queries | Rate limiting, body-size limits, pagination caps, WAF                 |
| **E**levation of privilege | user→admin              | Server-side RBAC, ownership checks in service layer                   |

OWASP Top 10 (2021) mapping is in §9.

---

## 2. Authentication

### 2.1 Passwords

- Hash with **argon2id** (preferred) or **bcrypt** (cost ≥ 12). Never store plaintext.
- Enforce password policy (min length, breach-list check optional). Generic error messages ("invalid credentials") to avoid user enumeration.
- Constant-time comparison via the hashing library.

### 2.2 Access Tokens (JWT)

- **Short-lived** (15 min). Signed with RS256 (asymmetric) or HS256 with a strong secret from Secrets Manager.
- Claims: `sub` (userId), `role`, `iat`, `exp`, `jti`. **No PII** in the token.
- Sent via `Authorization: Bearer`. Verified on every protected route.
- **Cannot be revoked individually** by design → keep TTL short; revocation happens at refresh.

### 2.3 Refresh Tokens

- **Long-lived** (7 days), opaque random (256-bit, CSPRNG) — _not_ a JWT.
- Stored **hashed** (SHA-256) in `refreshTokens` collection with `userId`, `expiresAt` (TTL index), `family`, `usedAt`.
  - **Hashing rationale:** SHA-256 (fast, no salt) is correct _only because_ the token is high-entropy random and unguessable — there is nothing to brute-force. This is deliberately **different from password hashing**, which uses **argon2id** (slow, salted) because passwords are low-entropy and human-chosen. Do not conflate the two: never SHA-256 a password, never argon2 a random token.
- Delivered to browser as an **`HttpOnly; Secure; SameSite=Strict` cookie** (not accessible to JS → XSS-resistant), scoped `Path=/api/v1/auth` so it is only sent to auth endpoints.
- **Rotation:** each use issues a new refresh token and invalidates the old one.
- **Reuse detection:** if an already-used (rotated-out) token is presented, the entire token _family_ is revoked (indicates theft) and the user must re-auth.

### 2.4 Session lifecycle

- **Logout:** delete current refresh token.
- **Logout-all:** delete all refresh tokens for the user (e.g., after password change or suspected compromise).
- **Password reset / change** → revoke all refresh tokens.

### 2.5 Brute-force & Account Lockout

- **Per-IP** rate limit on `/auth/login` (e.g., 5/min) — first line, blocks naive floods.
- **Per-account** throttling keyed on the submitted email (independent of IP, defeats distributed attempts):
  - Track consecutive failures (counter + window, Redis in prod / memory locally).
  - **Progressive delay** after 3 failures; **temporary lock** (e.g., 15 min) after 10 failures within 15 min.
  - Counter **resets on successful login** or after the window expires.
  - Locked attempts still return the **generic** "invalid credentials" (no "account locked" disclosure that aids enumeration); optionally email the account owner on lock.
- A failure spike across accounts triggers the **auth-failure alarm** (`docs/monitoring.md`) as a possible credential-stuffing signal.
- **Password-reset** and **register** endpoints are also rate-limited (anti-enumeration / anti-abuse).

---

## 3. Authorization (RBAC)

- Roles: `user`, `admin`. Stored on the user document; encoded in access token `role`.
- **`rbac.middleware.ts`** guards routes by required role.
- **Ownership checks** happen in the service/repository layer: every todo query is scoped `{ _id, userId }`. Never trust a client-supplied `userId`.
- Admin actions are additionally **audit-logged**.
- Principle: **the frontend only hints UI; the backend is the authority.**

---

## 4. API Security

| Control                  | Implementation                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **TLS**                  | ACM cert at ALB/CloudFront; HSTS header; redirect HTTP→HTTPS                                               |
| **Helmet**               | Sets secure headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)                        |
| **CORS**                 | Strict allowlist of known frontend origins per env; credentials enabled only for those origins             |
| **Rate limiting**        | Global per-IP; stricter on `/auth/*` (e.g., 5/min login). Backed by memory locally, Redis in prod          |
| **Input validation**     | Zod schemas at the interface layer for body/params/query before business logic                             |
| **Sanitization**         | Strip `$`/`.` operators to block NoSQL/operator injection; reject unexpected keys                          |
| **Body limits**          | `express.json({ limit: '10kb' })`; pagination max page size                                                |
| **Compression**          | `compression` middleware (guard against BREACH: don't compress sensitive responses with reflected secrets) |
| **HTTP param pollution** | Reject duplicate query params where unexpected                                                             |
| **No verbose errors**    | Error handler returns safe messages; stack traces only in non-prod logs                                    |

---

## 5. Secrets & Configuration

- **Source of truth:** AWS **Secrets Manager** (DB URI, JWT keys, mail creds). Fetched at boot, cached in memory.
- **Never** commit secrets. `.env.example` documents _names only_. `gitleaks` in CI blocks accidental commits.
- IAM task/instance role grants read to only the specific secret ARNs (least privilege).
- Config validated by Zod at startup; app refuses to boot on missing/invalid config (fail fast).
- Rotation runbook: `infrastructure/aws/runbooks/rotate-keys`.

---

## 6. Database Security

- **Auth & TLS** to MongoDB; DB user with least privilege (no admin from app).
- **Network:** DB reachable only from app subnet/security group (or Atlas IP allowlist / private endpoint).
- **Injection protection:** parameterized via Mongoose; operator sanitization; never build queries from raw user strings.
- **Indexes** enforce uniqueness (`email`) and bound query cost (prevents DoS via slow queries).
- **Ownership** enforced in queries; soft-delete preserves recoverability.
- See `docs/database.md`.

---

## 7. Infrastructure Security

- **VPC:** public subnets (ALB only) + private subnets (app, DB egress via NAT). DB not publicly reachable.
- **Security Groups:** least access — ALB SG allows 443 from internet; app SG allows traffic only from ALB SG; DB SG allows only app SG.
- **IAM:** roles not users for compute; least-privilege policies; no wildcard `*` resources where avoidable; access keys avoided in favor of instance/task roles and GitHub OIDC.
- **WAF** (prod tier): managed rule sets (SQLi/XSS/bad bots), rate-based rules.
- **Patching:** base images rebuilt regularly; Trivy scans images in CI.
- **SSH:** via SSM Session Manager (no open port 22) in prod.

---

## 8. Frontend Security

| Concern             | Strategy                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Token storage**   | Access token in **memory** (module/store), refresh token in **HttpOnly cookie**. Never localStorage (XSS-exfiltration risk). |
| **XSS**             | React escapes by default; never `dangerouslySetInnerHTML` with untrusted data; strict CSP; sanitize any markdown             |
| **CSRF**            | See §8.1 — Bearer-token API is CSRF-immune; cookie-bearing auth endpoints use double-submit token + SameSite.                |
| **Dependency risk** | `npm audit`, Dependabot, lockfile integrity                                                                                  |
| **Clickjacking**    | `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'`                                                                       |
| **Secrets**         | No secrets in frontend bundle; only public config (API base URL)                                                             |

### 8.1 CSRF Defense — full specification

**Why two different stances?** CSRF only works when the browser **automatically attaches** an ambient credential to a forged cross-site request. That applies to **cookies**, not to the `Authorization` header.

**A. Business/state-changing API (todos CRUD, admin, logout-all): CSRF-immune by design.**

- Authorized with the **access token in the `Authorization: Bearer` header**, read from in-memory store and attached by the Axios interceptor.
- The browser never auto-attaches this header on a cross-site request, and the token is not in a cookie, so a forged request carries no credential. **No CSRF token needed** for these routes.
- (CORS allowlist + custom header requirement add defense-in-depth: the `Authorization` header is non-simple, forcing a preflight that a cross-site attacker cannot satisfy.)

**B. Cookie-bearing auth endpoints (`POST /auth/refresh`, `POST /auth/logout`): explicit CSRF protection.**
These send the `HttpOnly` refresh cookie automatically, so they need their own defense. We layer three controls:

1. **SameSite cookie (primary):** the refresh cookie is `SameSite=Strict` — browsers will not attach it to cross-site requests at all, neutralizing classic CSRF. See §8.2 for why this holds given our domain layout.
2. **Double-submit CSRF token (defense-in-depth):**
   - On login (and on each refresh) the server sets a **second, non-`HttpOnly`** cookie `csrfToken=<random>` (`Secure; SameSite=Strict`, readable by JS).
   - The SPA reads `csrfToken` and echoes it in an **`X-CSRF-Token` header** on every call to `/auth/refresh` and `/auth/logout`.
   - The server validates `header === cookie` (constant-time compare). A cross-site attacker cannot read the cookie value (SOP) to forge the header, so the request fails even if SameSite were somehow bypassed.
   - The CSRF token is **bound to the session/refresh family** and rotated alongside the refresh token.
3. **Origin/Referer check (cheap backstop):** auth endpoints additionally verify the `Origin` header is in the CORS allowlist.

**Logout-all** is a Bearer-authorized API call (category A), so it follows the CSRF-immune path; plain cookie `logout` (clearing the session) is category B.

### 8.2 Cookie Domain & SameSite Topology (decision)

- **Decision:** the SPA and API are served from **subdomains of one registrable domain** — `app.<domain>` (CloudFront/S3) and `api.<domain>` (ALB/EC2).
- `SameSite` is evaluated on the **registrable domain (eTLD+1)**, not the subdomain. Because `app.<domain>` and `api.<domain>` share the same eTLD+1, requests between them are **same-site** (though cross-origin). Therefore **`SameSite=Strict` works** for the refresh cookie and is our choice.
- The cookie is issued by the API for its own host with `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/api/v1/auth`. (We do **not** set a broad `Domain=` attribute — the cookie stays host-only to the API.)
- **Rejected alternative:** hosting SPA and API on **different registrable domains** would make requests cross-site, forcing `SameSite=None; Secure` (cookie sent cross-site) and leaning entirely on the double-submit token for CSRF — weaker and avoidable. If that topology is ever required, it needs its own ADR.
- Cross-**origin** (same-site) calls still require the **CORS allowlist** to explicitly permit `https://app.<domain>` with `credentials: true`.

---

## 9. OWASP Top 10 (2021) Mapping

| Risk                            | Mitigation                                                        |
| ------------------------------- | ----------------------------------------------------------------- |
| A01 Broken Access Control       | Server-side RBAC + ownership checks; deny by default              |
| A02 Cryptographic Failures      | TLS everywhere; argon2; secrets in Secrets Manager                |
| A03 Injection                   | Zod + Mongoose + operator sanitization                            |
| A04 Insecure Design             | Threat model, this doc, review gates                              |
| A05 Security Misconfiguration   | Helmet, hardened SGs, least-priv IAM, no default creds            |
| A06 Vulnerable Components       | Trivy/npm audit/Dependabot/CodeQL                                 |
| A07 Auth Failures               | Rotation, reuse detection, rate limiting, lockout, generic errors |
| A08 Software/Data Integrity     | Signed images, immutable tags, lockfiles, OIDC                    |
| A09 Logging/Monitoring Failures | Structured logs, audit log, alarms, correlation IDs               |
| A10 SSRF                        | No user-controlled outbound URLs; egress restricted               |

---

## 10. Logging & Monitoring Security

- **PII redaction:** a custom Winston format redacts `email`, `password`, `authorization`, `token`, `refreshToken`, `cookie` before transports. Emails hashed/partially masked if needed for correlation.
- **Audit log** (`auditLogs` collection + CloudWatch): login success/failure, logout-all, role change, account disable, admin reads. Append-only mindset.
- **Alerting:** spike in auth failures, 5xx, unusual admin activity → SNS. (See `docs/monitoring.md`.)
- Logs retained per env; production logs encrypted at rest (CloudWatch default) and access-controlled by IAM.

### 10.1 Data Classification & Retention

| Data                      | Class               | At rest              | Retention                                           | Notes                                              |
| ------------------------- | ------------------- | -------------------- | --------------------------------------------------- | -------------------------------------------------- |
| `email`                   | **PII**             | encrypted (DB/Atlas) | life of account                                     | masked/hashed in logs; deleted on account deletion |
| `passwordHash`            | **secret**          | argon2id             | life of account                                     | never logged/returned                              |
| `refreshTokens.tokenHash` | **secret**          | SHA-256              | TTL 7d (auto-expire)                                | never logged                                       |
| `todos.*`                 | **user content**    | encrypted            | life of account; soft-delete + 30d then hard-delete | owner-scoped                                       |
| `auditLogs`               | **security record** | encrypted            | 90–365d                                             | no raw PII (use ids); append-only                  |
| App logs                  | **operational**     | CloudWatch encrypted | dev 7d / staging 14d / prod 30–90d                  | PII/secrets redacted                               |

- **Account deletion / right-to-erasure:** hard-delete user + todos; retain minimal audit records keyed by id (no raw PII) for security/forensics.
- Encryption in transit (TLS) everywhere; at rest via managed-service defaults (Atlas, CloudWatch, S3 SSE).

---

## 11. Security Review Checklist (gate)

- [ ] No secrets in code/commits (gitleaks clean)
- [ ] All new routes have authn + authz + validation
- [ ] Ownership enforced & tested for resource access
- [ ] No `any`; inputs validated; outputs shaped by DTO
- [ ] Rate limits + per-account lockout on auth endpoints
- [ ] Cookie-bearing endpoints have CSRF protection (SameSite + double-submit); Bearer API confirmed CSRF-immune
- [ ] Errors don't leak internals
- [ ] Dependencies scanned, no high/critical unresolved
- [ ] Logs free of PII/secrets
- [ ] Threat model updated if attack surface changed
