import type { SanityImageSource } from '@sanity/image-url'
import { urlFor } from '@/sanity/lib/image'
import { defaultHomeContent } from './content-defaults'
import type { RiskContent, RiskSection, RiskSub, RiskTerm } from './risk-insurance'

/** Enlace interno o externo editable desde el Studio. */
export type LinkItem = { label: string; href: string }

export const NAV_VARIANTS = ['link', 'button'] as const
export type NavVariant = (typeof NAV_VARIANTS)[number]
export type NavItem = LinkItem & { variant: NavVariant }

export const SOCIAL_NETWORKS = ['linkedin', 'instagram', 'facebook', 'whatsapp'] as const
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number]
export type SocialLink = { network: SocialNetwork; href: string }

export type HeroCard = { title: string; text: string }

export type HeroContent = {
  title: string
  paragraph: string
  cards: HeroCard[]
}

export const STAGE_ICONS = ['diagnostico', 'diseno', 'seguimiento'] as const
export type StageIcon = (typeof STAGE_ICONS)[number]

export type Stage = {
  title: string
  text: string
  icon: StageIcon
}

export type StagesContent = {
  kicker: string
  title: string
  label: string
  intro: string
  stages: Stage[]
}

export type AboutSlide = {
  src: string
  alt: string
  title: string
  /** Los logos van con `contain` y aire alrededor; el retrato llena el marco. */
  isLogo: boolean
  /** Aire alrededor del logo, en % del marco. */
  pad?: number
}

export type AboutContent = {
  kicker: string
  title: string
  mission: string
  cta: LinkItem
  slides: AboutSlide[]
}

export type RisksContent = {
  title: string
  intro: string
  sections: RiskSection[]
}

export type SectionHeading = { kicker: string; title: string }

export type NewsletterContent = {
  kicker: string
  title: string
  bridgeText: string
  bridgeLink: LinkItem
}

export const CONTACT_ICONS = ['map', 'mail', 'globe', 'phone'] as const
export type ContactIcon = (typeof CONTACT_ICONS)[number]

export type ContactDetail = {
  icon: ContactIcon
  text: string
  href?: string
}

export type ContactFormContent = {
  nameLabel: string
  namePlaceholder: string
  companyLabel: string
  companyPlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  messageLabel: string
  messagePlaceholder: string
  submitLabel: string
  sendingLabel: string
  privacyNote: string
}

export type ContactContent = {
  kicker: string
  title: string
  paragraph: string
  details: ContactDetail[]
  form: ContactFormContent
}

export type FooterLinkGroup = {
  title: string
  links: LinkItem[]
}

export type FooterContent = {
  tagline: string
  linkGroups: FooterLinkGroup[]
  legal: string
}

export type HomeContent = {
  nav: NavItem[]
  navSocials: SocialLink[]
  hero: HeroContent
  stages: StagesContent
  about: AboutContent
  risks: RisksContent
  blog: SectionHeading
  newsletter: NewsletterContent
  contact: ContactContent
  footer: FooterContent
}

/**
 * Forma que devuelve `HOME_QUERY`. Todo es opcional a propósito: el resolver
 * completa cada campo con `defaultHomeContent` si el documento todavía no se
 * publicó o si el cliente vació un campo.
 */
export type SanityHomePage = {
  nav?: { items?: (SanityNavItem | null)[] | null; socials?: (SanitySocialLink | null)[] | null } | null
  hero?: {
    title?: string | null
    paragraph?: string | null
    cards?: ({ title?: string | null; text?: string | null } | null)[] | null
  } | null
  stages?: {
    kicker?: string | null
    title?: string | null
    label?: string | null
    intro?: string | null
    stages?: ({ title?: string | null; text?: string | null; icon?: string | null } | null)[] | null
  } | null
  about?: {
    kicker?: string | null
    title?: string | null
    mission?: string | null
    cta?: Partial<LinkItem> | null
    slides?: (Partial<SanityAboutSlide> | null)[] | null
  } | null
  risks?: {
    title?: string | null
    intro?: string | null
    sections?: (unknown | null)[] | null
  } | null
  blog?: { kicker?: string | null; title?: string | null } | null
  newsletter?: {
    kicker?: string | null
    title?: string | null
    bridgeText?: string | null
    bridgeLink?: Partial<LinkItem> | null
  } | null
  contact?: {
    kicker?: string | null
    title?: string | null
    paragraph?: string | null
    details?: ({ icon?: string | null; text?: string | null; href?: string | null } | null)[] | null
    form?: SanityContactForm | null
  } | null
  footer?: {
    tagline?: string | null
    linkGroups?: ({ title?: string | null; links?: (Partial<LinkItem> | null)[] | null } | null)[] | null
    legal?: string | null
  } | null
}

