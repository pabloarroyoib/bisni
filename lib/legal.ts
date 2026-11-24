import { LEGAL_DRAFTS } from './legal-content'
import type { LegalSlug } from './legal-routes'
import { siteUrl } from './site'
import {
  dataRightsEmail,
  ssnRegistrationLabel,
  type SiteSettings,
} from './site-settings'

/**
 * Resolución de las páginas legales.
 *
 * El contenido vive en dos capas: el documento `legalPage` del Studio y, como
 * respaldo, los borradores de `lib/legal-content.ts`. La página nunca queda
 * vacía: si el documento no existe o un campo está vacío, se usa el borrador.
 *
 * Los datos del responsable no se escriben en el texto: se referencian con
 * `{{token}}` y se resuelven acá desde `siteSettings`. Un dato faltante se
 * muestra como `[PENDIENTE: …]`, nunca como un valor inventado.
 */

export type LegalPageContent = {
  title: string
  slug: LegalSlug
  body: unknown[]
  lastUpdated: string | null
  seoTitle: string
  seoDescription: string
}

export type SanityLegalPage = {
  title?: string | null
  slug?: string | null
  body?: unknown[] | null
  lastUpdated?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}

/** Tokens disponibles en el texto legal. */
type LegalToken =
  | 'legalName'
  | 'tradeName'
  | 'taxId'
  | 'address'
  | 'officeAddress'
  | 'phone'
  | 'email'
  | 'dataRightsEmail'
  | 'ssn'
  | 'ssnCondition'
  | 'ssnRegistry'
  | 'jurisdiction'
  | 'website'

/** Etiqueta que se muestra en `[PENDIENTE: …]` cuando el dato no está cargado. */
const TOKEN_LABELS: Record<LegalToken, string> = {
  legalName: 'razón social',
  tradeName: 'nombre comercial',
  taxId: 'CUIT',
  address: 'domicilio legal',
  officeAddress: 'domicilio de atención al público',
  phone: 'teléfono',
  email: 'email',
  dataRightsEmail: 'email para derechos de datos',
  ssn: 'matrícula SSN',
  ssnCondition: 'condición ante la SSN',
  ssnRegistry: 'registro SSN',
  jurisdiction: 'jurisdicción',
  website: 'sitio web',
}

const TOKEN_RE = /\{\{(\w+)\}\}/g
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function text(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed === '' ? fallback : trimmed
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLegalToken(name: string): name is LegalToken {
  return Object.prototype.hasOwnProperty.call(TOKEN_LABELS, name)
}

function tokenValue(token: LegalToken, settings: SiteSettings): string {
  switch (token) {
    case 'dataRightsEmail':
      return dataRightsEmail(settings)
    case 'ssn':
      return ssnRegistrationLabel(settings) ?? ''
    case 'website': {
      // Sin dominio configurado se cita la URL canónica del sitio.
      const website = settings.website.trim()
      return website === '' ? siteUrl : website
    }
    default:
      return settings[token]
  }
}

/**
 * Resuelve un documento de Sanity contra el borrador estático. Los valores del
 * documento ganan; los campos vacíos caen al borrador.
 */
export function resolveLegalPage(
  slug: LegalSlug,
  raw: SanityLegalPage | null | undefined,
): LegalPageContent {
  const draft = LEGAL_DRAFTS[slug]
  const title = text(raw?.title, draft.title)
  const body = Array.isArray(raw?.body) && raw.body.length > 0 ? raw.body : draft.body

  return {
    title,
    slug,
    body,
    lastUpdated: text(raw?.lastUpdated) || null,
    // Sin título de buscadores se usa el de la página, nunca un texto vacío.
    seoTitle: text(raw?.seoTitle, title),
    seoDescription: text(raw?.seoDescription, draft.seoDescription),
  }
}

/** Reemplaza los `{{token}}` del texto con los datos del responsable. */
export function interpolateLegalText(text: string, settings: SiteSettings): string {
  return text.replace(TOKEN_RE, (match, name: string) => {
    if (!isLegalToken(name)) return match

    const value = tokenValue(name, settings).trim()
    return value === '' ? `[PENDIENTE: ${TOKEN_LABELS[name]}]` : value
  })
}

/**
 * Interpola el Portable Text de una página legal. Devuelve una copia: el array
 * original (el borrador estático o el documento cacheado por `sanityFetch`) no
 * se muta.
 */
export function resolveLegalBlocks(blocks: unknown[], settings: SiteSettings): unknown[] {
  return blocks.map((block) => {
    if (!isRecord(block) || !Array.isArray(block.children)) return block

    const children = block.children.map((child) => {
      if (!isRecord(child) || typeof child.text !== 'string') return child
      return { ...child, text: interpolateLegalText(child.text, settings) }
    })

    return { ...block, children }
  })
}

/**
 * Formatea `YYYY-MM-DD` con `Intl` en es-AR.
 *
 * La fecha se arma con sus partes en horario local a propósito:
 * `new Date('2026-11-12')` se interpreta como UTC y en Argentina (UTC-3) cae el
 * día anterior. Un valor inválido o normalizado por el constructor
 * (`2026-02-31`) devuelve `null`.
 */
export function formatLegalDate(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null

  const match = ISO_DATE_RE.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

/** Texto plano de un cuerpo legal; lo usan los tests para buscar frases. */
export function legalPlainText(blocks: unknown[]): string {
  const parts: string[] = []

  for (const block of blocks) {
    if (!isRecord(block) || !Array.isArray(block.children)) continue
    for (const child of block.children) {
      if (isRecord(child) && typeof child.text === 'string') parts.push(child.text)
    }
  }

  return parts.join(' ')
}
