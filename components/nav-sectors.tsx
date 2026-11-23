'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { sectorHref, type SectorLink } from '@/lib/sectors'

/**
 * Desplegable «Sectores» del navbar.
 *
 * El contenido sale de los documentos `sector`: sumar una industria es crear el
 * documento, no tocar este componente. Abre con clic o Enter (es un `button`),
 * cierra con Escape, con un clic afuera y al navegar; el panel queda en el DOM
 * con `aria-expanded` para que el teclado lo alcance en el orden natural.
 */
export function NavSectors({
  sectors,
  onNavigate,
}: {
  sectors: SectorLink[]
  /** Cierra el menú móvil cuando se elige un sector. */
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target
      if (rootRef.current && target instanceof Node && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  // Sin sectores no hay desplegable: mejor no mostrar una entrada vacía.
  if (sectors.length === 0) return null

  /** Solo en dispositivos con puntero fino: en táctil el `mouseenter` sintético
   *  abriría y el `click` cerraría en el mismo toque. */
  const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  return (
    <div
      className="nav-sectors"
      ref={rootRef}
      onMouseEnter={() => {
        if (canHover()) setOpen(true)
      }}
      onMouseLeave={() => {
        if (canHover()) setOpen(false)
      }}
    >
      <button
        type="button"
        className="nav-sectors-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => setOpen(canHover() ? true : (value) => !value)}
      >
        Sectores
        <ChevronDown aria-hidden="true" className={open ? 'is-open' : undefined} />
      </button>

      <div className={`nav-sectors-panel${open ? ' is-open' : ''}`} id={panelId}>
        <ul>
          {sectors.map((sector) => (
            <li key={sector.slug}>
              <Link
                href={sectorHref(sector.slug)}
                aria-current={pathname === sectorHref(sector.slug) ? 'page' : undefined}
                onClick={() => {
                  setOpen(false)
                  onNavigate?.()
                }}
              >
                {sector.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
