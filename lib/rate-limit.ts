type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export type RateLimitResult = {
  ok: boolean
  remaining: number
  /** Segundos que faltan para que la ventana se reinicie. */
  retryAfter: number
}

/**
 * Rate limit en memoria, suficiente para una sola instancia.
 * En un despliegue con varias instancias/servers conviene moverlo a
 * Upstash Redis, Vercel KV o similar.
 */
export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 }
}

/** Solo para tests: vacía el estado en memoria. */
export function resetRateLimit() {
  buckets.clear()
}
