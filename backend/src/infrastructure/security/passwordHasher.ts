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
  /**
   * A valid hash to verify against when no user exists, so login does the same
   * work whether or not the email is known (defeats timing-based user
   * enumeration — docs/security.md §2.5, SF-1).
   */
  dummyHash(): string;
}

// Precomputed argon2id hash of a throwaway value; verifying a wrong password
// against it costs the same as a genuine miss.
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$JW7GCf3NBCw1LDcRT3OHgQ$DFQDTp39S6DuxVrp7Z2WgnV8ze/Y9sqMyGyq9Z1Ddp4';

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

  dummyHash(): string {
    return DUMMY_HASH;
  }
}

export function createPasswordHasher(): PasswordHasher {
  return new Argon2PasswordHasher();
}
