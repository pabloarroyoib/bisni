'use client'

import Link from 'next/link'
import { ArrowUpRight, Globe2, Mail, MapPin, Phone } from 'lucide-react'
import { BlogCard } from '@/components/blog-card'
import { ContactForm } from '@/components/contact-form'
import { HorizontalStages } from '@/components/horizontal-stages'
import { MultilineText } from '@/components/multiline-text'
import { AboutSection } from '@/components/about-section'
import { RiskAccordion } from '@/components/risk-accordion'
import { NewsletterForm } from '@/components/newsletter-form'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'
import { SiteHeader } from '@/components/site-header'
import { gmailComposeUrl } from '@/lib/email'
import type { BlogPost } from '@/lib/blog'
import type { ContactIcon, HomeContent } from '@/lib/home-content'
import type { ReactNode } from 'react'

/** Ícono de cada dato de contacto: el select del Studio es cerrado. */
const CONTACT_ICONS: Record<ContactIcon, typeof MapPin> = {
  map: MapPin,
  mail: Mail,
  globe: Globe2,
  phone: Phone,
}

/** Cuántos artículos muestra la home antes de mandar a /blog. */
const HOME_BLOG_LIMIT = 4

type HomePageProps = {
  content: HomeContent
  posts: BlogPost[]
  /** Textura "Relieve" de página completa, ya renderizada en el servidor. */
  background: ReactNode
  /** Textura "Relieve" de la sección de contacto (variante oscura). */
  contactBackground: ReactNode
  /** Pie compartido, ya renderizado en el servidor. */
  footer: ReactNode
}

export function HomePage({ content, posts, background, contactBackground, footer }: HomePageProps) {
  const teaserPosts = posts.slice(0, HOME_BLOG_LIMIT)

  return (
    <main className="site-shell">
      <SiteHeader items={content.nav} socials={content.navSocials} />

      {background}
      <span id="contenido" tabIndex={-1} />

      <section className="hero" id="inicio">
        <div className="hero-inner">
          <Stagger className="hero-text" immediate>
            <StaggerItem>
              <h1>{content.hero.title}</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="hero-copy">{content.hero.paragraph}</p>
            </StaggerItem>
          </Stagger>
          <Stagger className="hero-cards" immediate>
            {content.hero.cards.map(({ title, text }, index) => (
              <StaggerItem className={`hero-card-${index + 1}`} key={`${index}-${title}`}>
                <article className="hero-card">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <HorizontalStages content={content.stages} />

      <AboutSection content={content.about} />

      <RiskAccordion content={content.risks} />

      <section className="blog section" id="blog">
        <Reveal className="section-heading">
          <div>
            <p className="section-kicker">{content.blog.kicker}</p>
            <h2>
              <MultilineText text={content.blog.title} />
            </h2>
          </div>
        </Reveal>
        {teaserPosts.length === 0 ? (
          <Reveal>
            <p className="blog-empty">
              Aún no hay artículos publicados. Cuando publiques un artículo en el Studio, aparecerá aquí.
            </p>
          </Reveal>
        ) : (
          <div className="post-grid">
            {teaserPosts.map((post) => (
              <Reveal className="post-grid-reveal" key={post._id}>
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
        {posts.length > HOME_BLOG_LIMIT ? (
          <Reveal className="blog-more">
            <Link className="button button-ghost" href="/blog">
              Ver más artículos <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        ) : null}
      </section>

      <section className="newsletter section" id="newsletter">
        <div className="newsletter-copy">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="section-kicker">{content.newsletter.kicker}</p>
                <h2>
                  <MultilineText text={content.newsletter.title} />
                </h2>
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal className="newsletter-action">
          <NewsletterForm />
          <p className="newsletter-bridge">
            {content.newsletter.bridgeText}{' '}
            <a href={content.newsletter.bridgeLink.href}>{content.newsletter.bridgeLink.label}</a>
          </p>
        </Reveal>
      </section>

      <section className="contact section" id="contacto">
        {contactBackground}
        <Reveal className="contact-copy">
          <p className="section-kicker">{content.contact.kicker}</p>
          <h2>
            <MultilineText text={content.contact.title} />
          </h2>
          <p>{content.contact.paragraph}</p>
          <div className="contact-details">
            {content.contact.details.map((detail, index) => {
              const Icon = CONTACT_ICONS[detail.icon]

              return (
                <div key={`${index}-${detail.text}`}>
                  <Icon aria-hidden="true" />
                  <span>
                    {detail.href ? (
                      <>
                        <a href={detail.href}>{detail.text}</a>
                        {detail.icon === 'mail' ? (
                          <a
                            className="mail-alt"
                            href={gmailComposeUrl(detail.text)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            o abrir en Gmail
                          </a>
                        ) : null}
                      </>
                    ) : (
                      <MultilineText text={detail.text} />
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </Reveal>
        <Reveal className="contact-form-reveal">
          <ContactForm copy={content.contact.form} />
        </Reveal>
      </section>

      {footer}
    </main>
  )
}
