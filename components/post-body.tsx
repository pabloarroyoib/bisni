'use client'

import { PortableText, type PortableTextComponents } from 'next-sanity'
import { urlFor } from '@/sanity/lib/image'

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
        <img
          className="article-image"
          src={urlFor(value).width(900).fit('max').auto('format').url()}
          alt={value.alt || ''}
        />
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
