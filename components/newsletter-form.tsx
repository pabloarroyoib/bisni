'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { validateNewsletterInput, type NewsletterErrors } from '@/lib/newsletter'

/**
 * Suscripción a la newsletter conectada a Zoho Campaigns.
 *
 * Una sola fila con dos campos: nombre de pila y email. Se mantiene compacta y
 * en línea (en móvil pasa a columna) para que quede claro que esto no es el
 * formulario de consulta. Los campos llevan `aria-label` en vez de etiqueta
 * visible y el botón usa la variante oscura.
 *
 * El nombre viaja en `FIRSTNAME` y no en `LASTNAME`: el merge tag de Zoho
 * `$[FNAME|Suscriptor]$` lee el nombre de pila (First Name), así que un campo
 * `LASTNAME` nunca lo rellenaría. El snippet original de Zoho pedía el nombre
 * en `LASTNAME`; aquí se invierte a propósito. `LASTNAME` se sigue enviando
 * vacío porque algunas listas esperan el campo.
 *
 * Usamos la variante documentada "No JavaScript Embedding": un formulario HTML
 * nativo que apunta al endpoint de Zoho y envía a un iframe oculto llamado
 * `_zcSignup`. La variante JS (optin.min.js) inyecta IDs globales duplicados y
 * no puede informar del éxito desde otro origen; la variante sin JS está
 * documentada, no necesita OAuth y el doble opt-in de Zoho es la confirmación
 * real. Por eso la UI no afirma que la suscripción esté confirmada: solo pide
 * revisar el correo y confirmar.
 */
const ZOHO_ACTION = 'https://zgnp-zngp.maillist-manage.com/weboptin.zc'
const ZOHO_TARGET = '_zcSignup'
const SUCCESS_MESSAGE =
  'Te enviamos un correo para confirmar tu suscripción. Revisa tu bandeja de entrada.'
const UNCONFIRMED_MESSAGE =
  'No hemos podido confirmar el envío. Revisa tu conexión y vuelve a intentarlo.'
/**
 * Tiempo máximo de espera a que el iframe reciba la respuesta de Zoho. Si no
 * llega, asumimos que el envío no salió (sin red, bloqueador, iframe bloqueado)
 * y devolvemos el control para que la persona pueda reintentar.
 */
const CONFIRM_TIMEOUT_MS = 8_000

type Status = 'idle' | 'sending' | 'sent' | 'unconfirmed'

