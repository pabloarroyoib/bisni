import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BarChart3, FileCheck2, ShieldCheck, Sparkles } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'

/**
 * Icono de relleno cuando el artículo no tiene imagen principal. Los íconos van
 * inline y no en una variable: asignar un componente dentro del render lo marca
 * la regla `react-hooks/static-components`.
 */
function CategoryMark({ category }: { category: string }) {
  if (category === 'Ciberseguridad') {
    return <span className="post-art-mark"><ShieldCheck aria-hidden="true" /></span>
  }
  if (category === 'Finanzas') {
    return <span className="post-art-mark"><BarChart3 aria-hidden="true" /></span>
  }
  if (category === 'Normativa') {
    return <span className="post-art-mark"><FileCheck2 aria-hidden="true" /></span>
  }
  return <span className="post-art-mark"><Sparkles aria-hidden="true" /></span>
}

/**
 * Tarjeta de artículo. La usan la home (teaser) y la página de blog.
 *
 * `variant="wide"` la convierte en una tarjeta horizontal que ocupa dos columnas
 * de la grilla: es la que rompe la monotonía cada tanto. Sin imagen no queda un
 * bloque gris: usa el acento de la categoría con la textura de curvas.
 */
export function BlogCard({
  post,
  variant = 'default',
}: {
  post: BlogPost
  variant?: 'default' | 'wide'
}) {
  const wide = variant === 'wide'

  return (
    <Link className={`post-card${wide ? ' post-card-wide' : ''}`} href={`/blog/${post.slug}`}>
      <div className={`post-art ${post.imageUrl ? 'has-image' : `no-image ${post.accent}`}`}>
        {post.imageUrl ? (
          <Image
            className="post-cover"
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            sizes="(max-width: 650px) 50vw, (max-width: 900px) 50vw, 25vw"
          />
        ) : (
          <CategoryMark category={post.categories[0]} />
        )}
      </div>
      <div className="post-card-body">
        <div className="post-meta">
          <span>{post.categories.join(' · ')}</span>
          <span>{[post.date, post.read].filter(Boolean).join(' · ')}</span>
        </div>
        <h3>{post.title}</h3>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
        <span className="post-card-cta">Leer artículo <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
  )
}