type SanityAboutSlide = {
  image?: { asset?: SanityImageSource } | null
  alt?: string | null
  title?: string | null
  isLogo?: boolean | null
  pad?: number | null
}

type SanityContactForm = {
  [Key in keyof ContactFormContent]?: string | null
}

type SanityNavItem = Partial<LinkItem> & { variant?: string | null }

type SanitySocialLink = { network?: string | null; href?: string | null }

type RiskTermInput = {
  name?: string | null
  text?: string | null
  note?: string | null
}

/* -------------------------------------------------------------------------- */
/* Helpers de normalización                                                    */
/* -------------------------------------------------------------------------- */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {})

const itemsOf = (value: unknown): unknown[] | null => (Array.isArray(value) ? value : null)

/** Texto requerido: si viene vacío o no es string, usa el default. */
function text(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed === '' ? fallback : trimmed
}

/** Texto opcional: nunca devuelve cadenas vacías. */
function optionalText(value: unknown, fallback?: string): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed !== '') return trimmed
  }
  const fallbackText = fallback?.trim() ?? ''
  return fallbackText === '' ? undefined : fallbackText
}

/** Lista de párrafos o chips; si el array falta o queda vacío, cae al default. */
function textList(value: unknown, fallback?: string[]): string[] | undefined {
  const items = itemsOf(value)
  const cleaned = (items ?? [])
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  if (cleaned.length > 0) return cleaned
  return fallback && fallback.length > 0 ? fallback : undefined
}

/** Valor de un select cerrado; cualquier cosa fuera de la lista usa el default. */
function pickOne<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

/**
 * Arrays cuyo largo es parte del diseño (tarjetas, etapas, slides, áreas):
 * siempre se resuelven a la misma cantidad de posiciones, mezclando cada una
 * contra su default.
 */
function mergePositions<D>(
  raw: unknown,
  fallback: D[],
  merge: (rawItem: unknown, fallbackItem: D) => D,
): D[] {
  const items = itemsOf(raw)
  return fallback.map((fallbackItem, index) => merge(items?.[index], fallbackItem))
}

/**
 * Arrays de largo variable (navegación, detalles, grupos, términos, subs): si
 * el cliente publicó al menos un item, manda su lista; si el array falta o está
 * vacío, se usa el default.
 */
function mergeList<D>(
  raw: unknown,
  fallback: D[],
  merge: (rawItem: unknown, fallbackItem: D | undefined) => D,
): D[] {
  const items = itemsOf(raw)
  if (!items || items.length === 0) return fallback
  return items.map((item, index) => merge(item, fallback[index]))
}

/* -------------------------------------------------------------------------- */
/* Bloques                                                                     */
/* -------------------------------------------------------------------------- */

function mergeLinkItem(raw: unknown, fallback?: LinkItem): LinkItem {
  const value = asRecord(raw)
  return {
    label: text(value.label, fallback?.label ?? ''),
    href: text(value.href, fallback?.href ?? ''),
  }
}

function mergeNavItem(raw: unknown, fallback?: NavItem): NavItem {
  const value = asRecord(raw)
  return {
    ...mergeLinkItem(raw, fallback),
    variant: pickOne(value.variant, NAV_VARIANTS, fallback?.variant ?? 'link'),
  }
}

function mergeSocialLink(raw: unknown): SocialLink {
  const value = asRecord(raw)
  return {
    network: pickOne(value.network, SOCIAL_NETWORKS, 'linkedin'),
    href: text(value.href, ''),
  }
}

// A diferencia del resto de los arrays, uno vacío es una decisión explícita
// del cliente (sin redes). Solo el campo ausente cae a los defaults.
function mergeSocials(raw: unknown, fallback: SocialLink[]): SocialLink[] {
  const items = itemsOf(raw)
  if (!items) return fallback
  return items.map((item) => mergeSocialLink(item))
}

