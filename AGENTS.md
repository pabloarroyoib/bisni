<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Contexto del proyecto (memoria del agente)

_Actualizado: 2026-10-23_

## Resumen

**bisni** es el sitio corporativo B2B de una consultora de gestión de riesgos, ciberseguridad y cumplimiento ISO 31000, en español, con un blog gestionado desde un Sanity Studio embebido. El proyecto fue scaffolded con v0.app (`generator: 'v0.app'` en los metadatos).

- Rama actual: `main`. Últimos commits: integración completa de Sanity para el blog y corrección de categorías/token de lectura.
- Cambios sin commitear (sesión 2026-10-23): tooling (ESLint/Vitest/CI), API de contacto, SEO, `sanityFetch`, `next/image` y el fix del build en Windows.
- `AGENTS.md` lo reescribe parcialmente `next dev` (bloque superior); no eliminar ese bloque.

## Stack principal

- **Next.js 16.4.2** (App Router) + **React 19.3.1** + **TypeScript 5.7.3** (`strict` y el build valida tipos).
- **ESLint 9** (flat config) + **Vitest 3** (22 tests) + GitHub Actions (`.github/workflows/ci.yml`).
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
  page.tsx                    Home (Server Component): sanityFetch de posts + categorías
  blog/[slug]/page.tsx        Detalle del artículo, generateMetadata y notFound()
  api/contact/route.ts        POST del formulario (validación + rate limit + webhook)
  studio/[[...tool]]/page.tsx Sanity Studio embebido (force-static)
  sitemap.ts / robots.ts      SEO
  not-found.tsx               404 propio
  global-error.tsx            500 propio
  globals.css                 Diseño casi completo (~20 KB, 38 líneas con reglas comprimidas)

components/
  home-page.tsx               Client Component con toda la landing (~13,5 KB)
  contact-form.tsx            Formulario con estados de envío/error/éxito
  post-body.tsx               PortableText: imágenes, video YouTube/Vimeo/MP4, enlaces
  ui/button.tsx               Botón shadcn/base-ui con cva (sin usar)

lib/
  blog.ts                     Tipos SanityPost/BlogPost, mapPosts(), fecha es-ES, lectura, acentos
  contact.ts                  Validación del formulario (pura, testeable)
  rate-limit.ts               Rate limit en memoria (5/min por IP)
  site.ts                     URL canónica y metadatos base
  utils.ts                    cn()
  *.test.ts                   Tests de blog, contacto y rate limit

sanity/
  env.ts                      apiVersion 2026-10-20 y validación de variables de entorno
  structure.ts                Orden del Studio: Artículos, Categorías, Autores
  lib/client.ts               createClient (useCdn: true)
  lib/image.ts                urlFor()
  lib/live.ts                 defineLive -> sanityFetch + SanityLive
  lib/queries.ts              POSTS_QUERY, CATEGORIES_QUERY, POST_QUERY, SITEMAP_QUERY (defineQuery/GROQ)
  schemaTypes/                post, author, category, blockContent, index

public/                       Iconos, apple-icon, placeholders
sanity.config.ts              Config del Studio (basePath /studio, schema, Vision)
sanity.cli.ts                 Config del CLI de Sanity
next.config.mjs               cabeceras de seguridad + cdn.sanity.io (sin ignoreBuildErrors)
tsconfig.json                 Alias @/* -> ./*, moduleResolution bundler
components.json               Config de shadcn
eslint.config.mjs             Flat config (core-web-vitals + typescript)
vitest.config.ts              Tests (alias @ + env de Sanity de prueba)
scripts/next.mjs              Wrapper de Next que normaliza el casing del cwd en Windows
.github/workflows/ci.yml      Lint + typecheck + tests + build
.env.example                  Variables de entorno documentadas
.env.local                    NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_READ_TOKEN (no versionado)
.gga                          Configuración de revisión de código con IA
opencode.jsonc                Agente `gga-reviewer` de solo lectura para el hook de GGA
```

## Flujo de datos

- Las páginas usan `sanityFetch` de `defineLive` (home, detalle y `generateMetadata`); el sitemap usa `client.fetch`.
- `lib/blog.ts` normaliza la respuesta de Sanity (`SanityPost`) al modelo de UI (`BlogPost`): slug, fecha formateada, tiempo de lectura, color de acento por categoría y URLs de imagen.
- `useCdn: true` en el cliente de Sanity.
- `defineLive` solo recibe `serverToken` (`SANITY_API_READ_TOKEN`); no se expone ningún token al navegador.
- El blog no usa `generateStaticParams`; el detalle se renderiza dinámicamente.
- La home filtra búsqueda y categorías en el cliente (`home-page.tsx`).
- El formulario hace `POST /api/contact`; sin `CONTACT_WEBHOOK_URL`, en dev se registra en consola y en producción responde `503`.

## Modelo de contenido (Sanity)

- **post**: `title`, `slug`, `excerpt` (máx. 280), `author` (referencia), `mainImage` (con `alt`), `categories[]` (referencias), `publishedAt`, `body`.
- **author**: `name`, `slug`, `image`, `bio` (Portable Text).
- **category**: `title`, `slug`, `description`.
- **blockContent**: rich text con h1–h4, cita, listas, negrita/cursiva, enlaces; imágenes con `alt`; objeto `video` con URL de YouTube, Vimeo o video directo (cambio reciente sin commitear).

## Observaciones y deuda técnica

- El diseño vive casi todo en `app/globals.css` con clases globales y reglas en una sola línea; Tailwind está configurado pero se usa poco.
- Contenido comercial (servicios, dirección, email, teléfono, footer) está hardcodeado en `home-page.tsx`.
- El rate limit del formulario es en memoria: no sirve con varias instancias (mover a Redis/KV si escala).
- `components/ui/button.tsx` es código muerto de shadcn (no se importa en ningún sitio).
- `@sanity/icons` v5: importar iconos desde subpaths (`@sanity/icons/Video`), no desde la raíz; los exports raíz son stubs `never` y rompen dev/build.
- Build en Windows: usar `npm run build` (pasa por `scripts/next.mjs`); no ejecutar `npx next build` con un casing de ruta distinto al del disco.
- El blog no usa `generateStaticParams`; si se quiere ISR/estático, añadirlo.
- GGA revisa los archivos TS/JS en staging contra `AGENTS.md` en cada commit (`.gga` + `.git/hooks/pre-commit`). Usa el agente de solo lectura `gga-reviewer` (`opencode.jsonc`, sin edición/shell/red) y el modelo `opencode/deepseek-v4.1-flash-free` (gratis); alternativas ya conectadas: `deepseek/deepseek-flash` y `deepseek/deepseek-v4-pro` (requieren saldo en DeepSeek) y `google/gemini-3.5-flash` (verificado). `git commit --no-verify` lo omite. En Windows requiere `gga` en el `PATH` (`%USERPROFILE%\bin`) y `opencode` disponible en Git Bash. No corre en CI (no hay credenciales del proveedor en Actions).

## Comandos

```bash
npm run dev       # next dev vía scripts/next.mjs
npm run build     # next build vía scripts/next.mjs
npm run start     # next start vía scripts/next.mjs
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
npm test          # Vitest
gga run           # revisión de IA de los archivos en staging (hook de pre-commit)
gga config        # configuración efectiva de GGA
gga cache status  # estado de la caché (LOCALAPPDATA\gga\cache en Windows)
npx sanity ...    # CLI usando sanity.cli.ts
```
