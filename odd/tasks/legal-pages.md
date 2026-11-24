# Páginas legales (Argentina) — GROU Asesores

Feature de `bisni`, rama `main`. Rutas `/legal/aviso-legal` y `/legal/privacidad`. La página de cookies se retiró (L8).
Estado: **implementado, verificado y commiteado** (arquitectura + borradores v1, commits `af85152`…`f83d40a`). Los datos reales del cliente (T1) y la revisión legal (T11) siguen pendientes.

## Specs

- **S1 — Jurisdicción Argentina.** “la jurisdicción es Argentina, la página está orientada solo a Argentina”. Las páginas legales siguen la ley argentina (Ley 25.326 y AAIP para datos; Ley 24.240 para consumidor), no GDPR/LSSI.
- **S2 — Aviso legal.** “razón social, CUIT, domicilio, email/teléfono, matrícula SSN, condición, logo SSN con link/alt, términos, defensa del consumidor, jurisdicción; links a Privacidad/Cookies”. “Una línea visible con la matrícula en el footer (y logo si las reglas lo permiten)”. Actualizado por L8: el aviso legal solo enlaza Privacidad.
- **S3 — Privacidad.** “responsable, datos (contacto: nombre/empresa/email/mensaje; newsletter: nombre/email), finalidades, consentimiento, proveedores (Sanity/Vercel/Zoho/SMTP), transferencias, conservación, seguridad, derechos/habeas data, AAIP, RNBD, menores, cambios; link desde contacto y newsletter”.
- **S4 — Cookies (actualizada por L8).** “elimina, la pagina de cookies, tanto del sitio como del studio si es que estaba. Al no usar cookies nuestro sitio, no es necesario”. No hay página `/legal/cookies` ni documento `legalPage` de cookies; `/legal/cookies` responde 404. Se conserva en la Política de privacidad la divulgación con efecto real: el sitio público no usa cookies propias, Vercel Analytics es cookieless y el iframe de Zoho puede usar cookies de terceros. Sin banner; si se agrega GA/Meta/Ads, CMP con bloqueo previo y actualización de Privacidad.
- **S5 — Schema.** “legalPage (título, slug, Portable Text, lastUpdated, SEO, showInFooter/orden; tabla de cookies estructurada si hace falta) + siteSettings (razón social, CUIT, domicilio, teléfono, email, matrícula, condición, ssnLogo, ssnUrl, jurisdicción); reemplazar los mockups en contacto/footer/legal.” Ruta `/legal/[slug]`, metadata, sitemap y footer Legal con 2 links (L8). `showInFooter`/`order` y la tabla de cookies no se implementaron: los links legales son estructurales y la página de cookies se retiró.
- **S6 — Datos reales.** “No inventar datos ni textos legales.” El cliente debe entregar razón social, CUIT, domicilio legal, teléfono, email, dominio real, matrícula SSN, condición, logo SSN y los textos aprobados.
- **S7 — Revisión legal.** “Los textos y el uso del logo SSN los valida el abogado/compliance del cliente.” Este plan es de contenido/arquitectura, no asesoramiento legal.
- **S8 — Mockups a reemplazar.** “Calle Serrano 55/28006 Madrid, +34 910 123 456, hola@bisni.es, bisni.es, locale es_ES” → datos argentinos y `es_AR`.
- **S9 — Links de privacidad.** “los links de privacidad en los formularios”: la leyenda del newsletter y la nota del formulario de contacto apuntan a `/legal/privacidad`. Actualizado por L9: sin checkbox, la leyenda informa que suscribirse implica aceptar la política.
- **S10 — Footer.** “el footer Legal de 3 links y 3 columnas” (actualizado por L8: **2 links**, Aviso legal y Privacidad), sin romper la grilla de 3 columnas (Explora ocupa 2).
- **S11 — Verificación y entrega.** “lint, typecheck, tests, build y navegador; no romper el diseño ni las 3 columnas del footer”. “No commit ni push hasta que yo lo pida.”

