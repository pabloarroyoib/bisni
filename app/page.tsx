import { HomePage } from '@/components/home-page'
import { mapPosts } from '@/lib/blog'
import { CATEGORIES_QUERY, POSTS_QUERY } from '@/sanity/lib/queries'
import { client } from '@/sanity/lib/client'

export default async function Page() {
  const [posts, categories] = await Promise.all([
    client.fetch(POSTS_QUERY),
    client.fetch(CATEGORIES_QUERY),
  ])

  const mappedPosts = mapPosts(posts)
  const categoryNames = [
    'Todos',
    ...new Set(
      (categories ?? [])
        .map((category: any) => category.title)
        .filter((title: any): title is string => Boolean(title)),
    ),
  ]

  return <HomePage posts={mappedPosts} categories={categoryNames as string[]} />
}
