import type { Metadata } from 'next'
import { BlogList } from '@/components/blog-list'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { mapPosts, toCategoryNames, type SanityCategory, type SanityPost } from '@/lib/blog'
import { getBlogPage } from '@/lib/blog-page-server'
import { getSectors } from '@/lib/sectors-server'
import { getSiteSettings } from '@/lib/site-settings-server'
import { siteUrl } from '@/lib/site'
import { CATEGORIES_QUERY, POSTS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBlogPage()

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `${siteUrl}/blog` },
  }
}

export default async function BlogIndexPage() {
  const [postsResult, categoriesResult, settings, sectors, page] = await Promise.all([
    sanityFetch({ query: POSTS_QUERY }),
    sanityFetch({ query: CATEGORIES_QUERY }),
    getSiteSettings(),
    getSectors(),
    getBlogPage(),
  ])

  const posts = mapPosts(postsResult.data as SanityPost[] | null)
  const categories = toCategoryNames(categoriesResult.data as SanityCategory[] | null)

  return (
    <main className="site-shell">
      <SiteHeader sectors={sectors} />

      <section className="blog blog-index section">
        <Reveal className="section-heading">
          <div>
            <h1>
              {page.title}
              <br />
              <em>{page.titleEmphasis}</em>
            </h1>
          </div>
          <p className="section-intro">{page.intro}</p>
        </Reveal>

        <BlogList
          posts={posts}
          categories={categories}
          copy={{
            searchPlaceholder: page.searchPlaceholder,
            emptyNoPosts: page.emptyNoPosts,
            emptyNoResults: page.emptyNoResults,
          }}
        />
      </section>

      <SiteFooter settings={settings} />
    </main>
  )
}
