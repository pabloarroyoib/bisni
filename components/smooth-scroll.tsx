'use client'

import type { LenisOptions } from 'lenis'
import { ReactLenis, type LenisRef } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/* Opciones verificadas contra el README y los tipos de lenis 1.3.27.
   `lerp: .25` se eligió midiendo: .12 repartía una muesca de 100px en 34 frames
   (~.45s); .25 la reparte en 15 (~.20s), como la referencia (~14 frames/.25s).
   `syncTouch:false` deja el táctil nativo; `anchors:true` suaviza anclas y respeta
   `scroll-margin-top:96px`; `autoRaf` evita tener que llamar a `lenis.raf` a mano. */
const LENIS_OPTIONS = {
  lerp: 0.25,
  smoothWheel: true,
  syncTouch: false,
  anchors: true,
  autoRaf: true,
} satisfies LenisOptions

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Salto actual del navbar sticky: el mismo `scroll-margin-top` del CSS. */
const ANCHOR_OFFSET = 96

/**
 * Scroll suave global con Lenis.
 *
 * `useReducedMotion()` no se usa aquí: es una preferencia que solo existe en el
 * cliente, así que ramificar el primer render con ella reintroduce el desajuste
 * de hidratación que ya se corrigió en el proyecto. En su lugar el estado
 * arranca en `null` (desconocido) y el render del servidor y el primero del
 * cliente devuelven los hijos sin proveedor, idénticos. Ya montado, el efecto
 * de `matchMedia` decide si Lenis se activa y se queda escuchando cambios.
 *
 * Con `prefers-reduced-motion: reduce` no se monta Lenis: el scroll es el
 * nativo del navegador, sin interceptar rueda ni tacto. `ReactLenis root` va como
 * hermano sin DOM, no como wrapper de `children`, para que activarlo no desmonte
 * ni reinicie estado, formularios o Reveals.
 *
 * En `/studio` tampoco se monta: el Studio tiene sus propios paneles con scroll
 * interno y Lenis intercepta la rueda a nivel de ventana (los paneles quedan
 * clavados). Ahí el scroll tiene que ser el nativo.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isStudio = pathname === '/studio' || pathname.startsWith('/studio/')
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null)
  const lenisRef = useRef<LenisRef>(null)
  const active = reduceMotion === false && !isStudio

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    const sync = () => setReduceMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // Los anclajes (`#servicios`, `/#contacto`) los resuelve Next con un salto
  // nativo a `scrollIntoView`, y Lenis después reanima desde donde cree que
  // está: se ve un salto, un rebote y recién ahí el deslizamiento. Acá se
  // intercepta el clic en fase de captura —antes que el handler de `<Link>`— y
  // el desplazamiento lo hace Lenis, sin salto previo.
  useEffect(() => {
    if (!active) return

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a[href*="#"]')
      const href = link?.getAttribute('href')
      if (!href) return

      const hashIndex = href.indexOf('#')
      const path = href.slice(0, hashIndex)
      // Solo anclas de esta misma página: `#x`, o `/#x` cuando ya estamos en la home.
      if (path !== '' && !(path === '/' && window.location.pathname === '/')) return

      const id = decodeURIComponent(href.slice(hashIndex + 1))
      const element = id ? document.getElementById(id) : null
      if (!element) return

      const lenis = lenisRef.current?.lenis
      if (!lenis) return

      event.preventDefault()
      lenis.scrollTo(element, { offset: -ANCHOR_OFFSET })
      history.replaceState(null, '', `#${id}`)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [active])

  return (
    <>
      {children}
      {active ? <ReactLenis root ref={lenisRef} options={LENIS_OPTIONS} /> : null}
    </>
  )
}
