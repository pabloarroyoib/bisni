import { defineQuery } from 'next-sanity'

export const POSTS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  mainImage,
  "categories": categories[]->title,
  "author": author->{
    name,
    slug,
    image
  },
  body
}`)

export const CATEGORIES_QUERY = defineQuery(`*[_type == "category" && defined(title)] | order(title asc) {
  title
}`)

export const POST_QUERY = defineQuery(`*[_type == "post" && (slug.current == $slug || _id == $slug)][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  mainImage,
  "categories": categories[]->title,
  "author": author->{
    name,
    slug,
    image
  },
  body
}`)

export const SITEMAP_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
  "slug": slug.current,
  "lastModified": coalesce(_updatedAt, publishedAt, _createdAt)
}`)

/**
 * Contenido de la home. El `_id` es fijo porque es un singleton: si el documento
 * todavía no existe, la consulta devuelve `null` y el resolver usa los defaults.
 */
export const HOME_QUERY = defineQuery(`*[_id == "homePage"][0]{
  nav { items[] { label, href, variant }, socials[] { network, href } },
  hero { title, paragraph, cards[] { title, text } },
  stages { kicker, title, label, intro, stages[] { title, text, icon } },
  about {
    kicker,
    title,
    mission,
    cta { label, href },
    slides[] { image, alt, title, isLogo, pad }
  },
  risks {
    title,
    intro,
    sections[] {
      title,
      paragraphs,
      label,
      box { title, text },
      terms[] { name, text, note },
      chips,
      subs[] { title, paragraphs, label, box { title, text }, terms[] { name, text, note }, chips }
    }
  },
  blog { kicker, title },
  newsletter { kicker, title, bridgeText, bridgeLink { label, href } },
  contact {
    kicker,
    title,
    paragraph,
    form {
      nameLabel,
      namePlaceholder,
      companyLabel,
      companyPlaceholder,
      emailLabel,
      emailPlaceholder,
      messageLabel,
      messagePlaceholder,
      submitLabel,
      sendingLabel,
      privacyNote,
      privacyLinkLabel
    }
  },
  footer { tagline, linkGroups[] { title, links[] { label, href } }, legal }
}`)

/**
 * Datos legales y de contacto del responsable. Singleton con `_id` fijo: si el
 * documento no existe, la consulta devuelve `null` y el resolver usa los
 * valores por defecto (vacíos, sin datos inventados).
 */
export const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  legalName,
  tradeName,
  taxId,
  address,
  officeAddress,
  phone,
  email,
  privacyEmail,
  website,
  jurisdiction,
  ssnCondition,
  ssnRegistration,
  ssnRegistry,
  ssnUrl,
  ssnLogo,
  ssnShowInFooter
}`)

/**
 * Página legal por slug. Si el documento todavía no existe, la consulta devuelve
 * `null` y `resolveLegalPage` cae al borrador estático de `lib/legal-content.ts`.
 */
export const LEGAL_PAGE_QUERY = defineQuery(`*[_type == "legalPage" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  body,
  lastUpdated,
  seoTitle,
  seoDescription,
  reviewed
}`)

/**
 * Solo las páginas legales aprobadas entran al sitemap: un texto sin revisar no
 * se indexa, así que tampoco se anuncia.
 */
export const SITEMAP_LEGAL_QUERY = defineQuery(`*[_type == "legalPage" && reviewed == true && defined(slug.current)]{
  "slug": slug.current,
  "lastModified": coalesce(lastUpdated, _updatedAt, _createdAt)
}`)

/**
 * Sectores para el desplegable del navbar. Se ordenan por `order` y los que no
 * la tienen caen al final, alfabéticos. Los borradores también aparecen: el
 * aviso de borrador vive en la página, y así el cliente puede revisar su sector
 * antes de aprobarlo.
 */
export const SECTORS_QUERY = defineQuery(`*[_type == "sector" && defined(slug.current)] | order(coalesce(order, 999) asc, title asc) {
  title,
  "slug": slug.current
}`)

/** Sector por slug. `null` cuando no existe: la página resuelve con el default o 404. */
export const SECTOR_QUERY = defineQuery(`*[_type == "sector" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  summary,
  body,
  reviewed,
  seoTitle,
  seoDescription
}`)

/** Igual que las legales: un sector sin aprobar no se anuncia en el sitemap. */
export const SITEMAP_SECTORS_QUERY = defineQuery(`*[_type == "sector" && reviewed == true && defined(slug.current)]{
  "slug": slug.current,
  "lastModified": coalesce(_updatedAt, _createdAt)
}`)
