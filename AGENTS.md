<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Contexto del proyecto (memoria del agente)

_Actualizado: 2026-10-23_

## Resumen

**GROU Asesores** es el sitio corporativo B2B de una consultora de gestión de riesgos, ciberseguridad y cumplimiento ISO 31000, en español, con un blog y la home gestionados desde un Sanity Studio embebido (la home es el singleton `homePage`, con fallback a los textos por defecto). El proyecto fue scaffolded con v0.app (`generator: 'v0.app'` en los metadatos).

- Rama actual: `main`. Commits de la sesión (2026-11-11/12): `d4a9489` (Reveal sin JS), `bb27454` (modelo editable de Sanity), `56b0aa4` (home/UI/consentimiento) y el commit de documentación.
- Páginas legales pendientes (Argentina): plan en `odd/tasks/legal-pages.md`; faltan datos reales, matrícula/logo SSN, textos legales y el link del consentimiento.
- `AGENTS.md` lo reescribe parcialmente `next dev` (bloque superior); no eliminar ese bloque.

## Stack principal

- **Next.js 16.4.2** (App Router) + **React 19.3.1** + **TypeScript 5.7.3** (`strict` y el build valida tipos).
- **ESLint 9** (flat config) + **Vitest 3** (100 tests) + GitHub Actions (`.github/workflows/ci.yml`).
- **GGA 2.10** (Gentleman Guardian Angel) + **OpenCode CLI** (`opencode`): hook de `pre-commit` que revisa los TS/JS en staging contra `AGENTS.md` con el agente de solo lectura `gga-reviewer`.
- **Sanity 6.20.0** + **next-sanity 13.3.4**: CMS headless, Studio montado en `/studio`, plugin Vision y estructura de contenido personalizada.
- **Tailwind CSS v4** vía `@tailwindcss/postcss` (sin `tailwind.config`), con `tw-animate-css` y `shadcn/tailwind.css`.
- **shadcn** estilo `base-nova`, RSC, color base `neutral`, iconos **lucide-react**, primitivas **@base-ui/react**, `class-variance-authority`, `clsx`, `tailwind-merge`.
- **@vercel/analytics** (solo en producción).

### Gestor de paquetes y build en Windows

Se usa **npm** (`package-lock.json`); se eliminó `pnpm-workspace.yaml` y `styled-components`.

Los scripts `dev`/`build`/`start` pasan por `scripts/next.mjs`, que normaliza el *casing* real de la ruta con `fs.realpathSync.native` antes de arrancar Next. Si se ejecuta Next con un casing distinto al del disco (p. ej. `desktop\proyectos` vs `Desktop\Proyectos`), Next resuelve React dos veces y el build falla con `TypeError: Cannot read properties of null (reading 'useContext')` al prerenderizar `/_global-error`. **No usar `npx next build` directamente en Windows.** En Linux/macOS el wrapper es un no-op.

## Organización de carpetas

