'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
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
 * documentada y no necesita OAuth.
 *
 * El doble opt-in está desactivado en Zoho, así que el contacto entra directo a
 * la lista y el mensaje de éxito no menciona ningún correo de confirmación. La
 * respuesta sigue siendo cross-origin: lo único verificable es que el iframe
 * cargó, o sea que el envío salió. Si Zoho vuelve a activar el doble opt-in,
 * `SUCCESS_MESSAGE` tiene que volver a pedir la confirmación por correo.
 */
const ZOHO_ACTION = 'https://zgnp-zngp.maillist-manage.com/weboptin.zc'
const ZOHO_TARGET = '_zcSignup'
const SUCCESS_MESSAGE =
  'Listo. Ya estás en la lista y vas a recibir el próximo número.'
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
  // Ids únicos por instancia: si el formulario se renderiza dos veces en la
  // misma página, `aria-describedby` no debe apuntar al error del otro.
  const fieldId = useId()
  const nameErrorId = `${fieldId}-name-error`
  const emailErrorId = `${fieldId}-email-error`
  const privacyId = `${fieldId}-privacy`
  const privacyErrorId = `${fieldId}-privacy-error`
  const timeoutRef = useRef<number | null>(null)
  // Un envío está en vuelo mientras el iframe no haya cargado. Es un ref y no
  // el estado para que el handler del `load` no dependa de un render previo:
  // si Zoho tarda más que el timeout, el load tardío tiene que marcar éxito
  // igual (si no, se le dice que falló cuando sí se registró y se invita a
  // duplicar la suscripción).
  const pendingRef = useRef(false)

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const sending = status === 'sending'
  const sent = status === 'sent'

  /**
   * El iframe cargó: la respuesta de Zoho llegó y el envío salió de verdad.
   * El `load` inicial del iframe (about:blank) no cuenta porque no hay envío
   * pendiente.
   */
  function handleFrameLoad() {
    if (!pendingRef.current) return
    pendingRef.current = false
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setStatus('sent')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Un envío ya salió o está viajando: no se vuelve a postear, para no crear
    // un contacto duplicado en Zoho. El botón sigue enfocable (deshabilitarlo
    // dentro del handler aborta la sumisión en algunos navegadores), así que el
    // freno tiene que estar acá.
    if (sending || sent) {
      event.preventDefault()
      return
    }

    const data = new FormData(event.currentTarget)
    const result = validateNewsletterInput({
      email: data.get('CONTACT_EMAIL'),
      name: data.get('FIRSTNAME'),
      privacy: data.get('privacy'),
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
    // El botón NO se deshabilita durante el envío: hay navegadores que abortan
    // la sumisión si el submitter queda deshabilitado dentro del handler. El
    // doble envío lo frena el guard de `sending`.
    setErrors({})
    pendingRef.current = true
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
        aria-busy={sending || undefined}
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
            aria-describedby={errors.name ? nameErrorId : undefined}
          />
          <input
            name="CONTACT_EMAIL"
            type="email"
            required
            placeholder="tu@empresa.com"
            autoComplete="email"
            aria-label="Tu email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailErrorId : undefined}
          />
          <button className="button button-dark button-navy" type="submit" aria-disabled={sending || sent || undefined}>
            {sending ? 'Enviando…' : sent ? 'Enviado' : status === 'unconfirmed' ? 'Reintentar' : 'Suscribirme'}{' '}
            {sent ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
          </button>
        </div>
        {errors.name && (
          <span className="field-error" id={nameErrorId} role="alert">
            {errors.name}
          </span>
        )}
        {errors.email && (
          <span className="field-error" id={emailErrorId} role="alert">
            {errors.email}
          </span>
        )}

        <div className="newsletter-privacy">
          <input
            id={privacyId}
            name="privacy"
            type="checkbox"
            value="accepted"
            required
            aria-invalid={errors.privacy ? true : undefined}
            aria-describedby={errors.privacy ? privacyErrorId : undefined}
          />
          <label htmlFor={privacyId}>Leí y acepto la política de privacidad.</label>
        </div>
        {errors.privacy && (
          <span className="field-error" id={privacyErrorId} role="alert">
            {errors.privacy}
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

        {/* Los `dt_*` del snippet de Zoho no van: solo los usaba su JavaScript
            para mapear etiquetas, que acá no se carga, y sin ese script son
            spans inertes con IDs fijos. */}

        {/* Honeypot anti-bots: invisible para personas, tentador para scripts.
            Es una barrera blanda: el envío va directo a Zoho, así que quien
            postee contra el endpoint sin pasar por esta página lo esquiva. La
            protección real exigiría proxear el alta por un route handler. */}
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
