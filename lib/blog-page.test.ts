import { describe, expect, it } from 'vitest'
import { defaultBlogPage, resolveBlogPage } from './blog-page'

describe('resolveBlogPage', () => {
  it('usa los textos por defecto cuando no hay documento', () => {
    expect(resolveBlogPage(null)).toEqual(defaultBlogPage)
  })

  it('toma los campos del documento y recorta espacios', () => {
    const page = resolveBlogPage({
      title: '  Riesgo en contexto ',
      titleEmphasis: ' para decidir.',
      intro: '  Notas del equipo.  ',
      searchPlaceholder: ' Buscar ',
      emptyNoPosts: ' Todavía nada. ',
      emptyNoResults: ' Sin coincidencias. ',
      seoTitle: ' Blog de GROU ',
      seoDescription: ' Artículos del equipo. ',
    })

    expect(page).toEqual({
      title: 'Riesgo en contexto',
      titleEmphasis: 'para decidir.',
      intro: 'Notas del equipo.',
      searchPlaceholder: 'Buscar',
      emptyNoPosts: 'Todavía nada.',
      emptyNoResults: 'Sin coincidencias.',
      seoTitle: 'Blog de GROU',
      seoDescription: 'Artículos del equipo.',
    })
  })

  it('completa los campos vacíos con el default, uno por uno', () => {
    const page = resolveBlogPage({ title: 'Solo el título', intro: '' })

    expect(page.title).toBe('Solo el título')
    expect(page.titleEmphasis).toBe(defaultBlogPage.titleEmphasis)
    expect(page.intro).toBe(defaultBlogPage.intro)
  })

  it('usa el SEO por defecto cuando el documento no trae uno', () => {
    const page = resolveBlogPage({ title: 'Ideas', intro: 'Bajada.' })

    expect(page.seoTitle).toBe(defaultBlogPage.seoTitle)
    expect(page.seoDescription).toBe(defaultBlogPage.seoDescription)
  })
})
