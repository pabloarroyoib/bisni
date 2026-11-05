/**
 * Enlaces de correo del sitio.
 *
 * `mailtoHref` es el enlace universal: abre el cliente que la persona tenga
 * configurado (Outlook, Apple Mail, el que sea).
 * `gmailComposeUrl` es el atajo para quien usa Gmail en el navegador: abre el
 * compose con el destinatario y el asunto ya puestos.
 *
 * No se usa Gmail como enlace principal a propósito: forzarlo dejaría afuera a
 * quien no tiene cuenta de Google o no está logueado en el navegador.
 */
export const CONTACT_EMAIL = 'hola@bisni.es'
export const CONTACT_SUBJECT = 'Consulta desde bisni.es'

/** `mailto:` con asunto opcional, ya codificado. */
export function mailtoHref(to: string = CONTACT_EMAIL, subject: string = CONTACT_SUBJECT): string {
  return subject ? `mailto:${to}?subject=${encodeURIComponent(subject)}` : `mailto:${to}`
}

/** Compose web de Gmail con destinatario y asunto precargados. */
export function gmailComposeUrl(to: string = CONTACT_EMAIL, subject: string = CONTACT_SUBJECT): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', tf: '1', to })
  if (subject) params.set('su', subject)
  return `https://mail.google.com/mail/?${params.toString()}`
}
