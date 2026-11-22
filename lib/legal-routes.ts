/**
 * Rutas de las páginas legales.
 *
 * Vive aparte de `lib/legal.ts` para que los componentes cliente (formularios)
 * puedan enlazar la política sin arrastrar el contenido de las páginas al
 * bundle del navegador.
 *
 * Los links son estructurales: el footer los renderiza siempre desde acá y no
 * se editan desde el Studio. Una página legal no puede quedar despublicada.
 *
 * La política de cookies se retiró por decisión del cliente: el sitio público
 * no usa cookies propias. La mención del iframe de Zoho (cookies de terceros)
 * vive dentro de la Política de privacidad.
 */
export const LEGAL_SLUGS = ['aviso-legal', 'privacidad'] as const

export type LegalSlug = (typeof LEGAL_SLUGS)[number]

export type LegalRoute = {
  slug: LegalSlug
  label: string
}

export const LEGAL_ROUTES: readonly LegalRoute[] = [
  { slug: 'aviso-legal', label: 'Aviso legal' },
  { slug: 'privacidad', label: 'Privacidad' },
]

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value)
}

export function legalHref(slug: LegalSlug): string {
  return `/legal/${slug}`
}

export const PRIVACY_HREF = legalHref('privacidad')
export const LEGAL_NOTICE_HREF = legalHref('aviso-legal')
