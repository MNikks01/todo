/** RBAC roles (docs/security.md §3). Cross-cutting, so it lives in core. */
export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];
