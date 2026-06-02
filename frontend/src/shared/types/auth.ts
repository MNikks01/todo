/** Auth/user types mirroring the backend User DTO (docs/api/openapi.yaml). */
export type Role = 'user' | 'admin';
export type AccountStatus = 'active' | 'disabled';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SessionResponse {
  user: AuthUser;
  accessToken: string;
}
