/**
 * Simple in-memory sliding-window rate limiter.
 * Good for a single Node instance; swap for Redis/Upstash in a multi-instance deploy.
 */
type Bucket = { hits: number[]; };
const g = globalThis as unknown as { __rl?: Map<string, Bucket> };
const store = (g.__rl ??= new Map());

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const b = store.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t: number) => now - t < windowMs);
  if (b.hits.length >= limit) {
    const retryAfterSec = Math.ceil((windowMs - (now - b.hits[0])) / 1000);
    store.set(key, b);
    return { ok: false, remaining: 0, retryAfterSec };
  }
  b.hits.push(now);
  store.set(key, b);
  // opportunistic cleanup
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.hits.every((t: number) => now - t > windowMs)) store.delete(k);
  }
  return { ok: true, remaining: limit - b.hits.length, retryAfterSec: 0 };
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}
