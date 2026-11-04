export type NewsletterField = 'email' | 'name'

export type NewsletterPayload = {
  email: string
  name: string
}

export type NewsletterErrors = Partial<Record<NewsletterField, string>>

export type NewsletterValidation =
  | { ok: true; data: NewsletterPayload }
  | { ok: false; errors: NewsletterErrors }

export const NEWSLETTER_LIMITS = {
  email: { max: 254 },
  name: { min: 2, max: 120 },
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Valida el formulario de newsletter antes de enviarlo a Zoho Campaigns.
 * Es puro para poder reutilizarlo en tests y en componente cliente.
 * Pide email y nombre de pila: el nombre viaja como `FIRSTNAME` para que el
 * merge tag `$[FNAME|Suscriptor]$` de Zoho se resuelva.
 * Devuelve los mensajes en español listos para mostrar en la UI.
 */
export function validateNewsletterInput(input: unknown): NewsletterValidation {
  const body = (input ?? {}) as Record<string, unknown>

  // Honeypot: si un bot rellena este campo, descartamos el envío.
  if (asString(body.website).length > 0) {
    return { ok: false, errors: { email: 'Envío rechazado.' } }
  }

  const email = asString(body.email).toLowerCase()
  // El nombre solo se recorta: los nombres propios conservan sus mayúsculas.
  const name = asString(body.name)

  const errors: NewsletterErrors = {}

  if (email.length === 0) {
    errors.email = 'Indica tu email.'
  } else if (email.length > NEWSLETTER_LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    errors.email = 'El email no parece válido.'
  }

  if (name.length < NEWSLETTER_LIMITS.name.min) {
    errors.name = 'Indica tu nombre.'
  } else if (name.length > NEWSLETTER_LIMITS.name.max) {
    errors.name = 'El nombre es demasiado largo.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, data: { email, name } }
}
