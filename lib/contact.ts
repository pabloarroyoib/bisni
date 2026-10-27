export type ContactField = 'name' | 'company' | 'email' | 'message'

export type ContactPayload = {
  name: string
  company: string
  email: string
  message: string
}

export type ContactErrors = Partial<Record<ContactField, string>>

export type ContactValidation =
  | { ok: true; data: ContactPayload }
  | { ok: false; errors: ContactErrors }

export const CONTACT_LIMITS = {
  name: { min: 2, max: 120 },
  company: { min: 2, max: 120 },
  email: { max: 254 },
  message: { min: 10, max: 5000 },
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Valida el cuerpo del formulario de contacto.
 * Es intencionadamente puro para poder reutilizarlo en tests y en la API.
 * Devuelve los mensajes en español listos para mostrar en la UI.
 */
export function validateContactInput(input: unknown): ContactValidation {
  const body = (input ?? {}) as Record<string, unknown>

  // Honeypot: si un bot rellena este campo, descartamos el envío.
  if (asString(body.website).length > 0) {
    return { ok: false, errors: { name: 'Envío rechazado.' } }
  }

  const name = asString(body.name)
  const company = asString(body.company)
  const email = asString(body.email).toLowerCase()
  const message = asString(body.message)

  const errors: ContactErrors = {}

  if (name.length < CONTACT_LIMITS.name.min) {
    errors.name = 'Indica tu nombre.'
  } else if (name.length > CONTACT_LIMITS.name.max) {
    errors.name = 'El nombre es demasiado largo.'
  }

  if (company.length < CONTACT_LIMITS.company.min) {
    errors.company = 'Indica el nombre de tu empresa.'
  } else if (company.length > CONTACT_LIMITS.company.max) {
    errors.company = 'El nombre de la empresa es demasiado largo.'
  }

  if (email.length === 0) {
    errors.email = 'Indica tu email corporativo.'
  } else if (email.length > CONTACT_LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    errors.email = 'El email no parece válido.'
  }

  if (message.length < CONTACT_LIMITS.message.min) {
    errors.message = 'Cuéntanos un poco más (mínimo 10 caracteres).'
  } else if (message.length > CONTACT_LIMITS.message.max) {
    errors.message = 'El mensaje es demasiado largo.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, data: { name, company, email, message } }
}
