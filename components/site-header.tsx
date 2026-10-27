'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const SECTIONS = [
  { label: 'Servicios', hash: 'servicios' },
  { label: 'Herramientas', hash: 'herramientas' },
  { label: 'Matriz', hash: 'matriz' },
  { label: 'Blog', hash: 'blog' },
  { label: 'Contacto', hash: 'contacto' },
] as const

/**
 * Cabecera compartida por todas las páginas. Es Client Component porque el menú
 * móvil necesita estado; el estado vive aquí y no en la página, así ninguna
 * página tiene que gestionarlo.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const onHome = pathname === '/'

  // En la home los anclajes son locales; desde otra ruta hay que volver a "/".
  const href = (hash: string) => (onHome ? `#${hash}` : `/#${hash}`)

  return (
    <header className="navbar">
      <Link className="brand" href="/" aria-label="bisni inicio">
        <span className="brand-mark">b</span>bisni<span className="brand-dot">.</span>
      </Link>

      <nav className={`nav-links ${open ? 'is-open' : ''}`} id="menu-principal" aria-label="Principal">
        {SECTIONS.map(({ label, hash }) => (
          <Link key={hash} href={href(hash)} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
      </nav>

      <Link className="nav-cta" href={href('contacto')}>
        Solicitar diagnóstico <ArrowUpRight aria-hidden="true" />
      </Link>

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
    </header>
  )
}
