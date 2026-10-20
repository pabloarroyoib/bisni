import { urlFor } from '@/sanity/lib/image'

type SanityImage = {
  asset?: unknown
  alt?: string | null
} | null

export type SanityPost = {
  _id: string
  slug?: { current?: string } | null
  title?: string | null
  excerpt?: string | null
  publishedAt?: string | null
  mainImage?: SanityImage
  category?: string | null
  author?: {
    name?: string | null
    slug?: { current?: string } | null
    image?: SanityImage
  } | null
  body?: unknown
}

export type BlogAccent = 'cyan' | 'navy' | 'lime' | 'orange'

export type BlogPost = {
  _id: string
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  read: string
  accent: BlogAccent
  imageUrl: string | null
  imageAlt: string
  body: unknown
  author?: {
    name?: string
    imageUrl?: string | null
  }
}

const ACCENTS: BlogAccent[] = ['cyan', 'navy', 'lime', 'orange']

const ACCENT_BY_CATEGORY: Record<string, BlogAccent> = {
  Ciberseguridad: 'cyan',
  Finanzas: 'navy',
  Normativa: 'lime',
  Estrategia: 'orange',
}

function readingTime(body: unknown): string {
  if (!Array.isArray(body)) return '1 min'
  const words = body
    .filter((block) => block && typeof block === 'object' && '_type' in block && block._type === 'block')
    .flatMap((block) => {
      if (!block || typeof block !== 'object' || !('children' in block) || !Array.isArray(block.children)) {
        return []
      }
      return block.children
    })
    .map((child) => (child && typeof child === 'object' && 'text' in child && typeof child.text === 'string' ? child.text : ''))
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return `${Math.max(1, Math.round(words / 200))} min`
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(new Date(value))
}

export function mapPosts(posts: SanityPost[] | null | undefined): BlogPost[] {
  return (posts ?? []).map((post, index) => {
    const category = post.category ?? 'Perspectivas'
    const image = post.mainImage
    const author = post.author
    const slug = post.slug?.current

    return {
      _id: post._id,
      slug: slug || post._id,
      title: post.title ?? 'Sin título',
      excerpt: post.excerpt ?? '',
      category,
      date: formatDate(post.publishedAt),
      read: readingTime(post.body),
      accent: ACCENT_BY_CATEGORY[category] ?? ACCENTS[index % ACCENTS.length],
      imageUrl: image?.asset ? urlFor(image).width(800).height(500).fit('crop').url() : null,
      imageAlt: image?.alt || post.title || '',
      body: post.body ?? [],
      author: author
        ? {
            name: author.name ?? undefined,
            imageUrl: author.image?.asset ? urlFor(author.image).width(100).height(100).fit('crop').url() : null,
          }
        : undefined,
    }
  })
}

export function mapPost(post: SanityPost | null | undefined): BlogPost | null {
  if (!post) return null
  return mapPosts([post])[0]
}
