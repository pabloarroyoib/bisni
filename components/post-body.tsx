import { PortableText, type PortableTextComponents } from 'next-sanity'
import { urlFor } from '@/sanity/lib/image'

type VideoEmbed = {
  src: string
  title: string
  allow: string
}

const DIRECT_VIDEO_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:[?#]|$)/i
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function parseUrl(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

/** youtube.com/watch, youtu.be, /embed, /shorts, /live y m.youtube.com */
function getYouTubeEmbedUrl(url: string): string | null {
  const parsed = parseUrl(url)
  if (!parsed) return null

  const host = parsed.hostname.toLowerCase().replace(/^www\.|^m\./, '')
  const path = parsed.pathname.replace(/\/+$/, '')
  let id: string | null = null

  if (host === 'youtu.be') {
    id = path.split('/').filter(Boolean)[0] ?? null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (path === '/watch') {
      id = parsed.searchParams.get('v')
    } else {
      id = path.match(/^\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]+)/)?.[1] ?? null
    }
  }

  if (!id || !/^[a-zA-Z0-9_-]{6,}$/.test(id)) return null
  return `https://www.youtube.com/embed/${id}`
}

/** vimeo.com/<id>, canales/grupos/ondemand y enlaces no listados con hash */
function getVimeoEmbedUrl(url: string): string | null {
  const parsed = parseUrl(url)
  if (!parsed) return null

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null

  const segments = parsed.pathname.split('/').filter(Boolean)
  const idIndex = segments.findIndex((segment) => /^\d+$/.test(segment))
  if (idIndex === -1) return null

  const embed = new URL(`https://player.vimeo.com/video/${segments[idIndex]}`)
  // Enlace no listado: el hash va en la ruta (/<id>/<hash>) o como ?h=<hash>
  const hash = segments[idIndex + 1] ?? parsed.searchParams.get('h')
  if (hash && /^[a-zA-Z0-9]+$/.test(hash)) embed.searchParams.set('h', hash)

  return embed.toString()
}

/** drive.google.com/file/d/<id>/view o ?id=<id> */
function getGoogleDriveEmbedUrl(url: string): string | null {
  const parsed = parseUrl(url)
  if (!parsed) return null

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
  if (host !== 'drive.google.com') return null

  const id = parsed.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? parsed.searchParams.get('id')
  if (!id) return null

  return `https://drive.google.com/file/d/${id}/preview`
}

function resolveVideoEmbed(url: string): VideoEmbed | null {
  if (!url) return null

  const youtube = getYouTubeEmbedUrl(url)
  if (youtube) {
    return {
      src: youtube,
      title: 'Video de YouTube',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    }
  }

  const vimeo = getVimeoEmbedUrl(url)
  if (vimeo) {
    return {
      src: vimeo,
      title: 'Video de Vimeo',
      allow: 'autoplay; fullscreen; picture-in-picture',
    }
  }

  const drive = getGoogleDriveEmbedUrl(url)
  if (drive) {
    return {
      src: drive,
      title: 'Video de Google Drive',
      allow: 'autoplay',
    }
  }

  return null
}

/** Solo http(s)/mailto/tel o rutas relativas; descarta javascript:, data: y //host */
function isSafeHref(href: unknown): href is string {
  if (typeof href !== 'string' || href.length === 0) return false
  if (href.startsWith('#') || (href.startsWith('/') && !href.startsWith('//'))) return true
  const parsed = parseUrl(href)
  return parsed !== null && SAFE_PROTOCOLS.has(parsed.protocol)
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h2>{children}</h2>,
    h2: ({ children }) => <h3>{children}</h3>,
    h3: ({ children }) => <h4>{children}</h4>,
    h4: ({ children }) => <h5>{children}</h5>,
    normal: ({ children }) => <p>{children}</p>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      return (
        // eslint-disable-next-line @next/next/no-img-element -- las imágenes de Portable Text no exponen dimensiones; excepción documentada en AGENTS.md
        <img
          src={urlFor(value).width(900).fit('max').auto('format').url()}
          alt={value.alt || ''}
          loading="lazy"
          decoding="async"
        />
      )
    },
    video: ({ value }) => {
      const url = value?.url
      if (!url) return null

      const embed = resolveVideoEmbed(url)
      if (embed) {
        return (
          <div className="video-container">
            <iframe src={embed.src} title={embed.title} allow={embed.allow} loading="lazy" allowFullScreen />
          </div>
        )
      }

      // URL directa de un archivo de video (MP4, WebM…); el resto se ignora
      if (DIRECT_VIDEO_RE.test(url)) {
        return (
          <div className="video-container">
            <video controls>
              <source src={url} />
              Tu navegador no soporta videos HTML5.
            </video>
          </div>
        )
      }

      return null
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = isSafeHref(value?.href) ? value.href : '#'
      const isExternal = href.startsWith('http')
      return (
        <a href={href} rel={isExternal ? 'noreferrer noopener' : undefined} target={isExternal ? '_blank' : undefined}>
          {children}
        </a>
      )
    },
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
}

export function PostBody({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0) return null
  return (
    <div className="article-body">
      <PortableText value={value} components={components} />
    </div>
  )
}
