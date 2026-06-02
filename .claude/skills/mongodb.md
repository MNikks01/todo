# Skill: MongoDB / Mongoose

## Best Practices

- Access only via the **Repository** layer; keep Mongoose in `infrastructure/`. Map documents → domain DTOs.
- Design indexes for every hot query; verify with `explain()` (no COLLSCAN). Compound index order = equality → sort → range.
- Scope all user data by `userId`; combine with `deletedAt: null` for soft-delete.
- `.lean()` for read lists; project only needed fields; cap pagination page size.
- Unique indexes for invariants (`email`); TTL index for ephemeral data (refresh tokens).
- Multi-doc atomicity via sessions/transactions on a replica set (refresh rotation).
- Sanitize inputs (strip `$`/`.`) to prevent operator injection.

## Checklist

- [ ] New query backed by an index (`explain` checked)
- [ ] Queries scoped by `userId` (+ `deletedAt`)
- [ ] No client-supplied `userId` trusted
- [ ] Pagination capped; projection used; `.lean()` on lists
- [ ] Unique/TTL indexes where needed
- [ ] Transactions for multi-doc invariants
- [ ] Mongoose not leaked past infrastructure

## Anti-Patterns

- Querying by `_id` alone for user-scoped resources (cross-tenant leak).
- Unindexed/regex-prefix scans on large collections.
- Embedding unbounded growing arrays (todos inside user).
- Returning raw documents (incl. `passwordHash`) to clients.
- Building filters directly from `req.query` without validation/sanitization.

## Examples

- Index: `{ userId: 1, completed: 1, dueDate: 1 }` for list+filter+sort.
- Repo: `findByIdForUser(id, userId)` → `findOne({ _id: id, userId, deletedAt: null }).lean()`.
- Rotation txn: in `session` — mark old token used, insert new; on reuse, delete family.
