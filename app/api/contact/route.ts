import { NextResponse } from 'next/server'
import { validateContactInput, type ContactPayload } from '@/lib/contact'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

type ContactSubmission = ContactPayload & {
  source: string
  submittedAt: string
  ip: string
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

async function deliver(payload: ContactSubmission) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL

  if (!webhookUrl) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false as const, reason: 'not_configured' as const }
    }

    console.info('[contact] CONTACT_WEBHOOK_URL no configurado. Envío recibido:', payload)
    return { ok: true as const }
  }

  const secret = process.env.CONTACT_WEBHOOK_SECRET

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      console.error(`[contact] El webhook respondió ${response.status}`)
      return { ok: false as const, reason: 'delivery_failed' as const }
    }

    return { ok: true as const }
  } catch (error) {
    console.error('[contact] Error enviando el webhook:', error)
    return { ok: false as const, reason: 'delivery_failed' as const }
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  const limit = rateLimit(`contact:${ip}`, { limit: MAX_REQUESTS, windowMs: WINDOW_MS })

  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retryAfter: limit.retryAfter },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const validation = validateContactInput(body)

  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 422 })
  }

  const result = await deliver({
    ...validation.data,
    source: 'bisni.es/contacto',
    submittedAt: new Date().toISOString(),
    ip,
  })

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.reason },
      { status: result.reason === 'not_configured' ? 503 : 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
