import { ContourField } from '@/components/contour-field'
import { HomePage } from '@/components/home-page'
import { SiteFooter } from '@/components/site-footer'
import { mapPosts, type SanityPost } from '@/lib/blog'
import { resolveHomeContent, type SanityHomePage } from '@/lib/home-content'
import { getSectors } from '@/lib/sectors-server'
import { getSiteSettings } from '@/lib/site-settings-server'
import { HOME_QUERY, POSTS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

export default async function Page() {
  const [postsResult, homeResult, settings, sectors] = await Promise.all([
    sanityFetch({ query: POSTS_QUERY }),
    sanityFetch({ query: HOME_QUERY }),
    getSiteSettings(),
    getSectors(),
  ])

  const posts = mapPosts(postsResult.data as SanityPost[] | null)
  const content = resolveHomeContent(homeResult.data as SanityHomePage | null, settings)

  // `HomePage` es Client Component: si importara estos dos, arrastraría al bundle
  // del navegador el generador de paths del SVG (~100 KB). Se los pasamos ya
  // renderizados desde el servidor.
  return (
    <HomePage
      content={content}
      posts={posts}
      background={<ContourField />}
      contactBackground={<ContourField variant="panel" />}
      sectors={sectors}
      footer={
        <SiteFooter
          content={content.footer}
          socials={content.navSocials}
          settings={settings}
        />
      }
    />
  )
}
