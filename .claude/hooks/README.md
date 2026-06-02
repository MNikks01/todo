# .claude/hooks/ — Event Automation

Hooks run automatically on Claude Code lifecycle events to **enforce rules without relying on memory**. They are configured in `settings.json` (`hooks` block); this folder documents intent and houses any scripts they call.

## Event types (Claude Code)

| Event                      | Use here                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `PreToolUse`               | Block edits to forbidden paths (e.g., committing `.env`); warn before destructive ops |
| `PostToolUse`              | After an Edit/Write: run formatter, lint the touched file, type-check                 |
| `UserPromptSubmit`         | Inject reminders (current roadmap phase, Documentation-First)                         |
| `Stop` / `SubagentStop`    | Final checks: "did docs/tests get updated for this change?"                           |
| `PreCommit` (via git hook) | gitleaks secret scan, commitlint, lint-staged                                         |

## Planned hooks (to wire in Phase 1)

1. **secret-guard** (PreToolUse): refuse writes that add secrets or touch `.env` with real values.
2. **format-on-write** (PostToolUse): Prettier + ESLint --fix on edited TS files.
3. **typecheck-on-stop** (Stop): run `tsc --noEmit` on the affected package.
4. **doc-reminder** (Stop): if code changed but no doc/CLAUDE.md/test changed, warn (Documentation-First).
5. **phase-guard** (UserPromptSubmit): remind which roadmap phase is active; discourage jumping ahead.

## Example (conceptual settings.json)

```jsonc
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": ".claude/hooks/format-on-write.sh" }],
      },
    ],
  },
}
```

## Rules

- Hooks must be fast and non-interactive. They enforce `rules/`; they don't replace human/agent review.
- Scripts live here, are version-controlled, and contain no secrets.
