// TODO(rebrand): GROU Asesores todavía no tiene dominio propio. Cuando lo tenga,
// cambiar el fallback de `siteUrl` y `NEXT_PUBLIC_SITE_URL` en el hosting.
/** URL canónica del sitio, sin barra final. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bisni.es').replace(/\/+$/, '')

export const siteName = 'GROU Asesores'

export const siteDescription =
  'Consultoría B2B de gestión de riesgos corporativos, ciberseguridad y cumplimiento ISO 31000.'
