import { beforeEach, describe, expect, it } from 'vitest'
import { rateLimit, resetRateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
  })

  it('permite peticiones dentro del límite', () => {
    expect(rateLimit('ip-1', { limit: 2, windowMs: 60_000 })).toMatchObject({ ok: true })
    expect(rateLimit('ip-1', { limit: 2, windowMs: 60_000 })).toMatchObject({ ok: true, remaining: 0 })
  })

  it('bloquea al superar el límite e indica cuándo reintentar', () => {
    rateLimit('ip-2', { limit: 1, windowMs: 60_000 })
    const blocked = rateLimit('ip-2', { limit: 1, windowMs: 60_000 })

    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('aísla el contador por clave', () => {
    rateLimit('ip-3', { limit: 1 })
    expect(rateLimit('ip-4', { limit: 1 }).ok).toBe(true)
  })

  it('reinicia la ventana al expirar', () => {
    rateLimit('ip-5', { limit: 1, windowMs: 1 })
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(rateLimit('ip-5', { limit: 1, windowMs: 1 }).ok).toBe(true)
        resolve(null)
      }, 10)
    })
  })
})
