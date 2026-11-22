import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { MultilineText } from '@/components/multiline-text'
import { Reveal } from '@/components/reveal'
import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/social-icons'
import { defaultHomeContent } from '@/lib/content-defaults'
import { mailtoHref } from '@/lib/email'
import type { FooterContent, SocialLink } from '@/lib/home-content'
import { LEGAL_ROUTES, legalHref } from '@/lib/legal-routes'
import { defaultSiteSettings, ssnRegistrationLabel, type SiteSettings } from '@/lib/site-settings'

/** Pie compartido por todas las páginas. Estático: Server Component. */
export function SiteFooter({
  content = defaultHomeContent.footer,
  socials = defaultHomeContent.navSocials,
  settings = defaultSiteSettings,
}: {
  content?: FooterContent
  socials?: SocialLink[]
  settings?: SiteSettings
}) {
  const registration = ssnRegistrationLabel(settings)

  return (
    <footer className="footer">
      <Reveal className="footer-main">
        <div>
          <Link className="brand footer-brand" href="/" aria-label="GROU Asesores inicio">
            {/* Variante clara: el logo original tiene "ASESORES" en azul oscuro y
                sobre este fondo no se leería. */}
            <Image src="/grou-logo-claro.webp" alt="" width={508} height={292} className="brand-logo" />
          </Link>
          <p>
            <MultilineText text={content.tagline} />
          </p>
          {/* La matrícula es un dato regulatorio: se muestra siempre que esté
              cargada. El logo solo si el cliente confirmó que las reglas de uso
              lo permiten (`ssnShowInFooter`). */}
          {registration && (
            <p className="footer-ssn">
              <span>{registration}</span>
              {settings.ssnShowInFooter && settings.ssnLogo && (
                <a
                  href={settings.ssnUrl || 'https://www.ssn.gob.ar'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={settings.ssnLogo.url}
                    alt={settings.ssnLogo.alt}
                    width={140}
                    height={48}
                    className="footer-ssn-logo"
                  />
                </a>
              )}
            </p>
          )}
        </div>

        <nav className="footer-links" aria-label="Pie de página">
          {content.linkGroups.map((group, groupIndex) => {
            // Explora tiene los 6 links del navbar: ocupa dos columnas y sus
            // links se reparten 3 + 3. Legal queda como tercera columna.
            const wide = group.links.length > 3

            return (
              <div key={`${groupIndex}-${group.title}`} className={`footer-group${wide ? ' is-wide' : ''}`}>
                <strong>{group.title}</strong>
                <div className="footer-group-links">
                  {group.links.map((link, linkIndex) => (
                    <Link key={`${linkIndex}-${link.href}`} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Los links legales no son editables: una página legal no puede
              quedar despublicada ni apuntar a otra sección. */}
          <div className="footer-group">
            <strong>Legal</strong>
            <div className="footer-group-links">
              {LEGAL_ROUTES.map((route) => (
                <Link key={route.slug} href={legalHref(route.slug)}>
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </Reveal>

      <div className="footer-bottom">
        <span>{content.legal}</span>
        <span className="socials">
          {socials.map(({ network, href }, index) => {
            const Icon = SOCIAL_ICONS[network]

            return (
              <a
                key={`${index}-${network}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SOCIAL_LABELS[network]} de GROU Asesores`}
              >
                <Icon />
              </a>
            )
          })}
          <a href={mailtoHref(settings.email)} aria-label={`Enviar un correo a ${settings.email}`}>
            <Mail aria-hidden="true" />
          </a>
        </span>
        <span>
          Hecho con intención <span className="brand-dot">●</span>
        </span>
      </div>
    </footer>
  )
}
