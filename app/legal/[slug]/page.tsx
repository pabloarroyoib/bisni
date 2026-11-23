import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostBody } from '@/components/post-body'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import {
  formatLegalDate,
  isLegalDraft,
  resolveLegalBlocks,
  resolveLegalPage,
  type SanityLegalPage,
} from '@/lib/legal'
import { LEGAL_ROUTES, isLegalSlug, legalHref, type LegalSlug } from '@/lib/legal-routes'
import { getSectors } from '@/lib/sectors-server'
import { mapSiteSettings, ssnRegistrationLabel, type SanitySiteSettings } from '@/lib/site-settings'
import { LEGAL_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

/** Los datos llegan en la misma petición: se piden una vez para la metadata y el render. */
const getLegalPage = cache(async (slug: LegalSlug) => {
  const [pageResult, settingsResult] = await Promise.all([
    sanityFetch({ query: LEGAL_PAGE_QUERY, params: { slug } }),
    sanityFetch({ query: SITE_SETTINGS_QUERY }),
  ])

  const settings = mapSiteSettings(settingsResult.data as SanitySiteSettings | null)
  const page = resolveLegalPage(slug, pageResult.data as SanityLegalPage | null)

  return { page, settings }
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  if (!isLegalSlug(slug)) {
    return { title: 'Página no encontrada' }
  }

  const { page, settings } = await getLegalPage(slug)
  const draft = isLegalDraft(page, settings)

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: {
      canonical: legalHref(slug),
    },
    // Un texto sin revisar no se indexa, pero sus enlaces sí se siguen.
    robots: { index: !draft, follow: true },
    openGraph: {
      type: 'website',
      title: page.seoTitle,
      description: page.seoDescription,
    },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Las dos rutas legales son fijas: cualquier otro slug es un 404.
  if (!isLegalSlug(slug)) {
    notFound()
  }

  const { page, settings } = await getLegalPage(slug)
  const sectors = await getSectors()
  const draft = isLegalDraft(page, settings)
  const lastUpdated = formatLegalDate(page.lastUpdated)
  const ssnLine = [ssnRegistrationLabel(settings), settings.ssnCondition].filter(Boolean).join(' · ')
  const otherPages = LEGAL_ROUTES.filter((route) => route.slug !== page.slug)

  return (
    <main className="site-shell">
      <SiteHeader sectors={sectors} />

      <span id="contenido" tabIndex={-1} />

      <article className="article-page">
        <Reveal className="article-header legal-header">
          <h1>{page.title}</h1>
          {lastUpdated && <p className="article-lead">Última actualización: {lastUpdated}</p>}
          {draft && (
            <p className="draft-note" role="note">
              Borrador pendiente de revisión legal. Los datos marcados como pendientes todavía no
              fueron confirmados.
            </p>
          )}
        </Reveal>

        {/* Procedencia de la matrícula: el logo de la SSN solo va en el aviso legal
            y solo si el cliente lo cargó en "Datos del sitio". */}
        {page.slug === 'aviso-legal' && settings.ssnLogo && (
          <div className="legal-ssn">
            <a
              href={settings.ssnUrl || 'https://www.ssn.gob.ar'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={settings.ssnLogo.url}
                alt={settings.ssnLogo.alt}
                width={240}
                height={80}
                className="legal-ssn-logo"
              />
            </a>
            {ssnLine && <p className="legal-ssn-line">{ssnLine}</p>}
          </div>
        )}

        <Reveal className="article-content">
          <PostBody value={resolveLegalBlocks(page.body, settings)} variant="page" />
        </Reveal>

        <nav className="legal-links" aria-label="Otras páginas legales">
          {otherPages.map((route) => (
            <Link key={route.slug} href={legalHref(route.slug)}>
              {route.label}
            </Link>
          ))}
        </nav>
      </article>

      <SiteFooter settings={settings} />
    </main>
  )
}
