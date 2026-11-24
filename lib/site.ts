// TODO(rebrand): GROU Asesores todavía no tiene dominio propio. Cuando lo tenga,
// cambiar el fallback de `siteUrl` y `NEXT_PUBLIC_SITE_URL` en el hosting.
/** URL canónica del sitio, sin barra final. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bisni.es').replace(/\/+$/, '')

/** Host canónico, sin protocolo ni path. Se usa en textos de origen de los mails. */
export const siteHost = siteUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')

/** Respaldo del enlace del logo de la SSN cuando `siteSettings.ssnUrl` está vacío. */
export const SSN_SITE_URL = 'https://www.ssn.gob.ar'

export const siteName = 'GROU Asesores'

export const siteDescription =
  'Consultoría B2B de gestión de riesgos corporativos, ciberseguridad y cumplimiento ISO 31000.'
