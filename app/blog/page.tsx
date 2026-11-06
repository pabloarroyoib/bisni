import type { Metadata } from 'next'
import { BlogList } from '@/components/blog-list'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { mapPosts, toCategoryNames, type SanityCategory, type SanityPost } from '@/lib/blog'
import { siteUrl } from '@/lib/site'
import { CATEGORIES_QUERY, POSTS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Artículos sobre gestión de riesgos, ciberseguridad y cumplimiento ISO 31000, por el equipo de bisni.',
  alternates: { canonical: `${siteUrl}/blog` },
}

export default async function BlogIndexPage() {
  const [postsResult, categoriesResult] = await Promise.all([
    sanityFetch({ query: POSTS_QUERY }),
    sanityFetch({ query: CATEGORIES_QUERY }),
  ])

  const posts = mapPosts(postsResult.data as SanityPost[] | null)
  const categories = toCategoryNames(categoriesResult.data as SanityCategory[] | null)

  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="blog blog-index section">
        <div className="section-heading">
          <div>
            <h1>Ideas para navegar<br /><em>lo que viene.</em></h1>
          </div>
          <p className="section-intro">
            Todo lo que publicamos sobre riesgo, ciberseguridad y cumplimiento, en un solo lugar.
          </p>
        </div>

        <BlogList posts={posts} categories={categories} />
      </section>

      <SiteFooter />
    </main>
  )
}
