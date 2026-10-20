import { defineQuery } from 'next-sanity'

export const POSTS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  mainImage,
  "category": categories[0]->title,
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
  "category": categories[0]->title,
  "author": author->{
    name,
    slug,
    image
  },
  body
}`)
