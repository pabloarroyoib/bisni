import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostBody } from '@/components/post-body'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { exampleSectors } from '@/lib/sector-defaults'
import {
  isSectorDraft,
  isSectorSlug,
  resolveSector,
  sectorHref,
  type SanitySector,
} from '@/lib/sectors'
import { getSectors } from '@/lib/sectors-server'
import { getSiteSettings } from '@/lib/site-settings-server'
import { SECTOR_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

/** Datos de la misma petición: los pide `generateMetadata` y el render. */
const getSector = cache(async (slug: string) => {
  const { data } = await sanityFetch({ query: SECTOR_QUERY, params: { slug } })
  return resolveSector(slug, data as SanitySector | null, exampleSectors)
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  if (!isSectorSlug(slug)) {
    return { title: 'Página no encontrada' }
  }

  const sector = await getSector(slug)

  if (!sector) {
    return { title: 'Página no encontrada' }
  }

  return {
    title: sector.seoTitle,
    description: sector.seoDescription,
    alternates: { canonical: sectorHref(sector.slug) },
    // El contenido de ejemplo no se indexa: mismo criterio que las legales.
    robots: { index: !isSectorDraft(sector), follow: true },
    openGraph: {
      type: 'website',
      title: sector.seoTitle,
      description: sector.seoDescription,
    },
  }
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!isSectorSlug(slug)) {
    notFound()
  }

  const sector = await getSector(slug)

  if (!sector) {
    notFound()
  }

  const [sectors, settings] = await Promise.all([getSectors(), getSiteSettings()])
  const draft = isSectorDraft(sector)

  return (
    <main className="site-shell">
      <SiteHeader sectors={sectors} />

      <span id="contenido" tabIndex={-1} />

      <article className="article-page">
        <Reveal className="article-header">
          <h1>{sector.title}</h1>
          {sector.summary && <p className="article-lead">{sector.summary}</p>}
          {draft && (
            <p className="draft-note" role="note">
              Contenido de ejemplo pendiente de aprobación del cliente. La página no se indexa ni
              aparece en el sitemap hasta marcar «Contenido aprobado» en el Studio.
            </p>
          )}
        </Reveal>

        <Reveal className="article-content">
          <PostBody value={sector.body} variant="page" />
        </Reveal>
      </article>

      <SiteFooter settings={settings} />
    </main>
  )
}
