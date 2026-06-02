/**
 * Auth controller — thin HTTP adapter (rules/architecture.md). Validates inputs
 * (via middleware), delegates to AuthService, shapes responses, manages cookies.
 * No business logic here.
 */
import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../../core/errors/index.js';
import type { UserService } from '../../users/application/userService.js';
import { toUserDto } from '../../users/domain/user.js';
import type { AuthService } from '../application/authService.js';
import { clearSessionCookies, REFRESH_COOKIE, setSessionCookies } from './authCookies.js';
import type { LoginInput, RegisterInput } from './authSchemas.js';

function readRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
}

export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserService,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RegisterInput;
    const user = await this.auth.register(body);
    res.status(201).json({ user });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as LoginInput;
    const session = await this.auth.login(body);
    setSessionCookies(res, session.refreshToken, session.csrfToken);
    res.status(200).json({ user: session.user, accessToken: session.accessToken });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = readRefreshCookie(req);
    if (!refreshToken) {
      throw new UnauthorizedError('No active session');
    }
    const session = await this.auth.refresh(refreshToken);
    setSessionCookies(res, session.refreshToken, session.csrfToken);
    res.status(200).json({ user: session.user, accessToken: session.accessToken });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    await this.auth.logout(readRefreshCookie(req));
    clearSessionCookies(res);
    res.status(204).send();
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    // Bearer-protected route → req.user is guaranteed by auth middleware.
    await this.auth.logoutAll(req.user!.id);
    clearSessionCookies(res);
    res.status(204).send();
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.users.getById(req.user!.id);
    res.status(200).json({ user: toUserDto(user) });
  };
}
