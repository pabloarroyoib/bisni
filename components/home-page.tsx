'use client'

import Link from 'next/link'
import { ArrowUpRight, Globe2, Mail, MapPin } from 'lucide-react'
import { BlogCard } from '@/components/blog-card'
import { ContactForm } from '@/components/contact-form'
import { HorizontalStages } from '@/components/horizontal-stages'
import { AboutSection } from '@/components/about-section'
import { RiskAccordion } from '@/components/risk-accordion'
import { NewsletterForm } from '@/components/newsletter-form'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'
import { SiteHeader } from '@/components/site-header'
import { CONTACT_EMAIL, gmailComposeUrl, mailtoHref } from '@/lib/email'
import type { BlogPost } from '@/lib/blog'
import type { ReactNode } from 'react'

/** Tarjetas que explican la propuesta de valor, debajo del hero. */
const valueCards = [
  {
    title: 'Te ayudamos',
    text: 'GROU Asesores ofrece soluciones de seguros empresariales diseñadas para proteger activos, reducir riesgos y asegurar la continuidad operativa de tu negocio.',
  },
  {
    title: 'Soluciones Personalizadas',
    text: 'Identificamos las vulnerabilidades específicas de tu sector para diseñar coberturas de seguros que cubran cada eventualidad de manera precisa.',
  },
  {
    title: 'Nuestra misión',
    text: 'Entender cada riesgo y diseñar seguros empresariales que permitan a las compañías operar con confianza y resiliencia. Ser un aliado estratégico para la prevención y la protección del valor de las empresas.',
  },
]



/** Cuántos artículos muestra la home antes de mandar a /blog. */
const HOME_BLOG_LIMIT = 4

type HomePageProps = {
  posts: BlogPost[]
  /** Textura "Relieve" de página completa, ya renderizada en el servidor. */
  background: ReactNode
  /** Textura "Relieve" de la sección de contacto (variante oscura). */
  contactBackground: ReactNode
  /** Pie compartido, ya renderizado en el servidor. */
  footer: ReactNode
}

export function HomePage({ posts, background, contactBackground, footer }: HomePageProps) {

  const teaserPosts = posts.slice(0, HOME_BLOG_LIMIT)



  return (
    <main className="site-shell">
      <SiteHeader />

      {background}
      <span id="contenido" tabIndex={-1} />

      <section className="hero" id="inicio">
        <div className="hero-inner">
          <Stagger className="hero-text" immediate>
            <StaggerItem>
              <p className="hero-kicker">GROU Asesores</p>
            </StaggerItem>
            <StaggerItem>
              <h1>Protección integral para empresas</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="hero-copy">En GROU Asesores evaluamos los riesgos específicos de cada empresa y diseñamos soluciones de seguros a medida para proteger los activos de tu organización, fortaleciendo la capacidad de respuesta de la empresa ante eventos críticos. Así puedes enfocarte en el crecimiento mientras nosotros gestionamos la protección. Trabajamos de manera proactiva para anticipar amenazas y diseñar soluciones a medida.</p>
            </StaggerItem>
          </Stagger>
          <Stagger className="hero-cards" immediate>
            {valueCards.map(({ title, text }, index) => (
              <StaggerItem className={`hero-card-${index + 1}`} key={title}>
                <article className="hero-card">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <HorizontalStages />

      <AboutSection />

      <RiskAccordion />


      <section className="blog section" id="blog">
        <Reveal className="section-heading">
          <div>
            <p className="section-kicker">Perspectivas GROU Asesores</p>
            <h2>Ideas para navegar<br /><em>lo que viene.</em></h2>
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
                <p className="section-kicker">Newsletter</p>
                <h2>Una idea útil,<br /><em>una vez al mes.</em></h2>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <p className="section-intro">Riesgo, ciberseguridad y cumplimiento. Un correo al mes, sin ruido y sin spam.</p>
          </Reveal>
        </div>
        <Reveal className="newsletter-action">
          <NewsletterForm />
          <p className="newsletter-bridge">¿Buscas resolver un caso concreto? <a href="#contacto">Hablemos</a></p>
        </Reveal>
      </section>

      <section className="contact section" id="contacto">{contactBackground}<Reveal className="contact-copy"><p className="section-kicker">Hablemos</p><h2>El próximo movimiento<br /><em>empieza aquí.</em></h2><p>Cuéntanos qué te preocupa. Te ayudaremos a ponerle nombre, contexto y un plan.</p><div className="contact-details"><div><MapPin aria-hidden="true" /><span>Calle Serrano 55<br />28006 Madrid</span></div><div><Mail aria-hidden="true" /><span><a href={mailtoHref()}>{CONTACT_EMAIL}</a><a className="mail-alt" href={gmailComposeUrl()} target="_blank" rel="noopener noreferrer">o abrir en Gmail</a></span></div><div><Globe2 aria-hidden="true" /><span>+34 910 123 456</span></div></div></Reveal><Reveal className="contact-form-reveal"><ContactForm /></Reveal></section>

      {footer}
    </main>
  )
}