```text
app/
  layout.tsx                  Layout raíz: metadata/viewport, <SanityLive />, Analytics, globals.css
  page.tsx                    Home (Server Component): sanityFetch de posts + singleton homePage y props al cliente
  blog/page.tsx               Índice del blog: listado completo con buscador y filtros
  blog/[slug]/page.tsx        Detalle del artículo, generateMetadata y notFound()
  api/contact/route.ts        POST del formulario (validación + rate limit + webhook)
  studio/[[...tool]]/page.tsx Sanity Studio embebido (force-static)
  sitemap.ts / robots.ts      SEO
  not-found.tsx               404 propio
  global-error.tsx            500 propio
  globals.css                 Diseño casi completo (~20 KB, 38 líneas con reglas comprimidas)

components/
  home-page.tsx               Client Component con toda la landing (~13,5 KB)
  multiline-text.tsx          Respeta los saltos de línea de los títulos editables
  site-header.tsx             Cabecera compartida (Client: menú móvil con aria-expanded)
  site-footer.tsx             Pie compartido (Server Component)
  contour-field.tsx           Textura "Relieve" (Server Component, SVG determinista)
  contact-form.tsx            Formulario con estados de envío/error/éxito
  blog-card.tsx               Tarjeta de artículo, compartida por la home y /blog
  blog-list.tsx               Listado del blog con buscador y filtros (cliente)
  about-section.tsx           Sección "Nosotros": carrusel de cartas con fundido cruzado + panel de contenido
  post-body.tsx               PortableText (Server Component): imágenes, video (YouTube/Vimeo/Drive/directo), enlaces
  ui/button.tsx               Botón shadcn/base-ui con cva (sin usar)

lib/
  blog.ts                     Tipos SanityPost/BlogPost, mapPosts(), fecha es-ES, lectura, acentos
  home-content.ts             Tipos del contenido de la home, resolveHomeContent() y fallback campo por campo
  content-defaults.ts         Textos actuales de la home: defaults del sitio y del seed
  contact.ts                  Validación del formulario (pura, testeable)
  rate-limit.ts               Rate limit en memoria (5/min por IP)
  site.ts                     URL canónica y metadatos base
  utils.ts                    cn()
  *.test.ts                   Tests de blog, contacto y rate limit

sanity/
  env.ts                      apiVersion 2026-10-20 y validación de variables de entorno
  structure.ts                Orden del Studio: Home (singleton), Artículos, Categorías, Autores
  lib/client.ts               createClient (useCdn: true)
  lib/image.ts                urlFor()
  lib/live.ts                 defineLive -> sanityFetch + SanityLive
  lib/queries.ts              POSTS_QUERY, CATEGORIES_QUERY, POST_QUERY, SITEMAP_QUERY, HOME_QUERY (defineQuery/GROQ)
  schemaTypes/                post, author, category, blockContent, homePage, objects/, index

public/                       Iconos, apple-icon, placeholders
sanity.config.ts              Config del Studio (basePath /studio, schema, Vision)
sanity.cli.ts                 Config del CLI de Sanity
next.config.mjs               cabeceras de seguridad + cdn.sanity.io (sin ignoreBuildErrors)
tsconfig.json                 Alias @/* -> ./*, moduleResolution bundler
components.json               Config de shadcn
eslint.config.mjs             Flat config (core-web-vitals + typescript)
vitest.config.ts              Tests (alias @ + env de Sanity de prueba)
scripts/next.mjs              Wrapper de Next que normaliza el casing del cwd en Windows
scripts/seed-home.ts          Seed idempotente del singleton homePage (sube/reusa los assets de Nosotros)
.github/workflows/ci.yml      Lint + typecheck + tests + build
.env.example                  Variables de entorno documentadas
.env.local                    NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_READ_TOKEN (no versionado)
.gga                          Configuración de revisión de código con IA
opencode.jsonc                Agente `gga-reviewer` de solo lectura para el hook de GGA
```

## Flujo de datos

- Las páginas usan `sanityFetch` de `defineLive` (home, detalle y `generateMetadata`); el sitemap usa `client.fetch`.
- La home hace `sanityFetch` de `HOME_QUERY` (documento `_id: 'homePage'`) y pasa el resultado por `resolveHomeContent` (`lib/home-content.ts`): si el documento o un campo falta o queda vacío, usa `lib/content-defaults.ts`. `<SanityLive />` refresca la página al publicar, sin recompilar.
- `lib/blog.ts` normaliza la respuesta de Sanity (`SanityPost`) al modelo de UI (`BlogPost`): slug, fecha formateada, tiempo de lectura, color de acento por categoría y URLs de imagen.
- `useCdn: true` en el cliente de Sanity.
- `defineLive` solo recibe `serverToken` (`SANITY_API_READ_TOKEN`); no se expone ningún token al navegador.
- El blog no usa `generateStaticParams`; el detalle se renderiza dinámicamente.
- La home muestra solo los 4 últimos artículos; el listado completo con búsqueda y filtros vive en `/blog` (`components/blog-list.tsx`, compartido con `blog-card.tsx`).
- En `/blog` el artículo más reciente va como destacado (`components/blog-hero.tsx`) y el resto en una grilla de 3 columnas con una tarjeta ancha (`post-card-wide`) cada 5. El destacado se oculta mientras hay un filtro o búsqueda activos.
- Cada post expone dos URLs de imagen desde `mapPosts`: `imageUrl` (800×500, tarjetas) y `heroImageUrl` (1600×900, destacado). El recorte usa el hotspot del Studio, así que el mismo punto de interés vale para las dos proporciones.
- El formulario hace `POST /api/contact`. Entrega en cascada: **SMTP de Zoho Mail** (`SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`, `CONTACT_FROM`; el mail lo arma `lib/contact-email.ts`), después `CONTACT_WEBHOOK_URL`, y si no hay ninguno de los dos, en dev se registra en consola y en producción responde `503`.

