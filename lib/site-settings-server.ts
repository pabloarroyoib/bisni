import { cache } from 'react'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import {
  defaultSiteSettings,
  mapSiteSettings,
  type SanitySiteSettings,
  type SiteSettings,
} from './site-settings'

/**
 * Datos del responsable para el chrome compartido (footer) y las páginas
 * legales.
 *
 * `cache()` deduplica la consulta dentro de la misma petición: el footer, el
 * layout legal y la home la piden una sola vez. Si Sanity no responde, devuelve
 * los defaults para no romper la página: los campos legales quedan vacíos y el
 * footer simplemente no muestra la matrícula.
 *
 * Este módulo es solo de servidor: importa `sanityFetch` y no debe entrar al
 * bundle del navegador.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY })
    return mapSiteSettings(data as SanitySiteSettings | null)
  } catch (error) {
    console.error('[site-settings] No se pudieron cargar los datos del sitio:', error)
    return defaultSiteSettings
  }
})
