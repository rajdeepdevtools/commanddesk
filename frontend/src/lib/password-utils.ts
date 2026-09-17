import crypto from "crypto";

/**
 * Secure password hashing using PBKDF2 with SHA-512 and salt.
 * Compatible with all Node.js and Next.js server environments.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;

  // Support plain text comparison fallback if legacy password was saved
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }

  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;

  const hashToVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(originalHash, "hex"),
      Buffer.from(hashToVerify, "hex")
    );
  } catch {
    return false;
  }
}
