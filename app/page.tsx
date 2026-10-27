import { HomePage } from '@/components/home-page'
import { mapPosts, toCategoryNames, type SanityCategory, type SanityPost } from '@/lib/blog'
import { CATEGORIES_QUERY, POSTS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

export default async function Page() {
  const [postsResult, categoriesResult] = await Promise.all([
    sanityFetch({ query: POSTS_QUERY }),
    sanityFetch({ query: CATEGORIES_QUERY }),
  ])

  const posts = mapPosts(postsResult.data as SanityPost[] | null)
  const categories = toCategoryNames(categoriesResult.data as SanityCategory[] | null)

  return <HomePage posts={posts} categories={categories} />
}
