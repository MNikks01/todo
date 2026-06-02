# Skill: TypeScript

## Best Practices

- `strict` everywhere (`strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess`).
- Model the domain with types: discriminated unions, branded types for IDs, `readonly` where possible.
- Derive types from a single source: Zod schemas → `z.infer` for DTOs; avoid duplicate hand-written types.
- Use `unknown` at boundaries, narrow with guards/schemas. Generics over `any`.
- Prefer `type` for unions/DTOs, `interface` for extensible object contracts.
- Exhaustive `switch` with `never` default.

## Checklist

- [ ] No `any`, no unsafe `as`, no unexplained `@ts-ignore`
- [ ] Boundary inputs are `unknown` → validated/narrowed
- [ ] DTOs derived from Zod (`z.infer`)
- [ ] Null/undefined handled (no non-null `!` abuse)
- [ ] Exhaustive unions (`never` check)
- [ ] Public function signatures explicitly typed

## Anti-Patterns

- `any` to silence errors; `as unknown as X` casts.
- Duplicating types that could be inferred from schemas.
- Optional chaining hiding real null-handling bugs.
- Enums where union string literals are clearer/safer.

## Examples

- `const CreateTodo = z.object({ title: z.string().min(1).max(200) }).strict(); type CreateTodoDto = z.infer<typeof CreateTodo>;`
- `type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };`
- Branded id: `type UserId = string & { readonly __brand: 'UserId' }`.
