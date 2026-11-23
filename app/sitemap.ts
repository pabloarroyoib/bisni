import type { MetadataRoute } from 'next'
import { isLegalSlug } from '@/lib/legal-routes'
import { isSectorSlug } from '@/lib/sectors'
import { siteUrl } from '@/lib/site'
import { client } from '@/sanity/lib/client'
import { SITEMAP_LEGAL_QUERY, SITEMAP_QUERY, SITEMAP_SECTORS_QUERY } from '@/sanity/lib/queries'

type SitemapPost = {
  slug: string
  lastModified?: string | null
}

/** Fecha válida para el sitemap; `undefined` si el dato no se puede interpretar. */
function sitemapDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  try {
    const [posts, legalPages, sectors] = await Promise.all([
      client.fetch(SITEMAP_QUERY) as Promise<SitemapPost[] | null>,
      client.fetch(SITEMAP_LEGAL_QUERY) as Promise<SitemapPost[] | null>,
      client.fetch(SITEMAP_SECTORS_QUERY) as Promise<SitemapPost[] | null>,
    ])

    return [
      ...staticRoutes,
      ...(posts ?? [])
        .filter((post) => Boolean(post.slug))
        .map((post) => ({
          url: `${siteUrl}/blog/${post.slug}`,
          lastModified: post.lastModified ? new Date(post.lastModified) : undefined,
          changeFrequency: 'yearly' as const,
          priority: 0.6,
        })),
      // Cada sector aprobado es una página más; un borrador no se anuncia ni con
      // un slug válido.
      ...(sectors ?? [])
        .filter((sector) => Boolean(sector.slug) && isSectorSlug(sector.slug))
        .map((sector) => ({
          url: `${siteUrl}/sectores/${sector.slug}`,
          lastModified: sitemapDate(sector.lastModified),
          changeFrequency: 'yearly' as const,
          priority: 0.5,
        })),
      // Solo se anuncian las páginas legales aprobadas y con un slug conocido;
      // una ruta legal no puede inventarse desde el CMS.
      ...(legalPages ?? [])
        .filter((page) => Boolean(page.slug) && isLegalSlug(page.slug))
        .map((page) => ({
          url: `${siteUrl}/legal/${page.slug}`,
          lastModified: sitemapDate(page.lastModified),
          changeFrequency: 'yearly' as const,
          priority: 0.3,
        })),
    ]
  } catch (error) {
    // Si Sanity no responde durante el build, seguimos sirviendo las rutas fijas.
    console.error('[sitemap] No se pudieron cargar los artículos:', error)
    return staticRoutes
  }
}
