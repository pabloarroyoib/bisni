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
    details[] { icon, text, href },
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
      privacyNote
    }
  },
  footer { tagline, linkGroups[] { title, links[] { label, href } }, legal }
}`)

