import Image from 'next/image'
import Link from 'next/link'
import { Globe2, Mail } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { CONTACT_EMAIL, mailtoHref } from '@/lib/email'

const LINK_GROUPS = [
  {
    title: 'Explora',
    links: [
      { label: 'Servicios', href: '/#servicios' },
      { label: 'Herramientas', href: '/#herramientas' },
      { label: 'Perspectivas', href: '/#blog' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Contacto', href: '/#contacto' },
      { label: 'Sobre GROU Asesores', href: '/#contacto' },
      { label: 'Trabaja con nosotros', href: '/#contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Aviso legal', href: '/#contacto' },
      { label: 'Privacidad', href: '/#contacto' },
      { label: 'Cookies', href: '/#contacto' },
    ],
  },
] as const

/** Pie compartido por todas las páginas. Estático: Server Component. */
export function SiteFooter() {
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
            Riesgo claro.
            <br />
            Decisiones sólidas.
          </p>
        </div>

        <nav className="footer-links" aria-label="Pie de página">
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <strong>{group.title}</strong>
              {group.links.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </Reveal>

      <Reveal className="footer-bottom">
        <span>© 2026 GROU Asesores. Protegiendo tu futuro corporativo.</span>
        <span className="socials">
          <Link href="/#contacto" aria-label="LinkedIn">
            <Globe2 aria-hidden="true" />
          </Link>
          {/* El sobre abre el correo: antes apuntaba a #contacto, que no es lo que promete el ícono. */}
          <a href={mailtoHref()} aria-label={`Enviar un correo a ${CONTACT_EMAIL}`}>
            <Mail aria-hidden="true" />
          </a>
        </span>
        <span>
          Hecho con intención <span className="brand-dot">●</span>
        </span>
      </Reveal>
    </footer>
  )
}
