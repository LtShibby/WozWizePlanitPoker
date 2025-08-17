type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

export function tokenBucket(key: string, capacity: number, refillPerMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: capacity, last: now };
  const elapsed = now - b.last;
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerMs);
  b.last = now;
  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(key, b);
    return true;
  }
  buckets.set(key, b);
  return false;
}

export function makeLimiter(capacity: number, perMs: number) {
  const refill = capacity / perMs; // tokens per ms
  return (key: string) => tokenBucket(key, capacity, refill);
}