## Tasks

| ID | Spec | Ruta | Tarea | Estado | Commit |
| --- | --- | --- | --- | --- | --- |
| T1 | S6 | — | Relevar datos reales, matrícula, logo SSN y textos aprobados | **Bloqueada: los provee el cliente** | — |
| T2 | S5, S8 | inline | `siteSettings` (schema/query/resolver/defaults) y contacto derivado | Hecha | `af85152`, `3a149e0`, `4b646c5` |
| T3 | S5 | delegada | `legalPage` + `/legal/[slug]` + metadata/noindex + sitemap | Hecha | `af85152`, `741580f` |
| T4 | S2-S4 | inline | Borradores v1 con `[PENDIENTE: …]` en cada hueco | Hecha | `741580f` |
| T5 | S2 | inline | SSN en aviso legal y línea de matrícula en el footer | Hecha (logo sin verificar: falta el archivo) | `3a149e0`, `741580f` |
| T6 | S3, S4, S9 | inline | Links de privacidad en newsletter/contacto; cookies terceras dentro de Privacidad | Hecha | `741580f`, `4b646c5`, `31ee393` |
| T7 | S5, S10 | inline | Footer Legal estructural de 2 links + 3 columnas | Hecha y verificada en navegador | `3a149e0` |
| T8 | S8 | inline | Mockups restantes: `es_AR`, asunto/source del mail, descripciones del blog | Hecha | `4b646c5` |
| T9 | S5 | inline | `AGENTS.md` con `siteSettings`, `legalPage`, rutas y seed | Hecha | commit de docs |
| T10 | S11 | inline | lint, typecheck, tests, build y navegador | Hecha | en cada commit |
| T11 | S7 | — | Revisión legal del cliente (textos y uso del logo SSN) | **Bloqueada: abogado/compliance** | — |
| T12 | S4, L8 | inline | Eliminar la página de cookies del sitio y del Studio; mover la nota de Zoho a Privacidad | Hecha (falta borrar el documento si existía) | `af85152`, `741580f` |
| T13 | S3, S9, L9 | inline | Reemplazar el checkbox del newsletter por la leyenda sin checkbox | Hecha y verificada | `31ee393` |

Commits: el usuario autorizó commitear y pushear (L10). Los slices son `af85152` (modelo de contenido), `3a149e0` (datos del sitio y footer), `741580f` (páginas legales), `4b646c5` (home y rebrand), `31ee393` (newsletter), `f83d40a` (estilos), más el chore de `next-env.d.ts` y el commit de docs.

## Log

