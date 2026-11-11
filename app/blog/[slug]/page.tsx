import { cache } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BlogCard } from '@/components/blog-card'
import { mapPost, mapPosts, pickRelatedPosts, type SanityPost } from '@/lib/blog'
import { POSTS_QUERY, POST_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import type { Metadata } from 'next'
import { PostBody } from '@/components/post-body'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Reveal } from '@/components/reveal'

/**
 * `cache()` deduplica la petición entre `generateMetadata` y el render: sin él
 * se hacían dos fetches del mismo post por visita.
 */
const getPost = cache(async (slug: string) => {
  const { data } = await sanityFetch({ query: POST_QUERY, params: { slug } })
  return data as SanityPost | null
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Artículo no encontrado',
    }
  }

  return {
    title: post.title ?? 'Artículo',
    description: post.excerpt || 'Artículo de bisni sobre gestión de riesgos',
    alternates: {
      canonical: `/blog/${post.slug ?? slug}`,
    },
    openGraph: post.excerpt
      ? {
          type: 'article',
          title: post.title ?? undefined,
          description: post.excerpt,
          publishedTime: post.publishedAt ?? undefined,
        }
      : undefined,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mappedPost = mapPost(await getPost(slug))

  if (!mappedPost) {
    notFound()
  }

  // Relacionados: primero los de la misma categoría, completando con los más recientes.
  const postsResult = await sanityFetch({ query: POSTS_QUERY })
  const relatedPosts = pickRelatedPosts(
    mapPosts(postsResult.data as SanityPost[] | null),
    mappedPost._id,
    3,
  )

  return (
    <main className="site-shell">
      <SiteHeader />

      <span id="contenido" tabIndex={-1} />

      <article className="article-page">
        <Reveal className="article-header">
          <Link href="/blog" className="article-back">
            ← Volver al blog
          </Link>
          <div className="article-meta">
            <span className="article-category">{mappedPost.categories.join(' · ')}</span>
            <span className="article-date">{mappedPost.date}</span>
            <span className="article-read">{mappedPost.read}</span>
          </div>
          <h1>{mappedPost.title}</h1>
          {mappedPost.excerpt && <p className="article-lead">{mappedPost.excerpt}</p>}
          {mappedPost.author && (
            <div className="article-author">
              {mappedPost.author.imageUrl && (
                <Image
                  src={mappedPost.author.imageUrl}
                  alt={mappedPost.author.name || 'Autor'}
                  width={100}
                  height={100}
                  className="author-avatar"
                />
              )}
              <span className="author-name">
                {mappedPost.author.name ? `por ${mappedPost.author.name}` : ''}
              </span>
            </div>
          )}
        </Reveal>

        {mappedPost.imageUrl && (
          <Reveal variant="scale" className="article-hero-image">
            <Image
              src={mappedPost.imageUrl}
              alt={mappedPost.imageAlt}
              width={800}
              height={500}
              sizes="(max-width: 900px) 100vw, 800px"
              priority
            />
          </Reveal>
        )}

        <Reveal className="article-content">
          <PostBody value={mappedPost.body} />
        </Reveal>

      </article>

      {relatedPosts.length > 0 ? (
        <section className="related section" aria-labelledby="related-title">
          <Reveal className="related-head">
            <h2 id="related-title">También te puede interesar</h2>
            <Link href="/blog" className="button button-dark">
              Ver todas las notas <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
          <div className="related-grid">
            {relatedPosts.map((post) => (
              <Reveal className="related-card-reveal" key={post._id}>
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  )
}
