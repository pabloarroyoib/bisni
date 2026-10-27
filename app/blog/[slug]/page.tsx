import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { mapPost, type SanityPost } from '@/lib/blog'
import { POST_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import type { Metadata } from 'next'
import { PostBody } from '@/components/post-body'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data } = await sanityFetch({ query: POST_QUERY, params: { slug } })
  const post = data as SanityPost | null

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
  const { data } = await sanityFetch({ query: POST_QUERY, params: { slug } })
  const mappedPost = mapPost(data as SanityPost | null)

  if (!mappedPost) {
    notFound()
  }

  return (
    <main className="site-shell">
      <header className="navbar">
        <Link className="brand" href="/" aria-label="bisni inicio">
          <span className="brand-mark">b</span>bisni<span className="brand-dot">.</span>
        </Link>
        <nav className="nav-links">
          <Link href="/">Inicio</Link>
          <Link href="/#servicios">Servicios</Link>
          <Link href="/#blog">Blog</Link>
          <Link href="/#contacto">Contacto</Link>
        </nav>
        <Link className="nav-cta" href="/#contacto">Solicitar diagnóstico</Link>
      </header>

      <article className="article-page">
        <div className="article-header">
          <Link href="/#blog" className="article-back">
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
        </div>

        {mappedPost.imageUrl && (
          <div className="article-hero-image">
            <Image
              src={mappedPost.imageUrl}
              alt={mappedPost.imageAlt}
              width={800}
              height={500}
              sizes="(max-width: 900px) 100vw, 800px"
              priority
            />
          </div>
        )}

        <div className="article-content">
          <PostBody value={mappedPost.body} />
        </div>

        <div className="article-footer">
          <Link href="/#contacto" className="button button-primary">
            ¿Tienes preguntas? Hablemos
          </Link>
          <Link href="/#blog" className="button button-ghost">
            Ver más artículos
          </Link>
        </div>
      </article>

      <footer className="footer">
        <div className="footer-main">
          <div>
            <Link className="brand footer-brand" href="/">
              <span className="brand-mark">b</span>bisni<span className="brand-dot">.</span>
            </Link>
            <p>Riesgo claro.<br />Decisiones sólidas.</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Explora</strong>
              <Link href="/#servicios">Servicios</Link>
              <Link href="/#blog">Perspectivas</Link>
            </div>
            <div>
              <strong>Empresa</strong>
              <Link href="/#contacto">Contacto</Link>
              <Link href="/#contacto">Sobre bisni</Link>
            </div>
            <div>
              <strong>Legal</strong>
              <Link href="/#contacto">Aviso legal</Link>
              <Link href="/#contacto">Privacidad</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 bisni. Protegiendo tu futuro corporativo.</span>
        </div>
      </footer>
    </main>
  )
}
