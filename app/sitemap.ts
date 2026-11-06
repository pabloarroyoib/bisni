import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { client } from '@/sanity/lib/client'
import { SITEMAP_QUERY } from '@/sanity/lib/queries'

type SitemapPost = {
  slug: string
  lastModified?: string | null
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
    const posts = (await client.fetch(SITEMAP_QUERY)) as SitemapPost[] | null

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
    ]
  } catch (error) {
    // Si Sanity no responde durante el build, seguimos sirviendo las rutas fijas.
    console.error('[sitemap] No se pudieron cargar los artículos:', error)
    return staticRoutes
  }
}