- **L1** (decisiones del usuario): “la jurisdicción es Argentina, la página está orientada solo a Argentina, esos datos son mockup que hay que cambiar”; “la sección de privacidad sí corresponde ya que el cliente proporciona su mail y su nombre”. Auditoría: sin cookies propias; no banner; privacidad obligatoria por los formularios.
- **L2**: “me gustaría que agregues debajo del formulario de newsletter un pequeño texto que diga leer y aceptar la política de privacidad”. Hecho como checkbox `privacy`; link pendiente hasta crear la política.
- **L3**: el cliente debe incluir la matrícula de asesor de seguros y el logo de la SSN; se propuso el Aviso legal + footer. El LinkedIn y WhatsApp reales ya están en el sitio.
- **L4** (pedido de esta sesión, verbatim): “Continuamos el proyecto GROU Asesores en C:\Users\Matias\desktop\proyectos\bisni (rama main, sincronizada con origin/main; últimos commits d4a9489, bb27454, 56b0aa4 y 898f319). La Fase 1 de la home editable ya está implementada, verificada y pusheada. Ahora toca la fase de páginas legales de Argentina. […] OBJETIVO: Implementar Aviso legal, Privacidad y Cookies en /legal/[slug], con el schema legalPage + siteSettings, el footer Legal de 3 links y 3 columnas, la matrícula/logo SSN y los links de privacidad en los formularios. DECISIONES YA TOMADAS (no reabrir): Argentina only; sin GDPR/LSSI. Los textos y el uso del logo SSN los valida el abogado/compliance del cliente. […] No inventar datos ni textos legales. […] VERIFICACIÓN: lint, typecheck, tests, build y navegador; no romper el diseño ni las 3 columnas del footer. No commit ni push hasta que yo lo pida.”
- **L5** (decisiones de implementación, tras elegir “Arrancá arquitectura + borradores v1”):
  - Los links del footer Legal son **estructurales** (`LEGAL_ROUTES`), no editables desde Sanity: un link legal no puede quedar apuntando a `/#contacto` ni desaparecer. Explora sigue editable.
  - Los datos de contacto de la home **se derivan de `siteSettings`**; se retira `homePage.contact.details` para que contacto, footer y páginas legales no puedan divergir.
  - `legalPage.reviewed` (boolean) + `siteSettings` completo controlan el banner de borrador y el `noindex`: un texto sin aprobar no se indexa. Mientras un `legalPage` use el fallback estático, se considera borrador.
  - Los mockups se eliminan sin reemplazarlos por datos inventados: los campos vacíos no se renderizan y el banner explica qué falta.
  - El seed no se ejecuta en esta sesión (requiere el token del cliente y escribe en el dataset de producción).
- **L6** (evidencia de verificación, 2026-11-12):
  - `npm test` → **132/132** en 12 archivos (113 previos + 19 de `lib/legal.test.ts`; `lib/site-settings.test.ts` suma 10 y `home-content.test.ts` pasa a 21).
  - `npm run typecheck` → 0; `npm run lint` → 0; `npx sanity schema validate` → 0 errores / 0 warnings; `npm run build` → exit 0 (2m9s, `/legal/[slug]` dinámica; el resto sigue igual).
  - Navegador (build de producción en `:3100`, viewport 1280 y 390): `/`, `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies` → 200; `/legal/otro` y `/no-existe` → 404; `noindex, follow` en las 3 legales; sin desborde horizontal (0 px); footer con **3 columnas** (67 px c/u en 1280, 104 px en 390) y Legal con Aviso legal/Privacidad/Cookies; newsletter y nota de contacto enlazan `/legal/privacidad` y el link del checkbox navega; sin `Madrid`, `Calle Serrano` ni `+34` en el HTML; `/sitemap.xml` **no** lista legales (siguen en borrador); jerarquía `h1` → 9 `h2` (sin salto) en el aviso legal.
  - Errores de consola en `:3100` solo ambientales: `_vercel/insights/script.js` (Analytics no desplegado) y CORS de Sanity Live por usar un origen no autorizado en el proyecto. En `:3000` (origen autorizado) no hubo errores de consola.
  - No verificable sin datos del cliente: logo SSN en el aviso legal (`ssnLogo`) y en el footer (`ssnShowInFooter`), y el estado publicado (banner fuera + indexable) que requiere `reviewed: true` y `siteSettings` completo. `mapSiteSettings`, `isLegalDraft` y `formatLegalDate` están cubiertos por tests.
  - El seed (`scripts/seed-legal.ts`) no se ejecutó: requiere el token del cliente y escribe en el dataset de producción. Es idempotente y no pisa contenido (`createIfNotExists`).