## Modelo de contenido (Sanity)

- **homePage**: singleton (`_id: homePage`) registrado con `defineSingleton` en `sanity.config.ts` y `S.listItem().singleton('homePage')` como primera entrada del Studio. Grupos por sección: nav, hero, stages, about, risks, blog, newsletter, contact, footer. Las tarjetas del hero, las etapas y los slides son siempre 3 (validación `min/max`); los títulos multilínea son `text` y `components/multiline-text.tsx` respeta los saltos; los íconos son selects cerrados (`diagnostico|diseno|seguimiento`, `map|mail|globe|phone`); el teléfono usa `phone` y `globe` queda para una web. El copy del formulario de contacto vive en `contact.form` (etiquetas, textos de ejemplo, botón y nota de privacidad); los mensajes de validación y de estado siguen en código. El newsletter exige el checkbox `privacy` («Leí y acepto la política de privacidad.»); el link a la página legal queda pendiente hasta crearla. El Studio edita el draft y la página lee el publicado (con fallback a `lib/content-defaults.ts`); después de un cambio de schema hay que recargar `/studio` para que un documento abierto tome los campos nuevos. La perspectiva **Published** es de solo lectura: para editar hay que estar en **Drafts**, si no el Studio intenta parchear el documento publicado y falla con “Attempted to patch a read-only document”. Los ítems de navegación llevan `variant` (`link`/`button`); el CTA «Suscribirse» se renderiza como `.button.button-dark.button-navy` con el navy `#0d3858`, igual que el submit de la newsletter. Ese campo de `linkItem` solo se usa en `nav.items`. Las redes se editan en `nav.socials` (`socialItem`: red cerrada + URL) y se muestran en el navbar como siluetas monocromas y en el footer con el color claro del pie, junto al mail fijo; una lista vacía las oculta y el campo ausente cae a los 4 defaults. A ≤900px el menú colapsa y las redes quedan visibles en la barra. El footer tiene Explora con los 6 links del navbar en 2 columnas de 3 + Legal (3); un grupo con más de 3 links se abre en 2 columnas. La sección Empresa se eliminó; `footer.socials` se retiró (las redes salen de `nav.socials`) y el footer bottom no usa Reveal para no quedar oculto al final del scroll. Los objetos reutilizables viven en `sanity/schemaTypes/objects/` (`heroCard`, `stage`, `aboutSlide`, `riskTerm`, `riskSection`/`riskGroup`, `linkItem`, `socialItem`).
- **post**: `title`, `slug`, `excerpt` (máx. 280), `author` (referencia), `mainImage` (con `alt`), `categories[]` (referencias), `publishedAt`, `body`.
- **author**: `name`, `slug`, `image`, `bio` (Portable Text).
- **category**: `title`, `slug`, `description`.
- **blockContent**: rich text con h1–h4, cita, listas, negrita/cursiva, enlaces; imágenes con `alt` (con warning); objeto `video` con URL de YouTube (incluye Shorts y `youtu.be`), Vimeo (canales y enlaces no listados con hash), Google Drive o URL directa de archivo (MP4/WebM…).
- **Render de video** (`components/post-body.tsx`): resuelve la URL con `URL` (no regex sueltas), restringe `video.url` a `http(s)` en el esquema y solo cae a `<video>` si la URL termina en extensión de video; el resto se ignora. Los encabezados se mapean h1→`h2` … h4→`h5` (h4/h5 estilizados en `globals.css`).
- **Excepción `next/image`**: las imágenes dentro de Portable Text usan `<img>` con `eslint-disable` (no exponen dimensiones conocidas); es una desviación aceptada y documentada aquí.

