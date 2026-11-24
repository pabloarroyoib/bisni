import { cache } from 'react'
import { BLOG_PAGE_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import { defaultBlogPage, resolveBlogPage, type BlogPageContent, type SanityBlogPage } from './blog-page'

/**
 * Portada del blog desde Sanity.
 *
 * `cache()` deduplica la consulta dentro de la misma petición: la metadata y el
 * render la piden una sola vez. Si Sanity no responde o el documento no existe,
 * devuelve los textos por defecto para no romper la página.
 *
 * Este módulo es solo de servidor: importa `sanityFetch`.
 */
export const getBlogPage = cache(async (): Promise<BlogPageContent> => {
  try {
    const { data } = await sanityFetch({ query: BLOG_PAGE_QUERY })
    return resolveBlogPage(data as SanityBlogPage | null)
  } catch (error) {
    console.error('[blog] No se pudo cargar la portada desde Sanity:', error)
    return defaultBlogPage
  }
})
