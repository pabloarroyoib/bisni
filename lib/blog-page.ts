/**
 * Portada del blog (`/blog`).
 *
 * El documento `blogPage` del Studio manda; cada campo vacío o ausente cae al
 * texto por defecto de acá, así la página nunca queda en blanco. Es puro (sin
 * red ni React) para poder testearlo.
 */

export type BlogPageContent = {
  title: string
  /** Segunda línea del título, en cursiva. */
  titleEmphasis: string
  intro: string
  searchPlaceholder: string
  emptyNoPosts: string
  emptyNoResults: string
  seoTitle: string
  seoDescription: string
}

export type SanityBlogPage = {
  title?: string | null
  titleEmphasis?: string | null
  intro?: string | null
  searchPlaceholder?: string | null
  emptyNoPosts?: string | null
  emptyNoResults?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}

export const defaultBlogPage: BlogPageContent = {
  title: 'Ideas para navegar',
  titleEmphasis: 'lo que viene.',
  intro: 'Todo lo que publicamos sobre riesgo, ciberseguridad y cumplimiento, en un solo lugar.',
  searchPlaceholder: 'Buscar artículos...',
  emptyNoPosts:
    'Aún no hay artículos publicados. Cuando publiques un artículo en el Studio, aparecerá aquí.',
  emptyNoResults: 'No hay artículos que coincidan con tu búsqueda.',
  seoTitle: 'Blog',
  seoDescription:
    'Artículos sobre gestión de riesgos, ciberseguridad y cumplimiento ISO 31000, por el equipo de GROU Asesores.',
}

/** Texto recortado o el valor por defecto: nunca deja un campo vacío. */
function text(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

/** Mapea el documento de Sanity campo por campo, sin inventar datos. */
export function resolveBlogPage(raw: SanityBlogPage | null | undefined): BlogPageContent {
  const defaults = defaultBlogPage

  return {
    title: text(raw?.title, defaults.title),
    titleEmphasis: text(raw?.titleEmphasis, defaults.titleEmphasis),
    intro: text(raw?.intro, defaults.intro),
    searchPlaceholder: text(raw?.searchPlaceholder, defaults.searchPlaceholder),
    emptyNoPosts: text(raw?.emptyNoPosts, defaults.emptyNoPosts),
    emptyNoResults: text(raw?.emptyNoResults, defaults.emptyNoResults),
    // Sin SEO propio se usan los textos por defecto, no una composición: el
    // cliente tiene campos dedicados si quiere cambiarlos.
    seoTitle: text(raw?.seoTitle, defaults.seoTitle),
    seoDescription: text(raw?.seoDescription, defaults.seoDescription),
  }
}
