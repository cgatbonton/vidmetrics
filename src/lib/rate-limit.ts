import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { errorResponse } from "@/lib/errors";

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

const redis = getRedis();

function createLimiter(limiter: ReturnType<typeof Ratelimit.slidingWindow>, prefix: string): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter, prefix });
}

// --- Tier limiters (module-level singletons, safe in serverless — no in-memory state) ---

export const analyzeLimiter = createLimiter(Ratelimit.slidingWindow(5, "1 m"), "rl:analyze");
export const analyzeAuthLimiter = createLimiter(Ratelimit.slidingWindow(15, "1 m"), "rl:analyze:auth");
export const authLimiter = createLimiter(Ratelimit.slidingWindow(5, "15 m"), "rl:auth");
export const crudLimiter = createLimiter(Ratelimit.slidingWindow(30, "1 m"), "rl:crud");

// --- Helpers ---

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult =
  | { limited: false }
  | { limited: true; response: Response };

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) return { limited: false };

  try {
    const { success, reset } = await limiter.limit(identifier);

    if (success) return { limited: false };

    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    const response = errorResponse("RATE_LIMITED");
    response.headers.set("Retry-After", String(retryAfter));

    return { limited: true, response };
  } catch {
    // Fail open — if Redis is down, allow the request rather than blocking all traffic
    return { limited: false };
  }
}
