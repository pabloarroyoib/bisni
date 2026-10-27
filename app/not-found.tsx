import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="site-shell">
      <article className="article-page">
        <div className="article-header">
          <p className="section-kicker">Error 404</p>
          <h1>Esta página no existe.</h1>
          <p className="article-lead">
            Puede que el enlace haya cambiado o que el artículo ya no esté publicado.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/">
              Volver al inicio
            </Link>
            <Link className="button button-ghost" href="/#blog">
              Ver el blog
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
