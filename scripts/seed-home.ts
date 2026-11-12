import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getCliClient } from 'sanity/cli'
import { defaultHomeContent } from '../lib/content-defaults'
import type { RiskContent, RiskSection, RiskSub } from '../lib/risk-insurance'

/**
 * Seed del singleton `homePage` con el contenido actual del sitio.
 *
 * Es idempotente: reusa los assets de Nosotros por `originalFilename` (así no
 * se duplican imágenes) y reemplaza el documento con `createOrReplace`, así que
 * se puede correr las veces que haga falta.
 *
 * Uso: npx sanity exec scripts/seed-home.ts --with-user-token
 */

const client = getCliClient({ apiVersion: '2026-10-20' })

const ASSET_ID_QUERY = `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`

type ImageReference = {
  _type: 'image'
  asset: { _type: 'reference'; _ref: string }
}

/** Reusa el asset si ya existe; si no, lo sube desde `public/`. */
async function imageReference(filename: string): Promise<ImageReference> {
  const existing = await client.fetch<string | null>(ASSET_ID_QUERY, { filename })
  if (existing) {
    console.log(`asset ${filename}: reused (${existing})`)
    return { _type: 'image', asset: { _type: 'reference', _ref: existing } }
  }

  const file = await readFile(path.resolve('public', filename))
  const asset = await client.assets.upload('image', file, { filename })
  console.log(`asset ${filename}: uploaded (${asset._id})`)
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

function linkItem(link: { label: string; href: string; variant?: 'link' | 'button' }, key?: string) {
  return {
    ...(key === undefined ? {} : { _key: key }),
    _type: 'linkItem' as const,
    label: link.label,
    href: link.href,
    ...(link.variant === undefined ? {} : { variant: link.variant }),
  }
}

function riskContent(content: RiskContent, keyPrefix: string) {
  return {
    ...(content.paragraphs === undefined ? {} : { paragraphs: content.paragraphs }),
    ...(content.label === undefined ? {} : { label: content.label }),
    ...(content.box === undefined
      ? {}
      : { box: { title: content.box.title, text: content.box.text } }),
    ...(content.terms === undefined
      ? {}
      : {
          terms: content.terms.map((term, index) => ({
            _key: `${keyPrefix}-term-${index}`,
            _type: 'riskTerm' as const,
            name: term.name,
            ...(term.text === undefined ? {} : { text: term.text }),
            ...(term.note === undefined ? {} : { note: term.note }),
          })),
        }),
    ...(content.chips === undefined ? {} : { chips: content.chips }),
  }
}

function riskSubsection(sub: RiskSub, index: number, groupIndex: number) {
  const keyPrefix = `risk-${groupIndex}-sub-${index}`
  return {
    _key: keyPrefix,
    _type: 'riskSection' as const,
    title: sub.title,
    ...riskContent(sub, keyPrefix),
  }
}

function riskGroup(section: RiskSection, index: number) {
  const keyPrefix = `risk-${index}`
  return {
    _key: keyPrefix,
    _type: 'riskGroup' as const,
    title: section.title,
    ...riskContent(section, keyPrefix),
    ...(section.subs === undefined
      ? {}
      : { subs: section.subs.map((sub, subIndex) => riskSubsection(sub, subIndex, index)) }),
  }
}

async function main() {
  const content = defaultHomeContent

  const slides = await Promise.all(
    content.about.slides.map(async (slide, index) => ({
      _key: `about-slide-${index}`,
      _type: 'aboutSlide' as const,
      image: await imageReference(path.basename(slide.src)),
      alt: slide.alt,
      title: slide.title,
      isLogo: slide.isLogo,
      ...(slide.pad === undefined ? {} : { pad: slide.pad }),
    })),
  )

  const doc = {
    _id: 'homePage',
    _type: 'homePage',
    nav: {
      items: content.nav.map((item, index) => linkItem(item, `nav-${index}`)),
      socials: content.navSocials.map((social, index) => ({
        _key: `nav-social-${index}`,
        _type: 'socialItem' as const,
        network: social.network,
        href: social.href,
      })),
    },
    hero: {
      title: content.hero.title,
      paragraph: content.hero.paragraph,
      cards: content.hero.cards.map((card, index) => ({
        _key: `hero-card-${index}`,
        _type: 'heroCard' as const,
        title: card.title,
        text: card.text,
      })),
    },
    stages: {
      kicker: content.stages.kicker,
      title: content.stages.title,
      label: content.stages.label,
      intro: content.stages.intro,
      stages: content.stages.stages.map((stage, index) => ({
        _key: `stage-${index}`,
        _type: 'stage' as const,
        title: stage.title,
        text: stage.text,
        icon: stage.icon,
      })),
    },
    about: {
      kicker: content.about.kicker,
      title: content.about.title,
      mission: content.about.mission,
      cta: linkItem(content.about.cta),
      slides,
    },
    risks: {
      title: content.risks.title,
      intro: content.risks.intro,
      sections: content.risks.sections.map((section, index) => riskGroup(section, index)),
    },
    blog: {
      kicker: content.blog.kicker,
      title: content.blog.title,
    },
    newsletter: {
      kicker: content.newsletter.kicker,
      title: content.newsletter.title,
      bridgeText: content.newsletter.bridgeText,
      bridgeLink: linkItem(content.newsletter.bridgeLink),
    },
    contact: {
      kicker: content.contact.kicker,
      title: content.contact.title,
      paragraph: content.contact.paragraph,
      details: content.contact.details.map((detail, index) => ({
        _key: `contact-detail-${index}`,
        _type: 'contactDetail' as const,
        icon: detail.icon,
        text: detail.text,
        ...(detail.href === undefined ? {} : { href: detail.href }),
      })),
      form: content.contact.form,
    },
    footer: {
      tagline: content.footer.tagline,
      linkGroups: content.footer.linkGroups.map((group, groupIndex) => ({
        _key: `footer-group-${groupIndex}`,
        _type: 'footerLinkGroup' as const,
        title: group.title,
        links: group.links.map((link, linkIndex) =>
          linkItem(link, `footer-${groupIndex}-link-${linkIndex}`),
        ),
      })),
      legal: content.footer.legal,
    },
  }

  const saved = await client.createOrReplace(doc, { visibility: 'sync' })
  console.log(`documento ${saved._id}: ${saved._type} guardado`)
  console.log('Seed de la home completado.')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
