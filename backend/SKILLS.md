# backend/SKILLS.md

Skills that apply to the backend. Full docs in [../.claude/skills/](../.claude/skills/).

| Skill              | File                                             | Why here                                   |
| ------------------ | ------------------------------------------------ | ------------------------------------------ |
| Node.js / Express  | [node.md](../.claude/skills/node.md)             | app structure, middleware, async, shutdown |
| TypeScript         | [typescript.md](../.claude/skills/typescript.md) | strict typing, DTOs, no `any`              |
| MongoDB / Mongoose | [mongodb.md](../.claude/skills/mongodb.md)       | schema, indexes, repository, transactions  |
| Security           | [security.md](../.claude/skills/security.md)     | authn/z, tokens, validation, rate limiting |
| Testing            | [testing.md](../.claude/skills/testing.md)       | unit/integration/API tests                 |

**Quick checklist before a backend PR:** clean layering · controller has no business logic · Zod validation · authz + ownership enforced & tested · no `any`/no leaked Mongoose · structured logging + correlation id · no PII/secrets in logs · indexes for new queries · tests + coverage.
