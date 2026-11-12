# Páginas legales (Argentina) — plan

Plan pendiente de implementación. Repo `bisni`, rama `main`. Rutas objetivo: `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies`.

## Estado al escribir

- La home editable, navbar, footer y consentimiento del newsletter ya están commiteados (`d4a9489`, `bb27454`, `56b0aa4`).
- El newsletter tiene el checkbox obligatorio `privacy` («Leí y acepto la política de privacidad.») y la validación; **el link a la política queda pendiente** porque la página no existe.
- El footer Legal aún apunta a `/#contacto`; hay que cambiarlo a las rutas reales.
- El sitio público **no tiene cookies propias ni storage** (auditoría de `app/`, `components/`, `lib/`, `next-sanity` y `@vercel/analytics`):
  - `@vercel/analytics` es cookieless.
  - `SanityLive` no guarda nada.
  - El Studio de Sanity en `/studio` usa cookies de sesión solo para editores.
  - El newsletter envía a Zoho dentro de un iframe; Zoho puede usar cookies de terceros en su dominio.
  - No hace falta banner de cookies; sí política de privacidad por los formularios.

## Datos mockup a reemplazar

- `Calle Serrano 55, 28006 Madrid`, `+34 910 123 456`, `hola@bisni.es`.
- Dominio `bisni.es`, asunto `Consulta desde bisni.es` y `locale: 'es_ES'` (Argentina → `es_AR`).
- Están en `lib/content-defaults.ts`, en el documento `homePage.contact.details` de Sanity, en `lib/email.ts`, `lib/site.ts`, `app/layout.tsx`, el mensaje 503 de contacto y el footer.
- La matrícula SSN y el logo de la Superintendencia de Seguros de la Nación todavía no están en el sitio.

## Specs

- **S1 — Jurisdicción Argentina.** La página está orientada solo a Argentina; las páginas legales siguen la ley argentina (Ley 25.326 y AAIP para datos; Ley 24.240 para consumidor), no GDPR/LSSI. Los textos finales los valida el abogado/compliance del cliente.
- **S2 — Aviso legal.** Razón social, CUIT, domicilio, email/teléfono; matrícula SSN, condición (`Productor Asesor de Seguros`, `Agente Institorio`, etc.); logo oficial de la SSN con link y alt; términos de uso, propiedad intelectual, responsabilidad, defensa del consumidor, jurisdicción; links a Privacidad/Cookies; fecha de actualización. Agregar una línea visible con la matrícula en el footer (y el logo si las reglas de uso lo permiten).
- **S3 — Privacidad.** Responsable/base de datos, datos de contacto y newsletter, finalidades, consentimiento, proveedores (Sanity, Vercel, Zoho/SMTP), transferencias, conservación, seguridad, derechos (acceso, rectificación, supresión, oposición; `habeas data`), AAIP, registro de la base si corresponde, menores, cambios y fecha. Link desde el formulario de contacto y desde el checkbox del newsletter.
- **S4 — Cookies.** Página corta o sección: no hay cookies propias de analítica/marketing; Vercel Analytics cookieless; cookies de sesión del Studio solo para editores; Zoho puede usar cookies de terceros en el newsletter; cómo gestionarlas en el navegador; fecha. No agregar banner mientras no haya cookies no esenciales; si se agrega GA/Meta, sí CMP y bloqueo previo.
- **S5 — Schema.** Colección `legalPage` (título, slug, `body` Portable Text, `lastUpdated`, SEO, `showInFooter`, orden; tabla de cookies estructurada si hace falta) + singleton `siteSettings` para datos de empresa/contacto/regulatorios (razón social, CUIT, domicilio, teléfono, email, matrícula, condición, `ssnLogo`, `ssnUrl`, jurisdicción). El footer y las páginas legales leen `siteSettings`; el contacto también debería. Ruta `/legal/[slug]`, metadata, sitemap y footer Legal con 3 links; mantener las 3 columnas.
- **S6 — Datos reales.** El cliente debe entregar razón social, CUIT, domicilio legal, teléfono, email, dominio real, matrícula SSN, condición, logo SSN y textos legales. No inventar ninguno.
- **S7 — Revisión legal.** El Aviso legal, Privacidad y Cookies los redacta/revisa el abogado del cliente; las reglas de uso del logo SSN también. Este plan es de contenido/arquitectura, no asesoramiento legal.

## Tareas

| ID | Spec | Tarea |
| --- | --- | --- |
| T1 | S6 | Relevar datos reales, matrícula, logo SSN y textos legales |
| T2 | S5 | Crear `siteSettings` y reemplazar los mockups en contacto/footer/legal |
| T3 | S5 | Crear `legalPage` y la ruta `/legal/[slug]` con SEO/sitemap |
| T4 | S2-S4 | Cargar Aviso legal, Privacidad y Cookies (textos aprobados) |
| T5 | S2 | Agregar matrícula/logo al Aviso legal y la línea del footer |
| T6 | S3, S4 | Linkear la privacidad en el newsletter/contacto; página de cookies corta |
| T7 | S5 | Cambiar los 3 links del footer Legal y verificar las 3 columnas |
| T8 | S7 | Revisión legal, build y verificación |

## Log

- **L1** (decisiones del usuario): “la jurisdicción es Argentina, la página está orientada solo a Argentina, esos datos son mockup que hay que cambiar”; “la sección de privacidad sí corresponde ya que el cliente proporciona su mail y su nombre”. Auditoría: sin cookies propias; no banner; privacidad obligatoria por los formularios.
- **L2**: “me gustaría que agregues debajo del formulario de newsletter un pequeño texto que diga leer y aceptar la política de privacidad”. Hecho como checkbox `privacy`; link pendiente hasta crear la política.
- **L3**: el cliente debe incluir la matrícula de asesor de seguros y el logo de la SSN; se propuso el Aviso legal + footer. El LinkedIn y WhatsApp reales ya están en el sitio.
