export type ContactMail = {
  subject: string
  text: string
  html: string
}

export type ContactMailPayload = {
  name: string
  company: string
  email: string
  message: string
}

export type ContactMailMeta = {
  /** Buzón que recibe la consulta. Lo aplica el transporte, no el cuerpo. */
  to: string
  /** Remitente visible. Lo aplica el transporte, no el cuerpo. */
  from: string
  /** Fecha ISO del envío. */
  submittedAt: string
  /** Origen del envío, por ejemplo `bisni.es/contacto`. */
  source: string
}

const SUBJECT_MAX_LENGTH = 120

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapa todo lo que se interpola en el HTML: no se interpreta nada como marcado. */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

/** Quita CR/LF para que ningún campo pueda inyectar cabeceras en el asunto. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function buildSubject(payload: ContactMailPayload): string {
  const subject = `Nueva consulta de ${singleLine(payload.name)} (${singleLine(payload.company)})`

  if (subject.length <= SUBJECT_MAX_LENGTH) return subject

  return `${subject.slice(0, SUBJECT_MAX_LENGTH - 1).trimEnd()}…`
}

function buildText(payload: ContactMailPayload, meta: ContactMailMeta): string {
  return [
    `Nueva consulta desde ${meta.source}`,
    '',
    `Nombre: ${payload.name}`,
    `Empresa: ${payload.company}`,
    `Email: ${payload.email}`,
    'Mensaje:',
    payload.message,
    '',
    '--',
    `Responder a: ${payload.email}`,
    `Recibido: ${meta.submittedAt}`,
  ].join('\n')
}

function buildHtml(payload: ContactMailPayload, meta: ContactMailMeta): string {
  // Primero se escapa y después se convierten los saltos de línea: al revés,
  // el propio `<br>` se escaparía y el mensaje perdería el formato.
  const message = escapeHtml(payload.message).replace(/\r?\n/g, '<br>')
  const email = escapeHtml(payload.email)

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f3f6f6;font-family:Helvetica,Arial,sans-serif;color:#14232b;">
    <div style="max-width:560px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #dbe3e3;border-radius:12px;">
      <h1 style="margin:0 0 16px;font-size:18px;line-height:1.3;">Nueva consulta desde ${escapeHtml(meta.source)}</h1>
      <p style="margin:0 0 6px;"><strong>Nombre:</strong> ${escapeHtml(payload.name)}</p>
      <p style="margin:0 0 6px;"><strong>Empresa:</strong> ${escapeHtml(payload.company)}</p>
      <p style="margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p style="margin:16px 0 6px;"><strong>Mensaje:</strong></p>
      <p style="margin:0;line-height:1.5;">${message}</p>
      <hr style="margin:20px 0;border:none;border-top:1px solid #dbe3e3;" />
      <p style="margin:0 0 6px;font-size:13px;">Responder a: <a href="mailto:${email}">${email}</a></p>
      <p style="margin:0;font-size:13px;color:#5b6b72;">Recibido: ${escapeHtml(meta.submittedAt)}</p>
    </div>
  </body>
</html>`
}

/**
 * Construye el email de una consulta del formulario.
 * Es puro (sin I/O ni dependencias) para poder probarlo y para que el
 * transporte solo tenga que aplicarlo.
 */
export function buildContactMail(
  payload: ContactMailPayload,
  meta: ContactMailMeta,
): ContactMail {
  return {
    subject: buildSubject(payload),
    text: buildText(payload, meta),
    html: buildHtml(payload, meta),
  }
}
