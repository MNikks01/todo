/**
 * Password hashing (docs/security.md §2.1).
 *
 * argon2id — slow, salted KDF appropriate for low-entropy human passwords.
 * Behind an interface so the domain/application layers depend on an abstraction,
 * and tests can substitute a fast fake.
 */
import argon2 from 'argon2';

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      // Malformed hash etc. — treat as a failed verification, never throw.
      return false;
    }
  }
}

export function createPasswordHasher(): PasswordHasher {
  return new Argon2PasswordHasher();
}
