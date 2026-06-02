# ADR-0006: MongoDB + Mongoose as the Datastore

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, Backend
- **Context tags:** backend, data

## Context

We need a datastore for users, todos, refresh tokens, and audit logs that is cheap for non-prod, flexible for evolving todo fields, and well-supported in the Node/TS ecosystem. Multi-document transactional needs are limited (essentially refresh-token rotation).

## Decision

Use **MongoDB** with **Mongoose**. Atlas free/shared tier for local/dev/qa; Atlas dedicated (or DocumentDB) for staging/prod. Access only through the **Repository** layer; Mongoose stays in `infrastructure/`.

## Options Considered

1. **MongoDB + Mongoose (chosen)** — _Pro:_ document model fits flexible todos (tags/metadata), Atlas free tier (~$0 non-prod), schema + middleware via Mongoose, replica-set transactions when needed. _Con:_ weaker cross-document ACID than SQL; easy to write unindexed/cross-tenant queries if undisciplined.
2. **PostgreSQL + Prisma** — _Pro:_ strong relational integrity, transactions, mature. _Con:_ rigid schema for evolving fields; more migration overhead; no free managed tier as trivially as Atlas M0; relational modeling is overkill for this domain. Reasonable alternative — deferred.
3. **DynamoDB** — _Pro:_ serverless, cheap at low scale. _Con:_ access-pattern-first modeling is heavy for a learning CRUD app; weaker ad-hoc query/search. Rejected.

## Consequences

- Positive: low cost, flexible schema, fast iteration, managed ops via Atlas.
- Negative: must enforce **indexes** (no COLLSCAN in hot paths) and **ownership scoping** (`{ _id, userId }`) by discipline + tests; transactions require a replica set.
- Mitigations: index policy + `explain()` checks in tests (`docs/database.md`), repository abstraction enabling an in-memory impl for unit tests, and a documented future sharding key (`{ userId: 1 }`).
- Revisit trigger: strong relational/reporting needs or transactional complexity → reconsider PostgreSQL.

## Links

`docs/database.md`; `docs/architecture.md` §9; `.claude/skills/mongodb.md`.
