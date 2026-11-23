import type { Sector } from './sectors'

/**
 * Contenido de ejemplo del sector Inmobiliaria.
 *
 * Es un default del código, no contenido aprobado: nace con `reviewed: false`,
 * así que la página se muestra con el aviso de borrador y no se indexa. Sirve
 * para que el desplegable y la ruta funcionen antes de que el cliente cargue el
 * documento en el Studio; en cuanto exista el documento de Sanity, ese manda.
 *
 * Cuando el cliente entregue el copy definitivo de cada sector, el camino es
 * cargarlo en el Studio (o con `scripts/seed-sectors.ts`) y marcar `reviewed`.
 */

type Span = { _type: 'span'; _key: string; text: string; marks: string[] }

type Block = {
  _type: 'block'
  _key: string
  style: 'normal' | 'h2' | 'h3'
  markDefs: never[]
  children: Span[]
  listItem?: 'bullet' | 'number'
  level?: number
}

const text = (key: string, value: string): Block => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-span`, text: value, marks: [] }],
})

const heading = (key: string, value: string): Block => ({
  _type: 'block',
  _key: key,
  style: 'h2',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-span`, text: value, marks: [] }],
})

const bullet = (key: string, value: string): Block => ({
  ...text(key, value),
  listItem: 'bullet',
  level: 1,
})

export const exampleSectors: Sector[] = [
  {
    title: 'Inmobiliaria',
    slug: 'inmobiliaria',
    summary:
      'Coberturas para desarrollos, alquileres y administración de propiedades: protegé el inmueble, la renta y la responsabilidad frente a terceros.',
    reviewed: false,
    seoTitle: 'Seguros para el sector inmobiliario',
    seoDescription:
      'Coberturas de seguro para desarrolladoras, inmobiliarias y administradores de propiedades en Argentina.',
    body: [
      text(
        'sector-inmobiliaria-intro',
        'Una inmobiliaria administra a la vez el patrimonio propio, el de sus clientes y la responsabilidad por lo que ocurre en los inmuebles. Este texto es de ejemplo: el cliente todavía no entregó el copy definitivo.',
      ),
      heading('sector-inmobiliaria-h1', 'Qué cubre'),
      bullet('sector-inmobiliaria-b1', 'Incendio y daños materiales en propiedades en alquiler y en desarrollos en construcción.'),
      bullet('sector-inmobiliaria-b2', 'Responsabilidad civil por daños a terceros en áreas comunes y obras.'),
      bullet('sector-inmobiliaria-b3', 'Pérdida de alquileres y continuidad del negocio ante un siniestro.'),
      heading('sector-inmobiliaria-h2', 'Cómo trabajamos'),
      text(
        'sector-inmobiliaria-copy',
        'Relevamos la cartera, identificamos las exposiciones por tipo de propiedad y armamos una estructura de coberturas que no se superpone ni deja huecos. El texto de esta sección se reemplaza desde el Studio.',
      ),
    ],
  },
]

/** Slug del único sector con contenido de ejemplo, para el seed y los fallbacks. */
export const exampleSectorSlugs = exampleSectors.map((sector) => sector.slug)
