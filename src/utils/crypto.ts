import { createHash } from "crypto";

/**
 * Lets us spot one source sending fifty leads without storing anyone's raw IP,
 * which is personal data and buys us nothing.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "skyline-residences-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 64);
}