- **L8** (cambio de alcance, verbatim): “Bien, ahora elimina, la pagina de cookies, tanto edl sitio como del studio si es que estaba. Al no usar cookies nuestro sitio, no es necesario”.
  - `LEGAL_SLUGS` y el footer quedan en 2 links (Aviso legal, Privacidad); `legalPage` solo acepta esos dos slugs; `/legal/cookies` responde 404 aunque quedara un documento viejo (el sitemap y la ruta filtran por slug válido).
  - La divulgación del iframe de Zoho se movió a la Política de privacidad (sección “Cookies y tecnologías similares”), junto con Vercel Analytics cookieless y el Studio. No se perdió la única afirmación con efecto legal.
  - `scripts/remove-cookies-page.ts` elimina `legalPage-cookies` y su draft si existen (idempotente). No se ejecutó: requiere el token del cliente.
  - Verificación posterior: 132/132 tests, typecheck/lint 0, schema 0/0, build exit 0; navegador: footer con 2 links legales (3 columnas, 67 px c/u en 1280, 0 desborde en 1280/390), `/legal/cookies` 404 con el 404 propio, Privacidad con la sección “Cookies y tecnologías similares” y la mención de Zoho, aviso legal sin “Datos personales y cookies” ni links a cookies, sitemap sin rutas legales (siguen en borrador).
  - Consulta de solo lectura al dataset: `*[_type == "legalPage"]` devolvió `[]`. No hay documentos legales en Sanity todavía, así que no había página de cookies en el Studio; nada que borrar allí.
- **L9** (cambio de consentimiento, verbatim): “quites la casilla de «Leì y acept ola politica de privacidad», por una leyenda que diga, «Al suscribirte, aceptàs muestra polìtica de privacidad», sin checkbox”.
  - Copy final con ortografía corregida: «Al suscribirte, aceptás nuestra política de privacidad.» con link a `/legal/privacidad`.
  - Se quitó `privacy` de `validateNewsletterInput` (y de sus tests), del formulario y del CSS; el envío del formulario pasa a ser la manifestación de aceptación.
  - Privacidad actualizada: el consentimiento de la newsletter se presta “al completar el formulario de suscripción, que informa que la suscripción implica aceptar esta política”. El abogado debe validar que esa evidencia de consentimiento le alcanza.
  - Verificación: 131/131 tests (se eliminó el test del checkbox), typecheck/lint 0, build exit 0; navegador: sin `name="privacy"`, leyenda y link presentes, envío del formulario sin checkbox, 0 desborde en 1280/390.
- **L7** (fix de Studio, 2026-11-12): `contact.form.privacyLinkLabel` pasó a opcional con `initialValue` y fallback, porque un campo `required` nuevo invalida el documento existente y bloquea publicar (visto en el Studio con el error “Texto del enlace a la política de privacidad”). Se agregó `scripts/patch-home-legal.ts` para quitar `contact.details` (mockups, ahora “Unknown field found”) y completar el label solo si falta; no se ejecutó (requiere token del cliente).
- **L10** (autorización, verbatim): “si, haz los commits y el push”. Se commiteó el feature en slices revisables sobre `main` (modelo de contenido → datos del sitio y footer → páginas legales → home y rebrand → newsletter → estilos → chore de `next-env.d.ts`), cada uno pasó por el hook de GGA y este documento se actualiza con los hashes. Antes de commitear se corrigieron dos defectos del árbol: el bloque de CSS de las páginas legales estaba duplicado (se consolidó en uno con los valores efectivos) y `SITE_SETTINGS_QUERY` quedaba pegada al cierre del comentario en `sanity/lib/queries.ts`.
- **L11** (pedido verbatim): «la verdad preferiria que no esté esa opción, y que reviewed sea true directamente». Se retiró el freno de revisión de las páginas legales: se borró el campo `reviewed` de `legalPage`, la función `isLegalDraft` (y sus tests), el banner de borrador, el `noindex` y el filtro `reviewed == true` del sitemap. `scripts/patch-legal-review-flag.ts` limpió el campo de los dos documentos ya creados, para que el Studio no muestre «Unknown field found». Verificado en `:3000`: las dos páginas sin cartel, sin `noindex` y sin `[PENDIENTE]`, y el sitemap las lista. Antes, en L10, se crearon `legalPage-aviso-legal` y `legalPage-privacidad` con el seed y se resolvieron los pendientes de alta directa y de conservación (sin plazos inventados: hasta la baja o la supresión).
