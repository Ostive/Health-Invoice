import { headers } from 'next/headers';

interface Bucket {
    count: number;
    resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
    limit: number;
    windowSeconds: number;
}

export async function getClientIp(): Promise<string> {
    const h = await headers();
    const forwarded = h.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return h.get('x-real-ip') || 'unknown';
}

/**
 * Fixed-window in-memory rate limit keyed on IP + action.
 * Fine for a single-instance deployment; if you run multiple instances
 * replace the Map with Redis (Upstash, etc.).
 */
export async function enforceIpRateLimit(
    action: string,
    { limit, windowSeconds }: RateLimitOptions
): Promise<{ allowed: boolean; retryAfter: number }> {
    const ip = await getClientIp();
    const key = `${action}:${ip}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
        return { allowed: true, retryAfter: 0 };
    }

    if (bucket.count >= limit) {
        return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
    }

    bucket.count += 1;
    return { allowed: true, retryAfter: 0 };
}

// Sweep expired buckets every 5 minutes to prevent unbounded growth
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, bucket] of buckets.entries()) {
            if (bucket.resetAt <= now) buckets.delete(key);
        }
    }, 5 * 60 * 1000).unref?.();
}