export function NewsletterForm() {
  const [errors, setErrors] = useState<NewsletterErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const timeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const sending = status === 'sending'
  const sent = status === 'sent'

  /** El iframe cargó: la respuesta de Zoho llegó y el envío salió de verdad. */
  function handleFrameLoad() {
    if (status !== 'sending') return
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setStatus('sent')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Evita un doble envío mientras el primero viaja.
    if (sending) {
      event.preventDefault()
      return
    }

    const data = new FormData(event.currentTarget)
    const result = validateNewsletterInput({
      email: data.get('CONTACT_EMAIL'),
      name: data.get('FIRSTNAME'),
      website: data.get('website'),
    })

    if (!result.ok) {
      event.preventDefault()
      setErrors(result.errors)
      return
    }

    // El envío es nativo, así que el navegador manda el value del DOM tal cual.
    // Volcamos los valores ya normalizados (nombre sin espacios, email en
    // minúsculas) para que Zoho no guarde "  Marta " ni el email con mayúsculas.
    const form = event.currentTarget
    const nameField = form.elements.namedItem('FIRSTNAME')
    const emailField = form.elements.namedItem('CONTACT_EMAIL')
    if (nameField instanceof HTMLInputElement) nameField.value = result.data.name
    if (emailField instanceof HTMLInputElement) emailField.value = result.data.email

    // Envío nativo: NO llamamos a preventDefault(). El navegador manda el
    // formulario al iframe oculto y la respuesta de Zoho nunca toca el DOM.
    setErrors({})
    setStatus('sending')

    // Si el iframe no carga en este plazo, el envío no salió: se libera el
    // formulario para que se pueda reintentar sin recargar la página.
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      setStatus((current) => (current === 'sending' ? 'unconfirmed' : current))
    }, CONFIRM_TIMEOUT_MS)
  }

  return (
    <>
      <form
        className="newsletter-form"
        action={ZOHO_ACTION}
        method="POST"
        target={ZOHO_TARGET}
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="newsletter-row">
          <input
            name="FIRSTNAME"
            type="text"
            required
            placeholder="Tu nombre"
            autoComplete="given-name"
            aria-label="Tu nombre"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'EMBED_FORM_NAME_ERROR' : undefined}
          />
          <input
            id="EMBED_FORM_EMAIL_LABEL"
            name="CONTACT_EMAIL"
            type="email"
            required
            placeholder="tu@empresa.com"
            autoComplete="email"
            aria-label="Tu email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'EMBED_FORM_EMAIL_ERROR' : undefined}
          />
          <button className="button button-dark" type="submit" disabled={sending || sent}>
            {sending ? 'Enviando…' : sent ? 'Enviado' : status === 'unconfirmed' ? 'Reintentar' : 'Suscribirme'}{' '}
            {sent ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
          </button>
        </div>
        {errors.name && (
          <span className="field-error" id="EMBED_FORM_NAME_ERROR" role="alert">
            {errors.name}
          </span>
        )}
        {errors.email && (
          <span className="field-error" id="EMBED_FORM_EMAIL_ERROR" role="alert">
            {errors.email}
          </span>
        )}

        {/* Campos ocultos que Zoho lee literalmente: si cambia el formulario en
            Zoho, hay que volver a copiarlos aquí sin reordenarlos. */}
        <input type="hidden" name="submitType" value="optinCustomView" />
        <input type="hidden" name="formType" value="QuickForm" />
        <input type="hidden" name="mode" value="OptinCreateView" />
        <input type="hidden" name="zcvers" value="3.0" />
        <input type="hidden" name="zx" value="138584313" />
        <input type="hidden" name="zcld" value="118102399cc2c10a3" />
        <input type="hidden" name="zctd" value="118102399cc2c0f71" />
        <input
          type="hidden"
          name="zc_formIx"
          value="3z9b1fff08a90bef4c9de3f385cb7008d67f7183161ccc906e137b16fec03bb9b5"
        />
        <input type="hidden" name="zc_trackCode" value="ZCFORMVIEW" />
        <input type="hidden" name="oldListIds" value="" />
        {/* `scriptless=yes` es la marca que le dice al servidor de Zoho que este
            envío no viene de su JavaScript: sin ella responde la página de éxito
            pero NO registra el contacto. `emailReportId` va vacío como en su
            snippet. */}
        <input type="hidden" name="scriptless" value="yes" />
        <input type="hidden" name="emailReportId" value="" />
        {/* `LASTNAME` va vacío a propósito: el merge tag `$[FNAME|Suscriptor]$`
            lee First Name, que es el campo visible `FIRSTNAME`. Zoho acepta
            `LASTNAME` vacío y algunas listas esperan el campo, así que no se
            elimina. */}
        <input type="hidden" name="LASTNAME" value="" />

        {/* Metadatos que Zoho espera junto al formulario. `dt_FIRSTNAME` declara
            el nombre como obligatorio (`true`); el snippet de Zoho lo traía con
            `false`, pero aquí se exige en cliente. */}
        <span id="dt_FIRSTNAME" style={{ display: 'none' }}>
          1,true,1,Nombre,2
        </span>
        <span id="dt_CONTACT_EMAIL" style={{ display: 'none' }}>
          1,true,6,Correo electrónico de contacto,2
        </span>
        <span id="dt_LASTNAME" style={{ display: 'none' }}>
          1,false,1,Apellidos,2
        </span>

        {/* Honeypot anti-bots: invisible para personas, tentador para scripts. */}
        <div className="form-honeypot" aria-hidden="true">
          <label>
            No rellenar
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {sent && (
          <p className="newsletter-status" role="status">
            {SUCCESS_MESSAGE}
          </p>
        )}
        {status === 'unconfirmed' && (
          <p className="newsletter-status is-error" role="alert">
            {UNCONFIRMED_MESSAGE}
          </p>
        )}
      </form>

      {/* Destino del envío: el navegador carga aquí la respuesta de Zoho,
          fuera de la vista y sin sacar al usuario de la página. El `load` es la
          única señal fiable de que el envío salió (no podemos leer el
          contenido por ser otro origen). */}
      <iframe
        name={ZOHO_TARGET}
        title="Respuesta de Zoho Campaigns"
        aria-hidden="true"
        tabIndex={-1}
        className="newsletter-frame"
        onLoad={handleFrameLoad}
      />
    </>
  )
}
