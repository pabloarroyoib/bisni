import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { MultilineText } from '@/components/multiline-text'
import { Reveal } from '@/components/reveal'
import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/social-icons'
import { defaultHomeContent } from '@/lib/content-defaults'
import { CONTACT_EMAIL, mailtoHref } from '@/lib/email'
import type { FooterContent, SocialLink } from '@/lib/home-content'

/** Pie compartido por todas las páginas. Estático: Server Component. */
export function SiteFooter({
  content = defaultHomeContent.footer,
  socials = defaultHomeContent.navSocials,
}: {
  content?: FooterContent
  socials?: SocialLink[]
}) {
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
          <a href={mailtoHref()} aria-label={`Enviar un correo a ${CONTACT_EMAIL}`}>
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
