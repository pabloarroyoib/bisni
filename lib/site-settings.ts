import type { SanityImageSource } from '@sanity/image-url'
import { urlFor } from '@/sanity/lib/image'
import { CONTACT_EMAIL, CONTACT_SUBJECT, mailtoHref } from './email'
import type { ContactDetail } from './home-content'
import { siteName } from './site'

/**
 * Datos legales y de contacto del responsable del sitio.
 *
 * Es la única fuente para el footer, la sección de contacto de la home y las
 * páginas legales. Los campos vacíos significan "dato pendiente": no se
 * reemplazan por valores inventados, así una página legal nunca afirma una
 * razón social, un CUIT o una matrícula que el cliente no confirmó.
 */
export type SsnLogo = {
  url: string
  alt: string
}

export type SiteSettings = {
  /** Razón social como figura en el estatuto (con S.A./S.R.L. si aplica). */
  legalName: string
  /** Marca visible del sitio. */
  tradeName: string
  taxId: string
  /** Domicilio legal, con saltos de línea. */
  address: string
  /** Domicilio de atención al público, si difiere del legal. */
  officeAddress: string
  phone: string
  /** A dónde lleva el clic en el domicilio; si está vacío se arma una búsqueda. */
  mapsUrl: string
  email: string
  /** Canal para ejercer los derechos sobre datos personales. */
  privacyEmail: string
  website: string
  jurisdiction: string
  /** Condición registrada ante la SSN. */
  ssnCondition: string
  /** Número de matrícula, sin el prefijo "Matrícula SSN N°". */
  ssnRegistration: string
  /** Nombre del registro, si hay que citarlo. */
  ssnRegistry: string
  ssnUrl: string
  ssnLogo: SsnLogo | null
  /** El logo de la SSN solo se muestra en el footer si las reglas lo permiten. */
  ssnShowInFooter: boolean
}

export type SanitySiteSettings = {
  legalName?: string | null
  tradeName?: string | null
  taxId?: string | null
  address?: string | null
  officeAddress?: string | null
  phone?: string | null
  mapsUrl?: string | null
  email?: string | null
  privacyEmail?: string | null
  website?: string | null
  jurisdiction?: string | null
  ssnCondition?: string | null
  ssnRegistration?: string | null
  ssnRegistry?: string | null
  ssnUrl?: string | null
  ssnLogo?: { asset?: SanityImageSource; alt?: string | null } | null
  ssnShowInFooter?: boolean | null
}

/**
 * Valores de arranque. A propósito no hay datos legales inventados: solo el
 * correo que hoy recibe las consultas y la marca pública. Todo lo demás queda
 * vacío hasta que el cliente lo confirme en el Studio.
 */
export const defaultSiteSettings: SiteSettings = {
  legalName: '',
  tradeName: siteName,
  taxId: '',
  address: '',
  officeAddress: '',
  phone: '',
  mapsUrl: '',
  email: CONTACT_EMAIL,
  privacyEmail: '',
  website: '',
  jurisdiction: '',
  ssnCondition: '',
  ssnRegistration: '',
  ssnRegistry: '',
  ssnUrl: '',
  ssnLogo: null,
  ssnShowInFooter: false,
}

function text(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed === '' ? fallback : trimmed
}

function mapLogo(raw: SanitySiteSettings['ssnLogo']): SsnLogo | null {
  if (!raw || typeof raw !== 'object' || !raw.asset) return null

  return {
    url: urlFor(raw as SanityImageSource).width(320).fit('max').url(),
    alt: text(raw.alt, 'Superintendencia de Seguros de la Nación'),
  }
}

/** Normaliza el documento de Sanity. Nunca inventa datos faltantes. */
export function mapSiteSettings(raw: SanitySiteSettings | null | undefined): SiteSettings {
  const doc = raw ?? {}
  const defaults = defaultSiteSettings

  return {
    legalName: text(doc.legalName, defaults.legalName),
    tradeName: text(doc.tradeName, defaults.tradeName),
    taxId: text(doc.taxId, defaults.taxId),
    address: text(doc.address, defaults.address),
    officeAddress: text(doc.officeAddress, defaults.officeAddress),
    phone: text(doc.phone, defaults.phone),
    mapsUrl: text(doc.mapsUrl, defaults.mapsUrl),
    email: text(doc.email, defaults.email),
    privacyEmail: text(doc.privacyEmail, defaults.privacyEmail),
    website: text(doc.website, defaults.website),
    jurisdiction: text(doc.jurisdiction, defaults.jurisdiction),
    ssnCondition: text(doc.ssnCondition, defaults.ssnCondition),
    ssnRegistration: text(doc.ssnRegistration, defaults.ssnRegistration),
    ssnRegistry: text(doc.ssnRegistry, defaults.ssnRegistry),
    ssnUrl: text(doc.ssnUrl, defaults.ssnUrl),
    ssnLogo: mapLogo(doc.ssnLogo),
    ssnShowInFooter:
      typeof doc.ssnShowInFooter === 'boolean' ? doc.ssnShowInFooter : defaults.ssnShowInFooter,
  }
}

/** Datos mínimos para que una página legal deje de ser borrador. */
export function isSiteSettingsComplete(settings: SiteSettings): boolean {
  return Boolean(settings.legalName && settings.taxId && settings.address && settings.email)
}

export function hasSsnData(settings: SiteSettings): boolean {
  return Boolean(settings.ssnCondition && settings.ssnRegistration)
}

/** El domicilio de atención al público, con el legal como respaldo. */
export function contactAddress(settings: SiteSettings): string {
  return settings.officeAddress || settings.address
}

/** Canal para derechos de datos: el dedicado si existe, si no el de contacto. */
export function dataRightsEmail(settings: SiteSettings): string {
  return settings.privacyEmail || settings.email
}

/**
 * Enlace al mapa cuando el Studio no carga uno: búsqueda de Google Maps por
 * dirección. La URL del lugar concreta se prefiere siempre porque la elige el
 * cliente desde "Datos del sitio".
 */
export function mapsSearchHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/** Enlace `tel:` con los dígitos del teléfono; conserva el prefijo + si lo tiene. */
export function phoneHref(phone: string): string {
  const trimmed = phone.trim()
  const digits = phone.replace(/[^\d]/g, '')
  if (!digits) return ''
  return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`
}

/** Deduce los datos de contacto de la home; omite los que están vacíos. */
export function buildContactDetails(settings: SiteSettings = defaultSiteSettings): ContactDetail[] {
  const details: ContactDetail[] = []
  const address = contactAddress(settings)

  if (address) {
    // El domicilio abre el mapa: la URL elegida en el Studio o una búsqueda.
    details.push({ icon: 'map', text: address, href: settings.mapsUrl || mapsSearchHref(address) })
  }
  if (settings.email) {
    details.push({
      icon: 'mail',
      text: settings.email,
      href: mailtoHref(settings.email, CONTACT_SUBJECT),
    })
  }
  if (settings.phone) {
    const href = phoneHref(settings.phone)
    details.push({ icon: 'phone', text: settings.phone, ...(href ? { href } : {}) })
  }

  return details
}

/** Línea corta para el footer; `null` si todavía no hay matrícula. */
export function ssnRegistrationLabel(settings: SiteSettings): string | null {
  if (!settings.ssnRegistration) return null
  return `Matrícula SSN N° ${settings.ssnRegistration}`
}
