/**
 * User controller — admin operations. Thin adapter; audit-logs mutations
 * (docs/security.md §3, §10).
 */
import type { Request, Response } from 'express';
import type { Role } from '../../../core/types/roles.js';
import type { AuditLogger } from '../../auth/domain/auditLogger.js';
import type { UserService } from '../application/userService.js';
import { type AccountStatus, toUserDto } from '../domain/user.js';
import type { ListUsersQuery } from './userSchemas.js';

export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly audit: AuditLogger,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { limit, skip } = req.validatedQuery as ListUsersQuery;
    const users = await this.users.listUsers({ limit, skip });
    res.status(200).json({ users: users.map(toUserDto), pagination: { limit, skip } });
  };

  setRole = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: Role };
    const user = await this.users.setRole(id, role);
    await this.audit.record({
      action: 'user.role_changed',
      actorId: req.user!.id,
      targetId: id,
      metadata: { role },
    });
    res.status(200).json({ user: toUserDto(user) });
  };

  setStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: AccountStatus };
    const user = await this.users.setStatus(id, status);
    await this.audit.record({
      action: 'user.status_changed',
      actorId: req.user!.id,
      targetId: id,
      metadata: { status },
    });
    res.status(200).json({ user: toUserDto(user) });
  };
}
