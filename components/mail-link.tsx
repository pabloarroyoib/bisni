'use client'

import { gmailComposeUrl, mailtoHref } from '@/lib/email'
import type { ReactNode } from 'react'

/**
 * Enlace de correo que se adapta al dispositivo.
 *
 * En una computadora no hay cliente de correo configurado la mayoría de las
 * veces, así que un `mailto:` no hace nada; ahí el `href` es el compose web de
 * Gmail, que abre en el navegador con destinatario y asunto ya puestos. En un
 * dispositivo táctil el `mailto:` sí funciona y abre la app de correo, así que el
 * clic se intercepta y se navega a `mailto:`.
 *
 * El `href` del servidor es siempre el de Gmail: funciona sin JavaScript y es el
 * caso más común en escritorio. La detección ocurre en el clic, no en el render,
 * para no provocar un desajuste de hidratación ni un parpadeo del enlace.
 */
export function MailLink({
  email,
  subject,
  className,
  ariaLabel,
  title,
  children,
}: {
  email: string
  subject?: string
  className?: string
  ariaLabel?: string
  title?: string
  children: ReactNode
}) {
  return (
    <a
      href={gmailComposeUrl(email, subject)}
      className={className}
      aria-label={ariaLabel}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        // Puntero grueso = táctil: ahí `mailto:` abre la app y es lo esperado.
        if (!window.matchMedia('(pointer: coarse)').matches) return

        event.preventDefault()
        window.location.href = mailtoHref(email, subject)
      }}
    >
      {children}
    </a>
  )
}
