import { ContourField } from '@/components/contour-field'
import { HomePage } from '@/components/home-page'
import { SiteFooter } from '@/components/site-footer'
import { mapPosts, type SanityPost } from '@/lib/blog'
import { POSTS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

export default async function Page() {
  const postsResult = await sanityFetch({ query: POSTS_QUERY })

  const posts = mapPosts(postsResult.data as SanityPost[] | null)

  // `HomePage` es Client Component: si importara estos dos, arrastraría al bundle
  // del navegador el generador de paths del SVG (~100 KB). Se los pasamos ya
  // renderizados desde el servidor.
  return (
    <HomePage
      posts={posts}
      background={<ContourField />}
      contactBackground={<ContourField variant="panel" />}
      footer={<SiteFooter />}
    />
  )
}
