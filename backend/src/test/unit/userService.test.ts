import { describe, expect, it, vi } from 'vitest';
import { UserService } from '../../modules/users/application/userService.js';
import type { SessionRevoker } from '../../modules/users/domain/sessionRevoker.js';
import { FakeUserRepository } from '../fakes.js';

function setup() {
  const repo = new FakeUserRepository();
  const revoker: SessionRevoker = { revokeAllForUser: vi.fn(() => Promise.resolve()) };
  const service = new UserService(repo, revoker);
  return { repo, revoker, service };
}

describe('UserService.setStatus (SF-2)', () => {
  it('revokes all sessions when an account is disabled', async () => {
    const { repo, revoker, service } = setup();
    const user = await repo.create({ email: 'a@b.com', passwordHash: 'h' });

    await service.setStatus(user.id, 'disabled');

    expect(revoker.revokeAllForUser).toHaveBeenCalledWith(user.id);
  });

  it('does not revoke sessions when re-enabling an account', async () => {
    const { repo, revoker, service } = setup();
    const user = await repo.create({ email: 'a@b.com', passwordHash: 'h' });

    await service.setStatus(user.id, 'active');

    expect(revoker.revokeAllForUser).not.toHaveBeenCalled();
  });

  it('throws NotFound for an unknown user', async () => {
    const { service } = setup();
    await expect(service.setStatus('507f1f77bcf86cd799439011', 'disabled')).rejects.toThrow(
      /not found/i,
    );
  });
});
