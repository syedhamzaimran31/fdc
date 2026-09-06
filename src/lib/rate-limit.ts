import { RATE_LIMIT } from "@/constants/api";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Per-process and therefore insufficient on its own: it resets on deploy and
 * does not coordinate across instances. It stops one person hammering the
 * endpoint, not a distributed attack. Swap the Map for Upstash Redis before
 * this runs paid traffic — the signatures below do not change.
 */
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number = RATE_LIMIT.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT.WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/** Called opportunistically so the Map cannot grow without bound. */
export function pruneRateLimitBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
