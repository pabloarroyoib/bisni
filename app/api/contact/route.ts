import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { validateContactInput, type ContactPayload } from '@/lib/contact'
import { buildContactMail } from '@/lib/contact-email'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

const DEFAULT_SMTP_HOST = 'smtp.zoho.com'
const DEFAULT_SMTP_PORT = 465

type ContactSubmission = ContactPayload & {
  source: string
  submittedAt: string
  ip: string
}

type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'delivery_failed' }

type SmtpConfig = {
  host: string
  port: number
  user: string
  pass: string
  from: string
  to: string
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/** Evita repetir el aviso en cada request cuando la config SMTP quedó a medias. */
let partialSmtpWarned = false

/**
 * Config SMTP de Zoho Mail. Devuelve `null` si falta alguna credencial, que es
 * lo que decide la precedencia de entrega: SMTP primero, webhook después.
 */
function readSmtpConfig(): SmtpConfig | null {
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const to = process.env.CONTACT_TO?.trim()

  // Config a medias (por ejemplo SMTP_USER y CONTACT_TO sin SMTP_PASS) hacía que
  // los envíos cayeran al canal siguiente sin dejar rastro. Se avisa una vez.
  const provided = [user, pass, to].filter(Boolean).length
  if (provided > 0 && provided < 3 && !partialSmtpWarned) {
    partialSmtpWarned = true
    console.warn(
      '[contact] Configuración SMTP incompleta: hacen falta SMTP_USER, SMTP_PASS y CONTACT_TO. Se usa el canal siguiente.',
    )
  }

  if (!user || !pass || !to) return null

  const parsedPort = Number.parseInt(process.env.SMTP_PORT ?? '', 10)
  const port = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_SMTP_PORT

  return {
    host: process.env.SMTP_HOST?.trim() || DEFAULT_SMTP_HOST,
    port,
    user,
    pass,
    from: process.env.CONTACT_FROM?.trim() || user,
    to,
  }
}

async function sendBySmtp(config: SmtpConfig, payload: ContactSubmission): Promise<DeliveryResult> {
  const mail = buildContactMail(
    {
      name: payload.name,
      company: payload.company,
      email: payload.email,
      message: payload.message,
    },
    {
      to: config.to,
      from: config.from,
      submittedAt: payload.submittedAt,
      source: payload.source,
    },
  )

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })

  try {
    await transport.sendMail({
      from: config.from,
      to: config.to,
      replyTo: payload.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    })

    return { ok: true }
  } catch (error) {
    // Solo el mensaje: nunca credenciales, la contraseña de aplicación ni el entorno.
    console.error(
      '[contact] Error enviando el email:',
      error instanceof Error ? error.message : 'error desconocido',
    )
    return { ok: false, reason: 'delivery_failed' }
  } finally {
    transport.close()
  }
}

async function deliver(payload: ContactSubmission): Promise<DeliveryResult> {
  const smtp = readSmtpConfig()

  // Precedencia explícita: SMTP (Zoho Mail) > webhook > log en desarrollo > 503.
  if (smtp) {
    return sendBySmtp(smtp, payload)
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL?.trim()

  if (!webhookUrl) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'not_configured' }
    }

    console.info('[contact] CONTACT_WEBHOOK_URL no configurado. Envío recibido:', payload)
    return { ok: true }
  }

  const secret = process.env.CONTACT_WEBHOOK_SECRET?.trim()

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
      return { ok: false, reason: 'delivery_failed' }
    }

    return { ok: true }
  } catch (error) {
    console.error(
      '[contact] Error enviando el webhook:',
      error instanceof Error ? error.message : 'error desconocido',
    )
    return { ok: false, reason: 'delivery_failed' }
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
