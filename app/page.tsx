import { HomePage } from '@/components/home-page'
import { mapPosts } from '@/lib/blog'
import { CATEGORIES_QUERY, POSTS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

export default async function Page() {
  const [{ data: posts }, { data: categories }] = await Promise.all([
    sanityFetch({ query: POSTS_QUERY }),
    sanityFetch({ query: CATEGORIES_QUERY }),
  ])

  const mappedPosts = mapPosts(posts)
  const categoryNames = [
    'Todos',
    ...new Set(
      (categories ?? [])
        .map((category) => category.title)
        .filter((title): title is string => Boolean(title)),
    ),
  ]

  return <HomePage posts={mappedPosts} categories={categoryNames} />
}
