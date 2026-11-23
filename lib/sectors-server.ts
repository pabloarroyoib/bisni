import { cache } from 'react'
import { SECTORS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import { exampleSectors } from './sector-defaults'
import { mapSectors, type SanitySector, type SectorLink } from './sectors'

/**
 * Sectores publicados para el desplegable del navbar.
 *
 * `cache()` deduplica la consulta dentro de la misma petición: la página y el
 * header la piden una sola vez. Si Sanity no responde, o todavía no hay ningún
 * documento, devuelve el contenido de ejemplo para que el desplegable y
 * `/sectores/inmobiliaria` funcionen igual (marcados como borrador en la página).
 *
 * Este módulo es solo de servidor: importa `sanityFetch` y no debe entrar al
 * bundle del navegador.
 */
export const getSectors = cache(async (): Promise<SectorLink[]> => {
  const fallback = exampleSectors.map(({ title, slug }) => ({ title, slug }))

  try {
    const { data } = await sanityFetch({ query: SECTORS_QUERY })
    const sectors = mapSectors(data as SanitySector[] | null)

    return sectors.length > 0 ? sectors : fallback
  } catch (error) {
    console.error('[sectores] No se pudieron cargar los sectores:', error)
    return fallback
  }
})
