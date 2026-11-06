import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildContactMail } from '@/lib/contact-email'
import { resetRateLimit } from '@/lib/rate-limit'
import { POST } from '@/app/api/contact/route'

const payload = {
  name: 'Marta Ruiz',
  company: 'Acme SL',
  email: 'marta@acme.com',
  message: 'Necesitamos revisar nuestra matriz de riesgos.',
}

const meta = {
  to: 'consultas@bisni.es',
  from: 'hola@bisni.es',
  submittedAt: '2026-10-23T10:15:00.000Z',
  source: 'bisni.es/contacto',
}

describe('buildContactMail', () => {
  it('identifica al remitente en el asunto con nombre y empresa', () => {
    const mail = buildContactMail(payload, meta)

    expect(mail.subject).toContain('Marta Ruiz')
    expect(mail.subject).toContain('Acme SL')
    expect(mail.subject).toBe('Nueva consulta de Marta Ruiz (Acme SL)')
  })

  it('neutraliza la inyección de cabeceras a través del nombre', () => {
    const mail = buildContactMail({ ...payload, name: 'Marta\r\nBcc: x@y.z' }, meta)

    expect(mail.subject).not.toMatch(/[\r\n]/)
    expect(mail.subject).toContain('Marta')
  })

  it('mantiene el asunto por debajo de 120 caracteres', () => {
    const mail = buildContactMail(
      { ...payload, name: 'A'.repeat(120), company: 'B'.repeat(120) },
      meta,
    )

    expect(mail.subject.length).toBeLessThanOrEqual(120)
    expect(mail.subject.startsWith('Nueva consulta de')).toBe(true)
  })

  it('incluye los cuatro campos etiquetados en el texto plano', () => {
    const { text } = buildContactMail(payload, meta)

    expect(text).toContain('Nombre: Marta Ruiz')
    expect(text).toContain('Empresa: Acme SL')
    expect(text).toContain('Email: marta@acme.com')
    expect(text).toContain('Mensaje:')
    expect(text).toContain('Necesitamos revisar nuestra matriz de riesgos.')
  })

  it('incluye la fecha de envío y el origen en el texto plano', () => {
    const { text } = buildContactMail(payload, meta)

    expect(text).toContain(meta.submittedAt)
    expect(text).toContain(meta.source)
  })

  it('incluye la dirección de respuesta en texto y HTML', () => {
    const mail = buildContactMail(payload, meta)

    expect(mail.text).toContain('Responder a: marta@acme.com')
    expect(mail.html).toContain('mailto:marta@acme.com')
    expect(mail.html).toContain('marta@acme.com')
  })

  it('escapa el HTML del mensaje y no interpreta el resto como marcado', () => {
    const { html } = buildContactMail(
      { ...payload, message: '<script>alert(1)</script>' },
      meta,
    )

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('escapa comillas, ampersands y ángulos en cualquier campo', () => {
    const { html } = buildContactMail(
      { ...payload, company: 'Acme & "Hijos" <SL>' },
      meta,
    )

    expect(html).toContain('Acme &amp; &quot;Hijos&quot; &lt;SL&gt;')
  })

  it('conserva los saltos de línea del mensaje en texto y HTML', () => {
    const message = 'Primera línea.\nSegunda línea.'
    const mail = buildContactMail({ ...payload, message }, meta)

    expect(mail.text).toContain('Primera línea.\nSegunda línea.')
    expect(mail.html).toContain('Primera línea.<br>Segunda línea.')
  })

  it('no deja el mensaje sin escapar cuando hay saltos de línea', () => {
    const { html } = buildContactMail(
      { ...payload, message: '<b>uno</b>\ny <b>dos</b>' },
      meta,
    )

    expect(html).not.toContain('<b>')
    expect(html).toContain('&lt;b&gt;uno&lt;/b&gt;<br>y &lt;b&gt;dos&lt;/b&gt;')
  })
})

type SentMail = {
  from: string
  to: string
  replyTo: string
  subject: string
  text: string
  html: string
}

const mailer = vi.hoisted(() => {
  const sendMail = vi.fn<(options: SentMail) => Promise<{ accepted: string[] }>>(async () => ({
    accepted: [],
  }))
  const close = vi.fn()
  const createTransport = vi.fn(() => ({ sendMail, close }))

  return { sendMail, close, createTransport }
})

// El transporte real se sustituye por un doble: los tests nunca abren una conexión SMTP.
vi.mock('nodemailer', () => ({ default: { createTransport: mailer.createTransport } }))

const validBody = {
  name: 'Marta Ruiz',
  company: 'Acme SL',
  email: 'marta@acme.com',
  message: 'Necesitamos revisar nuestra matriz de riesgos.',
}

function contactRequest(ip: string): Request {
  return new Request('https://bisni.es/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(validBody),
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    resetRateLimit()
    mailer.createTransport.mockClear()
    mailer.sendMail.mockClear()
    mailer.close.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('responde 503 cuando no hay SMTP ni webhook configurados', async () => {
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PASS', '')
    vi.stubEnv('CONTACT_TO', '')
    vi.stubEnv('CONTACT_WEBHOOK_URL', '')
    vi.stubEnv('NODE_ENV', 'production')

    const response = await POST(contactRequest('203.0.113.1'))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'not_configured' })
    expect(mailer.createTransport).not.toHaveBeenCalled()
  })

  it('mantiene el envío por webhook cuando no hay SMTP configurado', async () => {
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PASS', '')
    vi.stubEnv('CONTACT_TO', '')
    vi.stubEnv('CONTACT_WEBHOOK_URL', 'https://hooks.example.test/contact')
    vi.stubEnv('CONTACT_WEBHOOK_SECRET', 'secreto-de-prueba')

    const fetchMock = vi.fn<
      (input: string, init?: { body?: string; headers?: Record<string, string> }) => Promise<Response>
    >(async () => new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(contactRequest('203.0.113.5'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(mailer.createTransport).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hooks.example.test/contact',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer secreto-de-prueba',
        },
      }),
    )

    const body = fetchMock.mock.calls[0]?.[1]?.body
    expect(JSON.parse(String(body))).toMatchObject({
      name: 'Marta Ruiz',
      company: 'Acme SL',
      email: 'marta@acme.com',
      message: 'Necesitamos revisar nuestra matriz de riesgos.',
      source: 'bisni.es/contacto',
    })
  })

  it('envía por SMTP con los valores por defecto de Zoho e ignora el webhook', async () => {
    vi.stubEnv('SMTP_USER', 'hola@bisni.es')
    vi.stubEnv('SMTP_PASS', 'app-password-de-prueba')
    vi.stubEnv('CONTACT_TO', 'consultas@bisni.es')
    vi.stubEnv('CONTACT_WEBHOOK_URL', 'https://hooks.example.test/contact')
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_PORT', '')
    vi.stubEnv('CONTACT_FROM', '')

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(contactRequest('203.0.113.2'))

    expect(response.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(mailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: { user: 'hola@bisni.es', pass: 'app-password-de-prueba' },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'hola@bisni.es',
        to: 'consultas@bisni.es',
        replyTo: 'marta@acme.com',
        subject: 'Nueva consulta de Marta Ruiz (Acme SL)',
      }),
    )
    expect(mailer.close).toHaveBeenCalled()

    const sent = mailer.sendMail.mock.calls[0]?.[0]
    expect(sent?.text).toContain('Nombre: Marta Ruiz')
    expect(sent?.html).toContain('mailto:marta@acme.com')
  })

  it('usa secure:false cuando el puerto no es 465', async () => {
    vi.stubEnv('SMTP_USER', 'hola@bisni.es')
    vi.stubEnv('SMTP_PASS', 'app-password-de-prueba')
    vi.stubEnv('CONTACT_TO', 'consultas@bisni.es')
    vi.stubEnv('SMTP_PORT', '587')
    vi.stubEnv('CONTACT_WEBHOOK_URL', '')

    const response = await POST(contactRequest('203.0.113.3'))

    expect(response.status).toBe(200)
    expect(mailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    )
  })

  it('responde 502 cuando el envío SMTP falla', async () => {
    vi.stubEnv('SMTP_USER', 'hola@bisni.es')
    vi.stubEnv('SMTP_PASS', 'app-password-de-prueba')
    vi.stubEnv('CONTACT_TO', 'consultas@bisni.es')
    vi.stubEnv('CONTACT_WEBHOOK_URL', '')

    mailer.sendMail.mockRejectedValueOnce(new Error('535 Authentication failed'))

    const response = await POST(contactRequest('203.0.113.4'))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'delivery_failed' })
  })
})