## Diseño

- **Tokens**: definidos en el bloque `@theme` de `app/globals.css` (Tailwind v4, CSS-first): `--color-ink`, `--color-signal`, `--color-signal-text`, `--color-paper`, `--color-line`, `--color-muted`, `--color-surface-dark/deep`, `--color-signal-light`, `--color-on-dark*`. Las variables históricas (`--teal`, `--ink`, `--navy`…) apuntan a esos tokens, así que cambiar un token repinta todo el sitio. **Los textos de acento y los CTA de newsletter/nav usan `--color-signal-text` (#0d3858); `--color-signal` (#0e7b88) queda para fondos, bordes, la textura y el ícono de las etapas.** No cambiar `--color-signal` para recolorear textos: arrastra botones, bordes y contornos.
- **Carrusel de "Nosotros"** (`components/about-section.tsx`): tres marcos fijos —el frontal nítido y dos detrás, con `blur`— y dentro de cada marco las tres imágenes siempre montadas como capas. El cambio es solo de clases (`is-on` / `is-prev` / resto), así el paso 1 → 2 → 3 → 1 es un fundido cruzado en el mismo lugar, sin desmontar nada y sin que se vea el fondo vacío. Rota cada 4 s y se pausa con el mouse o el foco. Los logos van con `object-fit: contain` y su capa lleva fondo opaco, porque con `contain` la capa no cubre el marco y asomaría la imagen anterior. La regla global de `prefers-reduced-motion` congela toda transición con `!important`: el bloque del carrusel repone el fundido de opacidad y deja afuera solo el zoom y el desplazamiento del subtítulo.
- **Tipografía**: una sola familia, **Archivo**, vía `next/font/google` (`--font-archivo` en `app/layout.tsx`). Títulos en peso 600 y tracking `-.02em`.
- **"Relieve"**: la textura de fondo. Curvas de nivel que evocan un mapa de relieve del riesgo. `components/contour-field.tsx` (Server Component, generación determinista para no romper la hidratación) + `.contour-field-page` / `.contour-field-panel` en `globals.css`.
  - `page`: una sola capa detrás de **toda** la página. Exige un `viewBox` alto (`1200×3200`); con uno apaisado, `preserveAspectRatio="slice"` lo escala ~8× en una página de ~4850px y las curvas quedan gigantes.
  - `panel`: se usa dentro de una sección concreta (contacto, fondo oscuro).
  - La deriva va en **unidades del `viewBox`** (`translate3d(-62px,28px,0)`), nunca en `%`: el porcentaje resuelve contra el bbox de cada grupo y la velocidad se vuelve impredecible. Duraciones 32s/48s ≈ 6 px/s renderizados.
  - El SVG lleva `inset:-10%` de sobremedida para que la deriva no descubra los bordes.
  - **Piso de perceptibilidad**: `#0e7f8c` al 7,5% sobre blanco da ~1,06:1 de contraste — invisible. Necesita ~0,5 de opacidad para llegar a ~2:1.
  - Las secciones claras (`hero`, `services`, `blog`) no llevan fondo propio para que la textura las atraviese; `tools-section` conserva su ritmo con `rgba(243,246,246,.72)`.
- **Columna de lectura** (`.article-header`, `.article-hero-image`, `.article-content`, `.article-footer`): `width: min(800px, 100% - 12vw)`. No volver a `max-width: 800px` + `padding: 0 9vw`: el padding se resta del ancho máximo y el texto queda en ~541px, desalineado con la imagen.
- **Texto largo sin espacios**: `.article-body` y `.article-header` usan `overflow-wrap: anywhere` para que URLs o hashes no desborden la columna.
- **Navbar sticky**: requiere que `.site-shell` use `overflow: clip` (no `hidden`), porque un ancestro con `overflow: hidden` crea un contenedor de scroll y rompe el `sticky`.
- **Scroll suave**: Lenis se monta en `components/smooth-scroll.tsx` para todo el sitio, pero **no** en `/studio`: el Studio scrollea en paneles internos y Lenis intercepta la rueda a nivel de ventana, así que los deja clavados. Tampoco se monta con `prefers-reduced-motion: reduce`.
- **Accesibilidad**: foco visible global, variante de foco claro sobre superficies oscuras, skip link a `#contenido`, `scroll-margin-top: 96px` (navbar sticky), y `prefers-reduced-motion` que congela animaciones y transiciones.

## Observaciones y deuda técnica

- **`package-lock.json` con npm 10**: este equipo tiene npm 11, que poda del lock las variantes por plataforma de `@typescript/typescript-*`. El CI usa Node 22 (npm 10) y `npm ci` falla con `Missing: @typescript/typescript-<plataforma> from lock file`. Al agregar dependencias, regenerar con `npx npm@10 install --package-lock-only --include=optional` antes de commitear el lock.

- El diseño vive casi todo en `app/globals.css` con clases globales y reglas en una sola línea; Tailwind está configurado pero se usa poco.
- Contenido comercial (servicios, dirección, email, teléfono, footer) está hardcodeado en `home-page.tsx`.
- La cantidad de etapas y slides está fijada en 3 por validación: el carrusel de Nosotros está diseñado para tres marcos.
- La home lee nav y footer del singleton; las páginas de blog y el 404 siguen usando los defaults. Fase 2 pendiente: compartir ese chrome y validaciones finas. Fase 3: `presentationTool`/`@sanity/visual-editing`.
- El rate limit del formulario es en memoria: no sirve con varias instancias (mover a Redis/KV si escala).
- `components/ui/button.tsx` es código muerto de shadcn (no se importa en ningún sitio).
- `@sanity/icons` v5: importar iconos desde subpaths (`@sanity/icons/Video`), no desde la raíz; los exports raíz son stubs `never` y rompen dev/build.
- Build en Windows: usar `npm run build` (pasa por `scripts/next.mjs`); no ejecutar `npx next build` con un casing de ruta distinto al del disco.
- El blog no usa `generateStaticParams`; si se quiere ISR/estático, añadirlo.
- GGA revisa los archivos TS/JS en staging contra `AGENTS.md` en cada commit (`.gga` + `.git/hooks/pre-commit`). Usa el agente de solo lectura `gga-reviewer` (`opencode.jsonc`, sin edición/shell/red). Proveedor por defecto: `opencode:openrouter/deepseek/deepseek-v4.1-flash-1017` (OpenRouter, verificado). Cualquier modelo de Anthropic, OpenAI o DeepSeek de OpenRouter se usa tal cual anteponiendo `opencode:openrouter/...` (lista completa comentada en `.gga`); también hay gratuitos de OpenRouter (`recursive/flint-v1.0:free`, `xingchen-agi/xing4.0-29b-a4b:free`). Los `opencode/*-free` agotaron su límite ("Free usage limit reached") y `deepseek/*` directo sigue bloqueado por falta de saldo. El agente `gga-reviewer` usa un `system` que obliga a empezar por `STATUS: PASSED|FAILED`, porque GGA solo lee esa marca en las primeras 30 líneas. No añadir `steps: 1` al agente: rompe los modelos de Anthropic vía OpenRouter ("Provider returned error"). Anthropic, OpenAI y DeepSeek de OpenRouter están verificados con este agente. `git commit --no-verify` lo omite. En Windows requiere `gga` en el `PATH` (`%USERPROFILE%\bin`) y `opencode` disponible en Git Bash. No corre en CI (no hay credenciales del proveedor en Actions).

## Comandos

```bash
npm run dev       # next dev vía scripts/next.mjs
npm run build     # next build vía scripts/next.mjs
npm run start     # next start vía scripts/next.mjs
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
npm test          # Vitest
gga run           # revisión de IA de los archivos en staging (hook de pre-commit)
npx sanity exec scripts/seed-home.ts --with-user-token  # siembra el singleton homePage (idempotente)
gga config        # configuración efectiva de GGA
gga cache status  # estado de la caché (LOCALAPPDATA\gga\cache en Windows)
npx sanity ...    # CLI usando sanity.cli.ts
```
