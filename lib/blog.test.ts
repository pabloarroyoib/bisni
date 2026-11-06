import { describe, expect, it } from 'vitest'
import { mapPost, mapPosts, pickRelatedPosts, toCategoryNames, type SanityPost } from '@/lib/blog'

function block(text: string) {
  return {
    _type: 'block',
    children: [{ _type: 'span', text }],
  }
}

const basePost: SanityPost = {
  _id: 'post-1',
  title: 'Gestión de riesgos en 2026',
  slug: 'gestion-de-riesgos-2026',
  excerpt: 'Una guía breve.',
  publishedAt: '2026-10-23T10:00:00.000Z',
  categories: ['Ciberseguridad'],
  body: [block('uno dos tres')],
}

describe('mapPosts', () => {
  it('normaliza un post de Sanity al modelo de UI', () => {
    const [post] = mapPosts([basePost])

    expect(post).toMatchObject({
      _id: 'post-1',
      slug: 'gestion-de-riesgos-2026',
      title: 'Gestión de riesgos en 2026',
      excerpt: 'Una guía breve.',
      categories: ['Ciberseguridad'],
      accent: 'cyan',
      imageUrl: null,
      imageAlt: 'Gestión de riesgos en 2026',
    })
  })

  it('usa el _id como slug cuando falta el slug', () => {
    const [post] = mapPosts([{ ...basePost, slug: null }])
    expect(post?.slug).toBe('post-1')
  })

  it('aplica valores por defecto cuando faltan datos', () => {
    const [post] = mapPosts([{ _id: 'sin-datos' }])

    expect(post).toMatchObject({
      title: 'Sin título',
      excerpt: '',
      categories: ['Perspectivas'],
      date: '',
    })
  })

  it('elige el color de acento según la categoría', () => {
    const posts = mapPosts([
      { ...basePost, _id: 'a', categories: ['Ciberseguridad'] },
      { ...basePost, _id: 'b', categories: ['Finanzas'] },
      { ...basePost, _id: 'c', categories: ['Normativa'] },
      { ...basePost, _id: 'd', categories: ['Estrategia'] },
    ])

    expect(posts.map((post) => post.accent)).toEqual(['cyan', 'navy', 'lime', 'orange'])
  })

  it('calcula el tiempo de lectura a partir del contenido', () => {
    const longText = Array.from({ length: 600 }, (_, index) => `palabra${index}`).join(' ')
    const [post] = mapPosts([{ ...basePost, body: [block(longText)] }])

    expect(post?.read).toBe('3 min')
  })

  it('devuelve "1 min" cuando no hay contenido legible', () => {
    const [post] = mapPosts([{ ...basePost, body: null }])
    expect(post?.read).toBe('1 min')
  })

  it('tolera entradas nulas', () => {
    expect(mapPosts(null)).toEqual([])
    expect(mapPosts(undefined)).toEqual([])
  })
})

describe('mapPost', () => {
  it('devuelve null si no hay post', () => {
    expect(mapPost(null)).toBeNull()
  })

  it('mapea un único post', () => {
    expect(mapPost(basePost)?._id).toBe('post-1')
  })
})

describe('toCategoryNames', () => {
  it('antepone "Todos" y elimina duplicados y vacíos', () => {
    expect(
      toCategoryNames([
        { title: 'Ciberseguridad' },
        { title: 'Finanzas' },
        { title: 'Ciberseguridad' },
        { title: null },
      ]),
    ).toEqual(['Todos', 'Ciberseguridad', 'Finanzas'])
  })

  it('solo devuelve "Todos" sin categorías', () => {
    expect(toCategoryNames(null)).toEqual(['Todos'])
  })
})

describe('pickRelatedPosts', () => {
  function post(id: string, categories: string[], iso: string): SanityPost {
    return {
      _id: id,
      title: `Titulo ${id}`,
      slug: id,
      publishedAt: iso,
      categories,
      body: [block('texto')],
    }
  }

  const actual = post('actual', ['Ciberseguridad', 'Normativa'], '2026-10-28T00:00:00Z')
  const mismaCategoria = post('ciber', ['Ciberseguridad'], '2026-10-20T00:00:00Z')
  const tambienNormativa = post('norma', ['Normativa'], '2026-10-10T00:00:00Z')
  const otraCategoria = post('finanzas', ['Finanzas'], '2026-10-27T00:00:00Z')
  const todos = mapPosts([actual, otraCategoria, mismaCategoria, tambienNormativa])

  it('excluye el artículo actual', () => {
    const resultado = pickRelatedPosts(todos, 'actual', 3)
    expect(resultado.map((p) => p._id)).not.toContain('actual')
  })

  it('prioriza los de la misma categoría y completa con los más recientes', () => {
    const resultado = pickRelatedPosts(todos, 'actual', 3)
    expect(resultado.map((p) => p._id)).toEqual(['ciber', 'norma', 'finanzas'])
  })

  it('respeta el límite y no repite artículos', () => {
    const resultado = pickRelatedPosts(todos, 'actual', 2)
    expect(resultado).toHaveLength(2)
    expect(new Set(resultado.map((p) => p._id)).size).toBe(2)
  })

  it('sin artículos relacionados devuelve lista vacía', () => {
    const soloActual = mapPosts([actual])
    expect(pickRelatedPosts(soloActual, 'actual', 3)).toEqual([])
  })

  it('con una lista vacía devuelve lista vacía', () => {
    expect(pickRelatedPosts([], 'actual', 3)).toEqual([])
  })
})
