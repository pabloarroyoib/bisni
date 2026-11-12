'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/social-icons'
import { defaultHomeContent } from '@/lib/content-defaults'
import type { NavItem, SocialLink } from '@/lib/home-content'

/**
 * Cabecera compartida por todas las páginas. Es Client Component porque el menú
 * móvil necesita estado; el estado vive aquí y no en la página, así ninguna
 * página tiene que gestionarlo.
 */
export function SiteHeader({
  items = defaultHomeContent.nav,
  socials = defaultHomeContent.navSocials,
}: {
  items?: NavItem[]
  socials?: SocialLink[]
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const onHome = pathname === '/'

  // En la home los anclajes son locales; desde otra ruta hay que volver a "/".
  // Las rutas reales (como /blog) se dejan tal cual.
  const href = (target: string) =>
    !target.startsWith('#') ? target : onHome ? target : `/${target}`

  return (
    <header className="navbar">
      <Link className="brand" href="/" aria-label="GROU Asesores inicio">
        <Image
          src="/grou-logo.webp"
          alt=""
          width={508}
          height={292}
          className="brand-logo"
          priority
        />
      </Link>

      <nav className={`nav-links ${open ? 'is-open' : ''}`} id="menu-principal" aria-label="Principal">
        {items.map(({ label, href: target, variant }, index) => (
          <Link
            key={`${index}-${target}`}
            href={href(target)}
            className={variant === 'button' ? 'button button-dark button-navy nav-cta' : undefined}
            aria-current={pathname === target ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="navbar-actions">
        {socials.length > 0 ? (
          <div className="nav-socials" role="group" aria-label="Redes sociales">
            {socials.map(({ network, href }, index) => {
              const Icon = SOCIAL_ICONS[network]

              return (
                <a
                  key={`${index}-${network}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SOCIAL_LABELS[network]} de GROU Asesores`}
                  onClick={() => setOpen(false)}
                >
                  <Icon />
                </a>
              )
            })}
          </div>
        ) : null}
        <button
          className="mobile-menu"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="menu-principal"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
