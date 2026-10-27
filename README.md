# bisni

Sitio corporativo B2B de **bisni**: consultoría de gestión de riesgos, ciberseguridad y cumplimiento ISO 31000. Incluye landing con herramientas interactivas (calculadora de riesgo y matriz) y un blog gestionado desde un Sanity Studio embebido.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Sanity](https://www.sanity.io) + [next-sanity](https://github.com/sanity-io/next-sanity) (Studio en `/studio`, Live Content API)
- Tailwind CSS v4 (la mayor parte del diseño vive en `app/globals.css`)
- ESLint + Vitest + GitHub Actions

## Requisitos

- Node.js >= 20.9
- npm (el proyecto usa `package-lock.json`)

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

Abre <http://localhost:3000>. El Studio está en <http://localhost:3000/studio>.

### Variables de entorno

Todas están documentadas en `.env.example`.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sí | ID del proyecto de Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Sí | Dataset (`production` por defecto) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | Versión de API (por defecto la de `sanity/env.ts`) |
| `SANITY_API_READ_TOKEN` | Recomendada | Token de lectura solo de servidor. Necesario para borradores y Live |
| `NEXT_PUBLIC_SITE_URL` | No | URL canónica (`https://bisni.es` por defecto) |
| `CONTACT_WEBHOOK_URL` | No | Endpoint que recibe los envíos del formulario |
| `CONTACT_WEBHOOK_SECRET` | No | Se envía como `Authorization: Bearer` al webhook |

> El token de lectura **no** debe llevar prefijo `NEXT_PUBLIC_`: se usa únicamente en el servidor.

## Scripts

```bash
npm run dev         # servidor de desarrollo
npm run build       # build de producción
npm run start       # sirve el build
npm run lint        # ESLint (flat config)
npm run typecheck   # tsc --noEmit
npm test            # Vitest (una pasada)
npm run test:watch  # Vitest en modo watch
```

> **Windows — importante:** los scripts de Next pasan por `scripts/next.mjs`, que normaliza el
> *casing* real de la ruta antes de arrancar Next. Si abres el proyecto como
> `C:\...\desktop\proyectos\bisni` pero en disco es `C:\...\Desktop\Proyectos\bisni`, Next
> resuelve React dos veces y el build falla con
> `TypeError: Cannot read properties of null (reading 'useContext')` al prerenderizar
> `/_global-error`. No ejecutes `npx next build` directamente en Windows: usa `npm run build`.
> En Linux/macOS el wrapper no hace nada.

Afinado recomendado en Windows (rendimiento y estabilidad):

- **Excluir del antivirus** el proyecto (o al menos `node_modules` y `.next`) para que Defender no escanee miles de archivos en cada `npm run dev`/`build`. Requiere administrador:

  ```powershell
  Add-MpPreference -ExclusionPath "C:\Users\Matias\desktop\proyectos\bisni"
  ```

  También desde **Seguridad de Windows → Protección antivirus y contra amenazas → Configuración de protección → Exclusiones**.
- **Rutas largas**: `LongPathsEnabled=1` a nivel de sistema y `core.longpaths=true` en este repo (`git config --local core.longpaths true`).
- **Git sin sorpresas**: `core.autocrlf=true` (normaliza a LF en el repo, CRLF en disco) y `core.ignorecase=true`.
- **PATH**: `%USERPROFILE%\bin` (para `gga`) y `%APPDATA%\npm` (para `opencode`) en el PATH de usuario.
- Si usas WSL, no lances el `opencode` de Windows desde WSL ni trabajes sobre `/mnt/c`; o todo Windows o todo WSL con el repo en ext4.

## Formulario de contacto

`POST /api/contact` valida el cuerpo (`lib/contact.ts`), aplica un rate limit en memoria (5 envíos/minuto por IP) y reenvía el mensaje a `CONTACT_WEBHOOK_URL`.

- Sin webhook en desarrollo: el envío se registra en la consola del servidor.
- Sin webhook en producción: la API responde `503` y la UI muestra un fallback a `hola@bisni.es`.

El rate limit en memoria es válido para una sola instancia. Si despliegas en varias, cámbialo por Upstash Redis, Vercel KV o similar (`lib/rate-limit.ts`).

## Estructura

```text
app/
  layout.tsx               Metadatos, SanityLive y Analytics
  page.tsx                 Home (sanityFetch + mapeo de posts)
  blog/[slug]/page.tsx     Detalle del artículo
  studio/[[...tool]]/      Sanity Studio embebido
  api/contact/route.ts     Endpoint del formulario
  sitemap.ts / robots.ts   SEO
  not-found.tsx            404
components/
  home-page.tsx            Landing interactiva (client)
  contact-form.tsx         Formulario con estados de envío
  post-body.tsx            Portable Text (texto, imágenes, vídeo)
lib/
  blog.ts                  Mapeo Sanity -> modelo de UI
  contact.ts               Validación del formulario
  rate-limit.ts            Rate limit en memoria
  site.ts                  URL y metadatos base
sanity/                    Esquemas, queries, cliente y Live
```

## Contenido (Sanity)

- **post**: título, slug, extracto, autor, imagen principal, categorías, fecha y cuerpo (Portable Text con imágenes y vídeo de YouTube/Vimeo/MP4).
- **author**: nombre, slug, imagen y biografía.
- **category**: título, slug y descripción.

Las páginas usan `sanityFetch` de `defineLive`, así que los cambios publicados se reflejan en vivo gracias a `<SanityLive />` en el layout.

## Revisión de código con IA (GGA)

El repo usa [Gentleman Guardian Angel](https://github.com/Gentleman-Programming/gentleman-guardian-angel) (GGA): un hook de `pre-commit` que revisa los archivos TS/JS en *staging* contra las reglas de `AGENTS.md` usando un LLM. Si la revisión falla, el commit se aborta.

- Configuración versionada: `.gga` (proveedor, patrones y reglas).
- Proveedor: **OpenCode CLI**. Modelos conectados y verificados (`opencode models`):

  | Modelo en `.gga` | Coste | Estado |
  | --- | --- | --- |
  | `opencode:opencode/deepseek-v4.1-flash-free` | gratis | **en uso por defecto** |
  | `opencode:deepseek/deepseek-flash` | API de pago | requiere saldo en DeepSeek |
  | `opencode:deepseek/deepseek-v4-pro` | API de pago | requiere saldo, mejor criterio |
  | `opencode:google/gemini-3.5-flash` | API de pago | verificado |

  Para cambiar de modelo basta editar `PROVIDER` en `.gga`; el agente de revisión se mantiene.
- Agente de revisión: `gga-reviewer`, definido en `opencode.jsonc`. Es de **solo lectura** (sin edición, shell, red ni subagentes), para que la revisión no pueda tocar el repo.

### Instalación (una vez por máquina)

```bash
# macOS / Linux
brew install gentleman-programming/tap/gga

# Windows (Git Bash)
git clone https://github.com/Gentleman-Programming/gentleman-guardian-angel.git
cd gentleman-guardian-angel && bash install.sh
```

En Windows, `%USERPROFILE%\bin` debe estar en el `PATH` del usuario y el CLI de OpenCode (`opencode`) debe estar disponible en Git Bash (`opencode --version`).

### Uso

```bash
gga config          # muestra la configuración efectiva
gga run             # revisa lo que está en staging (lo que ejecuta el hook)
gga cache status    # estado de la caché (LOCALAPPDATA\gga\cache en Windows)
git commit --no-verify -m "..."   # saltarse la revisión de forma puntual
```

La caché evita re-revisar archivos sin cambios; `gga run --no-cache` la ignora.

## Despliegue

1. Configura las variables de entorno en el proveedor (Vercel, etc.).
2. Define `NEXT_PUBLIC_SITE_URL` con el dominio real para que sitemap y Open Graph sean correctos.
3. Configura `CONTACT_WEBHOOK_URL` si quieres recibir los envíos del formulario.
