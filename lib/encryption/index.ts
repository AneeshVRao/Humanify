/**
 * Encryption Utility
 *
 * Security Engineer: Encrypt sensitive data like API keys
 * Uses AES-256-GCM for encryption
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Get and validate encryption key
 * Only validates when encryption is actually used
 */
function getEncryptionKey(): Buffer {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  if (!ENCRYPTION_KEY) {
    throw new Error(
      "ENCRYPTION_KEY is not defined. Generate with: openssl rand -hex 32"
    );
  }

  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate with: openssl rand -hex 32"
    );
  }

  return Buffer.from(ENCRYPTION_KEY, "hex");
}

/**
 * Encrypt a string (e.g., API key)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Validate that a string can be decrypted
 */
export function isValidEncrypted(encryptedText: string): boolean {
  try {
    const parts = encryptedText.split(":");
    return parts.length === 3;
  } catch {
    return false;
  }
}
