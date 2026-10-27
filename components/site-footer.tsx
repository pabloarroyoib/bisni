import Link from 'next/link'
import { Globe2, Mail } from 'lucide-react'

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
      { label: 'Sobre bisni', href: '/#contacto' },
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
      <div className="footer-main">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">b</span>bisni<span className="brand-dot">.</span>
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
      </div>

      <div className="footer-bottom">
        <span>© 2026 bisni. Protegiendo tu futuro corporativo.</span>
        <span className="socials">
          <Link href="/#contacto" aria-label="LinkedIn">
            <Globe2 aria-hidden="true" />
          </Link>
          <Link href="/#contacto" aria-label="Email">
            <Mail aria-hidden="true" />
          </Link>
        </span>
        <span>
          Hecho con intención <span className="brand-dot">●</span>
        </span>
      </div>
    </footer>
  )
}
