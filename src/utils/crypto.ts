import { createHash } from "crypto";

/**
 * One-way hash of an IP address.
 *
 * We want to spot the same source submitting fifty leads, but we do not want to
 * store the visitor's raw IP — that is personal data under most privacy regimes
 * and it buys us nothing. Hashing with a server-side salt keeps it comparable
 * without keeping it identifying.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "skyline-residences-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 64);
}
