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
| `SMTP_HOST` | No | Servidor SMTP de Zoho (`smtp.zoho.com` por defecto) |
| `SMTP_PORT` | No | Puerto SMTP (`465` por defecto, SSL directo) |
| `SMTP_USER` | No | Cuenta de Zoho Mail que envía. Con `SMTP_PASS` y `CONTACT_TO` activa el email |
| `SMTP_PASS` | No | Contraseña de aplicación de Zoho Mail |
| `CONTACT_FROM` | No | Remitente visible (`SMTP_USER` por defecto) |
| `CONTACT_TO` | No | Buzón que recibe las consultas del formulario |
| `CONTACT_WEBHOOK_URL` | No | Alternativa sin SMTP: endpoint que recibe los envíos |
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

`POST /api/contact` valida el cuerpo (`lib/contact.ts`), aplica un rate limit en memoria (5 envíos/minuto por IP) y entrega el mensaje por una de dos vías.

### Entrega por email (SMTP de Zoho Mail)

Es la vía principal. Si están definidas `SMTP_USER`, `SMTP_PASS` y `CONTACT_TO`, el endpoint envía un email a ese buzón y **no** usa el webhook.

| Variable | Por defecto | Para qué |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.zoho.com` | Servidor SMTP de Zoho. |
| `SMTP_PORT` | `465` | `465` usa SSL directo; `587` usa STARTTLS. |
| `SMTP_USER` | — | Cuenta completa de Zoho Mail (por ejemplo `hola@bisni.es`). |
| `SMTP_PASS` | — | Contraseña de aplicación de Zoho Mail. |
| `CONTACT_FROM` | `SMTP_USER` | Remitente visible del email. |
| `CONTACT_TO` | — | Buzón que recibe las consultas. |

**Contraseña de aplicación, no la de la cuenta:** en Zoho Mail, `Configuración → Seguridad → Contraseñas de aplicación`. Requiere la verificación en dos pasos activada; Zoho muestra la contraseña una sola vez, así que cópiala directamente a `SMTP_PASS`. Revócala desde el mismo panel si se filtra.

`CONTACT_FROM` debe ser del **mismo dominio** que `SMTP_USER` (por ejemplo `hola@bisni.es`): Zoho firma con el dominio de la cuenta y un remitente ajeno dispara los filtros de spam. El asunto identifica al remitente (`Nueva consulta de <nombre> (<empresa>)`, máximo 120 caracteres y sin CR/LF para evitar inyección de cabeceras) y el `Reply-To` apunta al email del formulario, así que responder desde el buzón contesta al visitante.

El email se construye en `lib/contact-email.ts` (función pura, sin dependencias): versión en texto plano y HTML con todos los valores escapados y los saltos de línea del mensaje preservados.

### Entrega por webhook (alternativa)

Sin configuración SMTP, si existe `CONTACT_WEBHOOK_URL` el endpoint hace `POST` del JSON del formulario (Slack/Make/Zapier/hook propio), con `CONTACT_WEBHOOK_SECRET` opcional en la cabecera `Authorization`.

### Sin ninguna vía configurada

- En desarrollo: el envío se registra en la consola del servidor.
- En producción: la API responde `503` y la UI muestra un fallback a `hola@bisni.es`.

Un fallo de entrega (SMTP o webhook) responde `502`, así que el cliente sigue funcionando sin cambios. La vía SMTP usa el runtime de Node (`export const runtime = 'nodejs'`), porque `nodemailer` necesita sockets TCP.

El rate limit en memoria es válido para una sola instancia. Si despliegas en varias, cámbialo por Upstash Redis, Vercel KV o similar (`lib/rate-limit.ts`).

## Newsletter (Zoho Campaigns)

La sección `#newsletter` de la landing (`components/home-page.tsx`) renderiza el formulario de `components/newsletter-form.tsx`, que envía a Zoho Campaigns mediante la variante documentada **"No JavaScript Embedding"**: un `<form>` HTML nativo cuyo `action` es `https://zgnp-zngp.maillist-manage.com/weboptin.zc` y cuyo `target` es un iframe oculto llamado `_zcSignup`, también renderizado por el componente.

El formulario pide **email y nombre de pila obligatorio**: dos campos en una sola fila (con `aria-label`, sin etiqueta visible) y botón oscuro, para que no se parezca al formulario de consulta. Justo debajo, el puente «¿Buscas resolver un caso concreto? Hablemos» enlaza a `#contacto` y separa explícitamente la suscripción de la consulta.

