import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'

/**
 * Artículo destacado: el más reciente, con imagen grande (1600×900) y jerarquía
 * propia. Es la imagen más grande de la página, por eso va con `priority`.
 */
export function BlogHero({ post }: { post: BlogPost }) {
  return (
    <Link className="blog-hero" href={`/blog/${post.slug}`}>
      <div className={`blog-hero-art ${post.heroImageUrl ? 'has-image' : `no-image ${post.accent}`}`}>
        {post.heroImageUrl ? (
          <Image
            className="post-cover"
            src={post.heroImageUrl}
            alt={post.imageAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 620px"
          />
        ) : null}
      </div>
      <div className="blog-hero-body">
        <p className="section-kicker">Destacado</p>
        <div className="post-meta">
          <span>{post.categories.join(' · ')}</span>
          <span>{[post.date, post.read].filter(Boolean).join(' · ')}</span>
        </div>
        <h2>{post.title}</h2>
        {post.excerpt ? <p className="blog-hero-excerpt">{post.excerpt}</p> : null}
        <span className="post-card-cta">Leer artículo <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
  )
}
