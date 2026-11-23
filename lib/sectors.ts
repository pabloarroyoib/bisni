/**
 * Sectores: páginas por industria enlazadas desde el desplegable del navbar.
 *
 * Todo lo de este módulo es puro (sin red ni React) para poder testearlo. El
 * documento vive en Sanity; cuando no existe, la página y el desplegable caen al
 * contenido de ejemplo de `sector-defaults.ts`, que se muestra como borrador.
 */

export type SectorLink = {
  title: string
  slug: string
}

export type Sector = SectorLink & {
  /** Resumen corto: se muestra como entrada de la página. */
  summary: string
  /** Portable Text del cuerpo, tal como lo devuelve Sanity. */
  body: unknown
  reviewed: boolean
  seoTitle: string
  seoDescription: string
}

/** Forma cruda del documento en Sanity: todo puede faltar. */
export type SanitySector = {
  title?: string | null
  slug?: string | null
  summary?: string | null
  body?: unknown
  reviewed?: boolean | null
  seoTitle?: string | null
  seoDescription?: string | null
}

/** Un slug de sector es la parte final de `/sectores/<slug>`. */
export const SECTOR_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isSectorSlug(value: string): boolean {
  return SECTOR_SLUG_PATTERN.test(value)
}

export function sectorHref(slug: string): string {
  return `/sectores/${slug}`
}

/** Texto recortado o `undefined` si queda vacío; nunca un `null` de Sanity. */
function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Enlace del desplegable. Devuelve `undefined` si el documento no tiene título o
 * un slug utilizable: un link roto en el navbar es peor que un sector de menos.
 */
export function toSectorLink(raw: SanitySector | null | undefined): SectorLink | undefined {
  const title = clean(raw?.title)
  const slug = clean(raw?.slug)

  if (!title || !slug || !isSectorSlug(slug)) return undefined

  return { title, slug }
}

/**
 * Lista para el desplegable. Respeta el orden que devuelve la query (por `order`
 * y después alfabético) y descarta los documentos incompletos.
 */
export function mapSectors(raw: readonly (SanitySector | null)[] | null | undefined): SectorLink[] {
  if (!raw) return []

  return raw
    .map((item) => toSectorLink(item))
    .filter((link): link is SectorLink => link !== undefined)
}

/**
 * Sector completo por slug. Prioridad: documento de Sanity → contenido de
 * ejemplo → `undefined` (la página responde 404). Un documento incompleto no
 * gana: si le falta el título o el slug, se cae al ejemplo.
 */
export function resolveSector(
  slug: string,
  raw: SanitySector | null | undefined,
  fallbacks: readonly Sector[] = [],
): Sector | undefined {
  const link = toSectorLink(raw)

  if (link) {
    return {
      ...link,
      summary: clean(raw?.summary) ?? '',
      body: raw?.body ?? [],
      reviewed: raw?.reviewed === true,
      // Sin SEO propio, el título y el resumen hacen de metadata.
      seoTitle: clean(raw?.seoTitle) ?? link.title,
      seoDescription: clean(raw?.seoDescription) ?? clean(raw?.summary) ?? '',
    }
  }

  return fallbacks.find((sector) => sector.slug === slug)
}

/** Mientras el contenido no esté aprobado, la página avisa y no se indexa. */
export function isSectorDraft(sector: Sector): boolean {
  return !sector.reviewed
}
