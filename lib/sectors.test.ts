import { describe, expect, it } from 'vitest'
import { exampleSectors } from './sector-defaults'
import {
  isSectorDraft,
  isSectorSlug,
  mapSectors,
  resolveSector,
  sectorHref,
  toSectorLink,
} from './sectors'

describe('isSectorSlug', () => {
  it('acepta minúsculas, números y guiones', () => {
    expect(isSectorSlug('inmobiliaria')).toBe(true)
    expect(isSectorSlug('salud-2026')).toBe(true)
  })

  it('rechaza mayúsculas, espacios y barras', () => {
    expect(isSectorSlug('Inmobiliaria')).toBe(false)
    expect(isSectorSlug('sector salud')).toBe(false)
    expect(isSectorSlug('inmobiliaria/otro')).toBe(false)
    expect(isSectorSlug('')).toBe(false)
  })
})

describe('sectorHref', () => {
  it('arma la ruta del sector', () => {
    expect(sectorHref('inmobiliaria')).toBe('/sectores/inmobiliaria')
  })
})

describe('toSectorLink', () => {
  it('normaliza espacios en título y slug', () => {
    expect(toSectorLink({ title: '  Inmobiliaria ', slug: ' inmobiliaria ', summary: null })).toEqual({
      title: 'Inmobiliaria',
      slug: 'inmobiliaria',
    })
  })

  it('descarta documentos sin título, sin slug o con slug inválido', () => {
    expect(toSectorLink({ slug: 'inmobiliaria' })).toBeUndefined()
    expect(toSectorLink({ title: 'Inmobiliaria' })).toBeUndefined()
    expect(toSectorLink({ title: 'Inmobiliaria', slug: 'Inmobiliaria' })).toBeUndefined()
    expect(toSectorLink(null)).toBeUndefined()
  })
})

describe('mapSectors', () => {
  it('conserva el orden de la query y descarta los incompletos', () => {
    const sectors = mapSectors([
      { title: 'Salud', slug: 'salud', summary: 'Coberturas de salud' },
      { title: 'Roto' },
      { title: 'Inmobiliaria', slug: 'inmobiliaria' },
    ])

    expect(sectors.map((sector) => sector.slug)).toEqual(['salud', 'inmobiliaria'])
  })

  it('devuelve una lista vacía cuando no hay documentos', () => {
    expect(mapSectors(null)).toEqual([])
    expect(mapSectors([])).toEqual([])
  })
})

describe('resolveSector', () => {
  it('prefiere el documento de Sanity sobre el ejemplo', () => {
    const sector = resolveSector(
      'inmobiliaria',
      {
        title: 'Inmobiliaria y real estate',
        slug: 'inmobiliaria',
        summary: 'Texto del cliente',
        body: [{ _key: 'a', _type: 'block', children: [] }],
        reviewed: true,
        seoTitle: 'Seguros inmobiliarios',
        seoDescription: 'Descripción propia',
      },
      exampleSectors,
    )

    expect(sector).toMatchObject({
      title: 'Inmobiliaria y real estate',
      summary: 'Texto del cliente',
      reviewed: true,
      seoTitle: 'Seguros inmobiliarios',
      seoDescription: 'Descripción propia',
    })
    expect(sector?.body).toHaveLength(1)
  })

  it('cae al ejemplo cuando el documento está incompleto', () => {
    expect(resolveSector('inmobiliaria', { title: 'Inmobiliaria' }, exampleSectors)).toBe(
      exampleSectors[0],
    )
  })

  it('devuelve undefined para un slug desconocido: la página responde 404', () => {
    expect(resolveSector('mineria', null, exampleSectors)).toBeUndefined()
    expect(resolveSector('mineria', { title: 'Minería', slug: 'mineria' }, exampleSectors)).toMatchObject({
      slug: 'mineria',
    })
  })

  it('usa el título y el resumen como SEO cuando el documento no los define', () => {
    const sector = resolveSector(
      'salud',
      { title: 'Salud', slug: 'salud', summary: 'Coberturas para clínicas' },
      [],
    )

    expect(sector).toMatchObject({
      seoTitle: 'Salud',
      seoDescription: 'Coberturas para clínicas',
      reviewed: false,
      body: [],
    })
  })
})

describe('isSectorDraft', () => {
  it('marca como borrador todo lo que no está aprobado', () => {
    expect(isSectorDraft(exampleSectors[0])).toBe(true)
    expect(isSectorDraft({ ...exampleSectors[0], reviewed: true })).toBe(false)
  })
})
