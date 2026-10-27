import { describe, expect, it } from 'vitest'
import { mapPost, mapPosts, toCategoryNames, type SanityPost } from '@/lib/blog'

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