function mergeHeroCard(raw: unknown, fallback: HeroCard): HeroCard {
  const value = asRecord(raw)
  return {
    title: text(value.title, fallback.title),
    text: text(value.text, fallback.text),
  }
}

function mergeStage(raw: unknown, fallback: Stage): Stage {
  const value = asRecord(raw)
  return {
    title: text(value.title, fallback.title),
    text: text(value.text, fallback.text),
    icon: pickOne(value.icon, STAGE_ICONS, fallback.icon),
  }
}

function imageUrl(value: unknown): string | null {
  const image = asRecord(value)
  if (!image.asset) return null
  return urlFor(image as SanityImageSource).width(1200).url()
}

function mergeSlide(raw: unknown, fallback: AboutSlide): AboutSlide {
  const value = asRecord(raw)
  const isLogo = typeof value.isLogo === 'boolean' ? value.isLogo : fallback.isLogo
  const pad = typeof value.pad === 'number' && Number.isFinite(value.pad) ? value.pad : fallback.pad

  return {
    src: imageUrl(value.image) ?? fallback.src,
    alt: text(value.alt, fallback.alt),
    title: text(value.title, fallback.title),
    isLogo,
    pad,
  }
}

function mergeRiskTerm(raw: unknown, fallback?: RiskTerm): RiskTerm {
  const value = asRecord(raw) as RiskTermInput
  const term: RiskTerm = {
    name: text(value.name, fallback?.name ?? ''),
  }
  const body = optionalText(value.text, fallback?.text)
  const note = optionalText(value.note, fallback?.note)
  if (body) term.text = body
  if (note) term.note = note
  return term
}

function mergeRiskBox(raw: unknown, fallback?: { title: string; text: string }) {
  if (!isRecord(raw)) return fallback
  return {
    title: text(raw.title, fallback?.title ?? ''),
    text: text(raw.text, fallback?.text ?? ''),
  }
}

function mergeRiskContent(raw: unknown, fallback: RiskContent): RiskContent {
  const value = asRecord(raw)
  const content: RiskContent = {}

  const paragraphs = textList(value.paragraphs, fallback.paragraphs)
  if (paragraphs) content.paragraphs = paragraphs

  const label = optionalText(value.label, fallback.label)
  if (label) content.label = label

  const box = mergeRiskBox(value.box, fallback.box)
  if (box) content.box = box

  const terms = mergeList(value.terms, fallback.terms ?? [], (term, termFallback) =>
    mergeRiskTerm(term, termFallback),
  )
  if (terms.length > 0) content.terms = terms

  const chips = textList(value.chips, fallback.chips)
  if (chips) content.chips = chips

  return content
}

function mergeRiskSub(raw: unknown, fallback?: RiskSub): RiskSub {
  const value = asRecord(raw)
  return {
    title: text(value.title, fallback?.title ?? ''),
    ...mergeRiskContent(value, fallback ?? {}),
  }
}

function mergeRiskSection(raw: unknown, fallback?: RiskSection): RiskSection {
  const value = asRecord(raw)
  const section: RiskSection = {
    title: text(value.title, fallback?.title ?? ''),
    ...mergeRiskContent(value, fallback ?? {}),
  }
  const subs = mergeList(value.subs, fallback?.subs ?? [], mergeRiskSub)
  if (subs.length > 0) section.subs = subs
  return section
}

function mergeContactDetail(raw: unknown, fallback?: ContactDetail): ContactDetail {
  const value = asRecord(raw)
  const detail: ContactDetail = {
    icon: pickOne(value.icon, CONTACT_ICONS, fallback?.icon ?? 'map'),
    text: text(value.text, fallback?.text ?? ''),
  }
  const href = optionalText(value.href, fallback?.href)
  if (href) detail.href = href
  return detail
}

