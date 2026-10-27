'use client'

import { PortableText, type PortableTextComponents } from 'next-sanity'
import { urlFor } from '@/sanity/lib/image'

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null

  // YouTube regular URL
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  return null
}

function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null

  // Vimeo regular URL
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h2>{children}</h2>,
    h2: ({ children }) => <h3>{children}</h3>,
    h3: ({ children }) => <h4>{children}</h4>,
    h4: ({ children }) => <h4>{children}</h4>,
    normal: ({ children }) => <p>{children}</p>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      return (
        // eslint-disable-next-line @next/next/no-img-element -- las imágenes de Portable Text no tienen dimensiones conocidas
        <img
          className="article-image"
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

      const youtubeUrl = getYouTubeEmbedUrl(url)
      if (youtubeUrl) {
        return (
          <div className="video-container">
            <iframe
              src={youtubeUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }

      const vimeoUrl = getVimeoEmbedUrl(url)
      if (vimeoUrl) {
        return (
          <div className="video-container">
            <iframe
              src={vimeoUrl}
              title="Vimeo video player"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }

      // Direct video URL (MP4, WebM, etc.)
      return (
        <div className="video-container">
          <video controls>
            <source src={url} />
            Tu navegador no soporta videos HTML5.
          </video>
        </div>
      )
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || '#'
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
