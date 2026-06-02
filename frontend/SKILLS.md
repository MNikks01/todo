# frontend/SKILLS.md

Skills that apply to the frontend. Full docs in [../.claude/skills/](../.claude/skills/).

| Skill      | File                                             | Why here                                  |
| ---------- | ------------------------------------------------ | ----------------------------------------- |
| React      | [react.md](../.claude/skills/react.md)           | components, hooks, Query/Zustand patterns |
| TypeScript | [typescript.md](../.claude/skills/typescript.md) | strict typing, no `any`                   |
| Testing    | [testing.md](../.claude/skills/testing.md)       | RTL, MSW, component/integration tests     |
| Security   | [security.md](../.claude/skills/security.md)     | token storage, XSS/CSRF, CSP              |

**Quick checklist before a frontend PR:** server state in React Query · UI state in Zustand · no cross-feature imports · typed, no `any` · loading/error states · a11y roles · tests + coverage · no secrets in bundle.
