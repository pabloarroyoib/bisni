'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { BlogCard } from '@/components/blog-card'
import { BlogHero } from '@/components/blog-hero'
import { Reveal } from '@/components/reveal'
import type { BlogPost } from '@/lib/blog'

type BlogListProps = {
  posts: BlogPost[]
  categories: string[]
}

/** Cada cuántas tarjetas entra una ancha (ocupa dos columnas). */
const WIDE_EVERY = 5

/**
 * Listado completo del blog: buscador, filtros y grilla de tres columnas.
 *
 * El destacado se muestra solo sin filtros activos: si alguien busca o filtra,
 * los resultados aparecen todos en la grilla, sin jerarquía artificial.
 */
export function BlogList({ posts, categories }: BlogListProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          (category === 'Todos' || post.categories.includes(category)) &&
          `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, posts, query],
  )

  const isFiltering = category !== 'Todos' || query.trim().length > 0
  const heroPost = !isFiltering ? filteredPosts[0] : undefined
  const gridPosts = heroPost ? filteredPosts.slice(1) : filteredPosts

  return (
    <>
      <Reveal className="blog-controls">
        <label className="search-box">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar artículos</span>
          <input
            type="search"
            placeholder="Buscar artículos..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="category-filters">
          {categories.map((item) => (
            <button
              className={category === item ? 'active' : ''}
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {/* En móvil los filtros pasan a un desplegable: seis chips no entran en 390px. */}
        <label className="category-select">
          <span className="sr-only">Filtrar por categoría</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </Reveal>

      {heroPost ? (
        <Reveal variant="scale" className="blog-hero-reveal">
          <BlogHero post={heroPost} />
        </Reveal>
      ) : null}

      {filteredPosts.length === 0 ? (
        <Reveal>
          <p className="blog-empty">
            {posts.length === 0
              ? 'Aún no hay artículos publicados. Cuando publiques un artículo en el Studio, aparecerá aquí.'
              : 'No hay artículos que coincidan con tu búsqueda.'}
          </p>
        </Reveal>
      ) : (
        <div className="post-grid post-grid-3">
          {gridPosts.map((post, index) => {
            const variant = (index + 1) % WIDE_EVERY === 0 ? 'wide' : 'default'

            return (
              <Reveal
                className={`post-grid-reveal${variant === 'wide' ? ' is-wide' : ''}`}
                key={post._id}
              >
                <BlogCard post={post} variant={variant} />
              </Reveal>
            )
          })}
        </div>
      )}
    </>
  )
}