- El nombre visible se envía como `FIRSTNAME` porque el merge tag de Zoho `$[FNAME|Suscriptor]$` lee **First Name**. El snippet original de Zoho pedía el nombre en `LASTNAME` (Apellidos), que nunca rellenaría `FNAME`; aquí se invierte a propósito.
- `LASTNAME` se envía **vacío a propósito** con un `<input type="hidden">`: Zoho acepta el campo vacío y algunas listas lo esperan, pero no alimenta el merge tag. Si la lista o el formulario de Zoho no exponen el campo First Name, `$[FNAME|Suscriptor]$` cae a su valor por defecto.
- No se carga `https://ma.zoho.com/js/optin.min.js`: esa variante inyecta IDs globales duplicados y no puede informar del éxito desde otro origen.
- La validación del formulario es local (`lib/newsletter.ts`) y usa un honeypot `website` como el del formulario de contacto. Valida `CONTACT_EMAIL` (email) y `FIRSTNAME` (nombre, 2–120 caracteres ya recortado).
- El envío es nativo (sin `preventDefault()` cuando los datos son válidos) y la respuesta de Zoho aterriza en el iframe oculto, en otro origen. Por eso **la web no puede confirmar el alta**: lo único verificable es que el iframe cargó, es decir que el envío salió. Si no carga en 8 segundos, el formulario se rehabilita con un botón "Reintentar" y un aviso.
- El **doble opt-in está desactivado** en Zoho (Settings → Consent & Privacy): el contacto entra directo a la lista y el mensaje de éxito lo dice sin prometer un correo de confirmación. Riesgos asumidos a cambio de menos fricción: rebotes por direcciones mal tipeadas, suscripciones a un tercero sin verificación (con el problema legal que eso implica según la LSSI-CE) y un consentimiento más débil como prueba ante un reclamo. La mitigación es que cada envío tenga una baja visible y se procese rápido.
- Si algún día se vuelve a activar el doble opt-in, `SUCCESS_MESSAGE` en `components/newsletter-form.tsx` tiene que volver a pedir la confirmación por correo; si no, la copia sería engañosa.
- Los campos ocultos (`submitType`, `formType`, `mode`, `zcvers`, `zx`, `zcld`, `zctd`, `zc_formIx`, `zc_trackCode`, `oldListIds`) y los metadatos `dt_*` (`dt_FIRSTNAME`, `dt_CONTACT_EMAIL`, `dt_LASTNAME`) están copiados literalmente de Zoho en `components/newsletter-form.tsx`. `dt_FIRSTNAME` declara el nombre como obligatorio (`true`), a diferencia del snippet original de Zoho (`false`). Si cambias el formulario en Zoho, vuelve a copiarlos desde su código de inserción sin reordenarlos.

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
  contact-email.ts         Construcción del email de contacto (SMTP)
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
3. Configura `SMTP_USER`, `SMTP_PASS` y `CONTACT_TO` para recibir los envíos del formulario por email; `CONTACT_WEBHOOK_URL` es la alternativa sin SMTP.

## Checklist: migrar a un dominio y una cuenta reales

La configuración actual vive en un dominio y una cuenta de Zoho de prueba. Al pasar a los definitivos, esto es lo que hay que tocar. Ordenado por dónde se hace.

### Código (requiere commit y deploy)

- [ ] **Formulario de newsletter** — si cambia la cuenta de Zoho Campaigns, reemplazar el bloque de campos ocultos en `components/newsletter-form.tsx` con los del nuevo snippet ("sin script"): `submitType`, `formType`, `mode`, `zcvers`, `zx`, `zcld`, `zctd`, `zc_formIx`, `zc_trackCode`, `oldListIds`. **`scriptless=yes` no se toca**: sin ese campo Zoho acepta y descarta el alta.
- [ ] **Destinatario y remitente** — actualizar `CONTACT_TO` y `CONTACT_FROM` en el hosting; el remitente debe ser del dominio nuevo.
- [ ] **`lib/email.ts`** — `CONTACT_EMAIL` y `CONTACT_SUBJECT` si cambia el correo público del sitio.

### Hosting (Vercel)

- [ ] **Dominio** — agregarlo al proyecto y redeployar.
- [ ] **`NEXT_PUBLIC_SITE_URL`** — el dominio nuevo en *Production*. Se hornea en el build: **sin redeploy no toma efecto**.
- [ ] **`SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`, `CONTACT_FROM`** — buzón nuevo. Las de servidor se leen en runtime, pero el deployment existente no las ve: hace falta un deploy nuevo.
- [ ] **Revocar el app password viejo** en Zoho Accounts → Seguridad.

### Sanity (solo si cambia el proyecto; el dominio no lo toca)

- [ ] **CORS** — agregar `https://tudominio.com` en *API → CORS origins*, conservando `http://localhost:3000`.
- [ ] **Webhooks** — actualizar la URL si alguno apuntaba al dominio viejo.
- [ ] **`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`** — **solo** si se migra a otro proyecto u organización de Sanity. Un cambio de dominio no los afecta.

### Zoho Campaigns (cuenta nueva)

- [ ] **Doble opt-in** — decidir de nuevo si se activa. Con el plan actual está desactivado y el `SUCCESS_MESSAGE` de `components/newsletter-form.tsx` lo refleja: si se activa, hay que volver a pedir la confirmación por correo o el mensaje miente.
- [ ] **Plantilla del mail de bienvenida** — en el editor HTML el footer de baja lo agrega Zoho siempre y no se puede quitar. Dejar solo `$[LI:SUB_PREF]$` y no duplicar el enlace de baja (Zoho permite uno por campaña). Tokens válidos: `$[LI:UNSUBSCRIBE]$`, `$[LI:SUB_PREF]$`, `$[LI:UPDATEPROFILE]$`.
- [ ] **Remitente verificado** — verificar la dirección "From" en Zoho para que los mails no caigan en spam.

### Verificación antes de dar por cerrada la migración

- [ ] Suscripción real desde el sitio: el contacto entra **directo a la lista** (o queda "no confirmado", si se activó el doble opt-in) y con el **First Name** poblado.
- [ ] Consulta real desde "Hablemos": el mail llega al buzón nuevo y el **responder** apunta a quien consultó.
- [ ] `npm test`, `npm run typecheck`, `npm run lint` y `npm run build` en verde, y el CI del push también.
- [ ] Sitemap y Open Graph con el dominio nuevo (abrir `/sitemap.xml` y revisar el HTML).
