# Database Strategy — MongoDB

> **Status:** Draft v1.0 · **Owner:** Backend/Data · Engine: MongoDB (Atlas shared for non-prod, dedicated/DocumentDB for prod).
> Access only through the Repository layer; Mongoose models never leak past `infrastructure/`.

---

## 1. Why MongoDB

- Todo documents are naturally document-shaped with flexible fields (tags, metadata).
- Atlas free/shared tier makes non-prod environments cost ~$0.
- Familiar developer ergonomics; replica set gives multi-document transactions when needed.
- Tradeoff acknowledged in `architecture.md` §6: weaker cross-document ACID than SQL → mitigated with sessions/transactions where strictly needed.

---

## 2. Collections

### 2.1 `users`

| Field                   | Type                    | Notes                       |
| ----------------------- | ----------------------- | --------------------------- |
| `_id`                   | ObjectId                | PK                          |
| `email`                 | string                  | **unique**, lowercased, PII |
| `passwordHash`          | string                  | argon2id                    |
| `role`                  | enum `user\|admin`      | default `user`              |
| `status`                | enum `active\|disabled` | default `active`            |
| `createdAt`/`updatedAt` | Date                    | timestamps                  |

### 2.2 `todos`

| Field                   | Type                     | Notes                         |
| ----------------------- | ------------------------ | ----------------------------- |
| `_id`                   | ObjectId                 | PK                            |
| `userId`                | ObjectId                 | **owner**, indexed; ref users |
| `title`                 | string                   | required, ≤ 200               |
| `description`           | string                   | optional, ≤ 5000              |
| `completed`             | boolean                  | default false                 |
| `priority`              | enum `low\|medium\|high` | default medium                |
| `dueDate`               | Date                     | optional                      |
| `tags`                  | string[]                 | optional                      |
| `deletedAt`             | Date\|null               | soft-delete                   |
| `createdAt`/`updatedAt` | Date                     | timestamps                    |

### 2.3 `refreshTokens`

| Field                     | Type          | Notes                               |
| ------------------------- | ------------- | ----------------------------------- |
| `_id`                     | ObjectId      |                                     |
| `userId`                  | ObjectId      | indexed                             |
| `tokenHash`               | string        | SHA-256 of opaque token             |
| `family`                  | string (uuid) | rotation family for reuse detection |
| `expiresAt`               | Date          | **TTL index** auto-cleanup          |
| `usedAt`                  | Date\|null    | set on rotation                     |
| `createdByIp`/`userAgent` | string        | forensic context                    |

### 2.4 `auditLogs`

| Field           | Type           | Notes                     |
| --------------- | -------------- | ------------------------- |
| `_id`           | ObjectId       |                           |
| `actorId`       | ObjectId\|null | who                       |
| `action`        | string         | e.g. `auth.login.success` |
| `targetId`      | ObjectId\|null | affected entity           |
| `correlationId` | string         | ties to request logs      |
| `metadata`      | object         | non-PII context           |
| `createdAt`     | Date           | append-only               |

---

## 3. Indexes

| Collection    | Index                                     | Purpose                     |
| ------------- | ----------------------------------------- | --------------------------- |
| users         | `{ email: 1 }` unique                     | login lookup, no duplicates |
| todos         | `{ userId: 1, completed: 1, dueDate: 1 }` | primary list/filter/sort    |
| todos         | `{ userId: 1, createdAt: -1 }`            | recent listing              |
| todos         | text `{ title, description }`             | search                      |
| todos         | `{ userId: 1, tags: 1 }`                  | tag filter                  |
| refreshTokens | `{ tokenHash: 1 }` unique                 | fast verify                 |
| refreshTokens | `{ expiresAt: 1 }` TTL=0                  | auto-expire                 |
| refreshTokens | `{ userId: 1, family: 1 }`                | revoke family/all           |
| auditLogs     | `{ actorId: 1, createdAt: -1 }`           | audit queries               |

**Rule:** no unindexed query in a hot path. Every query reviewed against an index; `explain()` checked for COLLSCAN in tests.

---

## 4. Relationships & Patterns

- **Referencing** (not embedding) users↔todos: todos reference `userId`. Todos are independently queried/paginated, so referencing avoids unbounded document growth.
- **Ownership scoping:** every todo read/write filters `{ userId }` (and `{ deletedAt: null }` for active). Never query a todo by `_id` alone for a user-scoped action.
- **Soft delete:** set `deletedAt`; a scheduled job hard-deletes after retention (e.g., 30 days).

---

## 5. Query Patterns (examples, conceptual)

- List: `find({ userId, deletedAt: null, ...filters }).sort(...).skip().limit()` — capped page size (e.g., max 100).
- Search: `find({ userId, $text: { $search } })` with text index.
- Refresh rotation (transaction): in a session — validate old token, mark `usedAt`, insert new token; on reuse detection, delete whole family.

---

## 6. Performance Considerations

- Connection pooling tuned (`maxPoolSize`) to instance size; single Mongoose connection (singleton).
- Pagination cap + projection (return only needed fields).
- Avoid N+1: batch where needed; todos are single-collection so minimal joins.
- Monitor slow queries (Atlas profiler / `slowms`).
- Lean reads (`.lean()`) for list endpoints to skip hydration overhead.

---

## 7. Future Scaling

- **Read scaling:** secondary read preference for read-heavy reports.
- **Sharding (only if ever needed):** shard key `{ userId: 1 }` — co-locates a user's todos, supports targeted queries; documented but not implemented at learning scale.
- **Archival:** move old soft-deleted/audit data to cheaper storage (S3/Glacier) via export.
- **Caching:** ElastiCache/Redis in front of hot reads + rate-limit counters (Strategy pattern cache provider).

---

## 8. Migrations

- Expand/contract pattern for backward-compatible deploys: add fields/indexes first, backfill, then switch reads, then remove old.
- Index builds run in background; large index changes scheduled off-peak.
- Migration scripts in `scripts/ops/`, versioned and idempotent.

---

## 9. Backups & DR (see `docs/architecture.md` §14)

- Atlas continuous backup / snapshots; periodic export to versioned S3 with lifecycle to Glacier.
- Restore drill documented in `infrastructure/aws/runbooks/restore`.
