import { RATE_LIMIT } from "@/constants/api";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window rate limiter held in module memory.
 *
 * Deliberately simple, and deliberately documented as insufficient: it is
 * per-process, so it resets on deploy and does not coordinate across instances.
 * It is here to stop one bored person hammering the public endpoint, not to
 * stop a distributed attack. Before this page runs paid traffic, swap the Map
 * for Upstash Redis — the call signature below does not change.
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
