import { notFound } from 'next/navigation'
import { mapPosts, type SanityPost } from '@/lib/blog'
import { POST_QUERY } from '@/sanity/lib/queries'
import { client } from '@/sanity/lib/client'
import type { Metadata } from 'next'
import { PostBody } from '@/components/post-body'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch(POST_QUERY, { slug })

  if (!post) {
    return {
      title: 'Artículo no encontrado',
    }
  }

  const typedPost = post as SanityPost

  return {
    title: `${typedPost.title} | bisni`,
    description: typedPost.excerpt || 'Artículo de bisni sobre gestión de riesgos',
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch(POST_QUERY, { slug })

  if (!post) {
    notFound()
  }

  const mappedPost = mapPosts([post as SanityPost])[0]

  if (!mappedPost) {
    notFound()
  }

  return (
    <main className="site-shell">
      <header className="navbar">
        <a className="brand" href="/" aria-label="bisni inicio">
          <span className="brand-mark">b</span>bisni<span className="brand-dot">.</span>
        </a>
        <nav className="nav-links">
          <a href="/">Inicio</a>
          <a href="/#servicios">Servicios</a>
          <a href="/#blog">Blog</a>
          <a href="/#contacto">Contacto</a>
        </nav>
        <a className="nav-cta" href="/#contacto">Solicitar diagnóstico</a>
      </header>

      <article className="article-page">
        <div className="article-header">
          <a href="/#blog" className="article-back">
            ← Volver al blog
          </a>
          <div className="article-meta">
            <span className="article-category">{mappedPost.category}</span>
            <span className="article-date">{mappedPost.date}</span>
            <span className="article-read">{mappedPost.read}</span>
          </div>
          <h1>{mappedPost.title}</h1>
          {mappedPost.excerpt && <p className="article-lead">{mappedPost.excerpt}</p>}
          {mappedPost.author && (
            <div className="article-author">
              {mappedPost.author.imageUrl && (
                <img
                  src={mappedPost.author.imageUrl}
                  alt={mappedPost.author.name || 'Autor'}
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
            <img src={mappedPost.imageUrl} alt={mappedPost.imageAlt} />
          </div>
        )}

        <div className="article-content">
          <div className="article-body">
            <PostBody value={mappedPost.body} />
          </div>
        </div>

        <div className="article-footer">
          <a href="/#contacto" className="button button-primary">
            ¿Tienes preguntas? Hablemos
          </a>
          <a href="/#blog" className="button button-ghost">
            Ver más artículos
          </a>
        </div>
      </article>

      <footer className="footer">
        <div className="footer-main">
          <div>
            <a className="brand footer-brand" href="/">
              <span className="brand-mark">b</span>bisni<span className="brand-dot">.</span>
            </a>
            <p>Riesgo claro.<br />Decisiones sólidas.</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Explora</strong>
              <a href="/#servicios">Servicios</a>
              <a href="/#blog">Perspectivas</a>
            </div>
            <div>
              <strong>Empresa</strong>
              <a href="/#contacto">Contacto</a>
              <a href="/#contacto">Sobre bisni</a>
            </div>
            <div>
              <strong>Legal</strong>
              <a href="/#contacto">Aviso legal</a>
              <a href="/#contacto">Privacidad</a>
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