function mergeContactForm(raw: unknown, fallback: ContactFormContent): ContactFormContent {
  const value = asRecord(raw)
  return {
    nameLabel: text(value.nameLabel, fallback.nameLabel),
    namePlaceholder: text(value.namePlaceholder, fallback.namePlaceholder),
    companyLabel: text(value.companyLabel, fallback.companyLabel),
    companyPlaceholder: text(value.companyPlaceholder, fallback.companyPlaceholder),
    emailLabel: text(value.emailLabel, fallback.emailLabel),
    emailPlaceholder: text(value.emailPlaceholder, fallback.emailPlaceholder),
    messageLabel: text(value.messageLabel, fallback.messageLabel),
    messagePlaceholder: text(value.messagePlaceholder, fallback.messagePlaceholder),
    submitLabel: text(value.submitLabel, fallback.submitLabel),
    sendingLabel: text(value.sendingLabel, fallback.sendingLabel),
    privacyNote: text(value.privacyNote, fallback.privacyNote),
  }
}

/* -------------------------------------------------------------------------- */
/* Resolver                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Convierte el documento publicado en el contenido que consumen los
 * componentes. Nunca devuelve una sección vacía: cada campo ausente cae al
 * default y los arrays que definen el diseño conservan su cantidad.
 */
export function resolveHomeContent(raw: SanityHomePage | null | undefined): HomeContent {
  const doc = asRecord(raw)
  const defaults = defaultHomeContent

  const nav = asRecord(doc.nav)
  const hero = asRecord(doc.hero)
  const stages = asRecord(doc.stages)
  const about = asRecord(doc.about)
  const risks = asRecord(doc.risks)
  const blog = asRecord(doc.blog)
  const newsletter = asRecord(doc.newsletter)
  const contact = asRecord(doc.contact)
  const footer = asRecord(doc.footer)

  return {
    nav: mergeList(nav.items, defaults.nav, (item) => mergeNavItem(item)),
    navSocials: mergeSocials(nav.socials, defaults.navSocials),
    hero: {
      title: text(hero.title, defaults.hero.title),
      paragraph: text(hero.paragraph, defaults.hero.paragraph),
      cards: mergePositions(hero.cards, defaults.hero.cards, mergeHeroCard),
    },
    stages: {
      kicker: text(stages.kicker, defaults.stages.kicker),
      title: text(stages.title, defaults.stages.title),
      label: text(stages.label, defaults.stages.label),
      intro: text(stages.intro, defaults.stages.intro),
      stages: mergePositions(stages.stages, defaults.stages.stages, mergeStage),
    },
    about: {
      kicker: text(about.kicker, defaults.about.kicker),
      title: text(about.title, defaults.about.title),
      mission: text(about.mission, defaults.about.mission),
      cta: mergeLinkItem(about.cta, defaults.about.cta),
      slides: mergePositions(about.slides, defaults.about.slides, mergeSlide),
    },
    risks: {
      title: text(risks.title, defaults.risks.title),
      intro: text(risks.intro, defaults.risks.intro),
      sections: mergeList(risks.sections, defaults.risks.sections, mergeRiskSection),
    },
    blog: {
      kicker: text(blog.kicker, defaults.blog.kicker),
      title: text(blog.title, defaults.blog.title),
    },
    newsletter: {
      kicker: text(newsletter.kicker, defaults.newsletter.kicker),
      title: text(newsletter.title, defaults.newsletter.title),
      bridgeText: text(newsletter.bridgeText, defaults.newsletter.bridgeText),
      bridgeLink: mergeLinkItem(newsletter.bridgeLink, defaults.newsletter.bridgeLink),
    },
    contact: {
      kicker: text(contact.kicker, defaults.contact.kicker),
      title: text(contact.title, defaults.contact.title),
      paragraph: text(contact.paragraph, defaults.contact.paragraph),
      details: mergeList(contact.details, defaults.contact.details, mergeContactDetail),
      form: mergeContactForm(contact.form, defaults.contact.form),
    },
    footer: {
      tagline: text(footer.tagline, defaults.footer.tagline),
      linkGroups: mergeList(footer.linkGroups, defaults.footer.linkGroups, (rawGroup, fallbackGroup) => {
        const group = asRecord(rawGroup)
        return {
          title: text(group.title, fallbackGroup?.title ?? ''),
          links: mergeList(group.links, fallbackGroup?.links ?? [], (item) => mergeLinkItem(item)),
        }
      }),
      legal: text(footer.legal, defaults.footer.legal),
    },
  }
}
