'use client'

import type { LenisOptions } from 'lenis'
import { ReactLenis } from 'lenis/react'
import { useEffect, useState, type ReactNode } from 'react'

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
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    const sync = () => setReduceMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return (
    <>
      {children}
      {reduceMotion === false ? <ReactLenis root options={LENIS_OPTIONS} /> : null}
    </>
  )
}
