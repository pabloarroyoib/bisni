# Home editable desde Sanity (Fase 1)

Plan aprobado, **sin implementar**. Repo `bisni` (Next.js 16 App Router, React 19, Sanity 6, Tailwind v4 solo como base), rama `main`.
Alcance: que el cliente edite la home desde el Studio embebido en `/studio`. Fases 2 y 3 quedan fuera de este documento.

## Specs

- **S1 — Un solo documento de home.** Debe existir un documento singleton con `_id` fijo `homePage`, registrado en `sanity/structure.ts` para que no se puedan crear duplicados y aparezca como primera entrada del Studio.
- **S2 — Contenido por sección, con grupos de campos.** El documento debe cubrir exactamente estas secciones, cada una como `field group`:
  - Hero: kicker, título, párrafo, `cards[]` (título, texto).
  - Etapas: kicker, título, etiqueta, intro, `stages[]` (título, texto, ícono de lista cerrada). Hoy son tres.
  - Nosotros: kicker, título, etiqueta y texto de misión, CTA, `slides[]` (imagen, alt, título, subtítulo, `isLogo`).
  - Riesgos: título, intro, `sections[]` (párrafos, etiqueta, caja {título, texto}, `terms[]` {nombre, texto, nota}, `chips[]`, `subs[]` de un nivel).
  - Blog: kicker y título de sección.
  - Newsletter: kicker, título, intro, texto del puente a contacto.
  - Contacto: kicker, título, párrafo, `details[]` (ícono de lista cerrada, texto, href).
  - Footer: tagline, `linkGroups[]`, legal, redes.
  - Navegación: `items[]` (etiqueta, destino).
- **S3 — El sitio lee de Sanity.** `HOME_QUERY` en `sanity/lib/queries.ts`, `sanityFetch` en `app/page.tsx` (Server Component) y props a los componentes client. Con `defineLive` y `<SanityLive />` ya montados, publicar actualiza el sitio sin recompilar.
- **S4 — Fallback obligatorio.** `lib/content-defaults.ts` con los textos actuales. Si el documento no existe o un campo falta, la home usa el default: nunca una sección vacía.
- **S5 — El diseño no cambia.** Mismos textos, misma estructura, un solo `h1`, mismo ritmo vertical (`--section-y`) y misma navbar sticky. Cambia solo el origen de los datos.
- **S6 — Migración sin formulario vacío.** `scripts/seed-home.ts` con `createOrReplace` del singleton y el contenido actual, ejecutable con `sanity exec scripts/seed-home.ts --with-user-token`.
- **S7 — Verificación.** Lint, typecheck, suite (hoy 81/81) y build en 0; Studio operativo; publicar se refleja en el sitio; borrar el documento deja los defaults; carrusel, acordeón y etapas siguen funcionando; sin errores de hidratación en consola.

## Decisiones tomadas (no reabrir)

- Párrafos como `array of text`; Portable Text solo donde haga falta formato.
- Íconos y "es logo" como `select` cerrado; `max` y `required` para que el cliente no rompa el diseño.
- Objetos reutilizables en `sanity/schemaTypes/objects/`: `heroCard`, `stage`, `aboutSlide`, `riskSection`, `riskTerm`, `linkItem`.
- Imágenes de Nosotros como assets de Sanity (`cdn.sanity.io` ya está permitido en `next.config.mjs`), con `alt` obligatorio y hotspot, igual que el blog.
- **No** se hace editable la cantidad de etapas ni de slides: el carrusel está diseñado para tres marcos.

## Fuera de alcance

- **Fase 2**: imágenes de Nosotros en el Studio, navegación y footer, validaciones finas.
- **Fase 3**: edición visual (`presentationTool`, `@sanity/visual-editing`, draft mode). Requiere dependencias nuevas.

## Tasks

| ID | Spec | Tarea | Ruta | Commit |
| --- | --- | --- | --- | --- |
| T1 | S2 | Objetos reutilizables del contenido | `sanity/schemaTypes/objects/` | — |
| T2 | S1, S2 | Schema `homePage`, registro en `schemaTypes/index.ts` y singleton en `structure.ts` | `sanity/schemaTypes/homePageType.ts` | — |
| T3 | S3 | `HOME_QUERY` con todas las secciones | `sanity/lib/queries.ts` | — |
| T4 | S4 | Defaults con los textos actuales | `lib/content-defaults.ts` | — |
| T5 | S3, S5 | Fetch en la home y props a los componentes | `app/page.tsx`, `components/*` | — |
| T6 | S6 | Seed del singleton con el contenido actual | `scripts/seed-home.ts` | — |
| T7 | S7 | Verificación completa (checks, Studio, publicar, fallback) | — | — |

## Log

- **L1** (pedido original, verbatim): "Bien, ahora que estan todas las secciones definidas, podemos planear como seria la implementación en sanity para que el cliente pueda modificar la página desed ahí? Explciame, todavia no cambies codigo, ademas dime si seria conveniente hacer algo respecto al contexto porq ya esta al 74%"
- **L2**: "ok hazlo" — decisión de guardar este plan en el repo para que la sesión de implementación lo lea sin reexplorar.
- **L3** (estado al escribir): `main` en `cd40f9a` con Lenis, aparición al scroll, tres etapas, ritmo vertical, logo real y navbar con Inicio. Checks: lint 0, typecheck 0, 81/81 tests, build 0. El plan también está en Engram como `bisni/sanity-home-plan`.
