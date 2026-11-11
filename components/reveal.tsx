'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  REVEAL_Y,
  SHOWN,
  hiddenState as hidden,
  revealTransition,
  type RevealVariant,
} from '@/lib/reveal-motion'

export type { RevealVariant }

/**
 * Aparición al hacer scroll: fundido y una subida leve, una sola vez por elemento.
 *
 * Los grupos usan `Stagger` + `StaggerItem` para entrar escalonados. Se animan
 * solo `opacity` y `transform`, nunca propiedades de layout, así no hay saltos.
 *
 * Dos detalles que no son obvios:
 * 1. El estado inicial **no** depende de `prefers-reduced-motion` (ver
 *    `lib/reveal-motion.ts`): si dependiera, el servidor y el cliente renderizarían
 *    estilos distintos y React tiraría un error de hidratación. La preferencia se
 *    aplica solo en la transición.
 * 2. `whileInView` con `once: true` no dispara si el elemento ya quedó por encima
 *    del viewport al montar (recarga a mitad de página o entrada por un ancla):
 *    se quedaría invisible. Por eso hay un fallback de "ya pasó".
 */

const VIEWPORT = { once: true, margin: '0px 0px -20% 0px' } as const

/**
 * True cuando el elemento ya está en pantalla o quedó por encima del viewport.
 *
 * Hay dos redes por si el `IntersectionObserver` no dispara (hidratación tardía,
 * hot reload del dev server, un contenedor que todavía medía 0 al montar):
 * 1. al montar se mide una vez, y
 * 2. un chequeo diferido a 1,2 s vuelve a medir.
 * El hero además usa `immediate`, así que no depende de ninguna de las dos.
 */
function useAlreadyPassed(immediate = false) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, VIEWPORT)
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    if (immediate) {
      const frame = requestAnimationFrame(() => setPassed(true))
      return () => cancelAnimationFrame(frame)
    }

    const measure = () => {
      const element = ref.current
      if (element && element.getBoundingClientRect().top < window.innerHeight * 0.8) {
        setPassed(true)
      }
    }

    measure()
    const timeout = window.setTimeout(measure, 1200)

    return () => window.clearTimeout(timeout)
  }, [immediate])

  return { ref, shown: inView || passed }
}

export function Reveal({
  children,
  delay = 0,
  y = REVEAL_Y,
  variant = 'up',
  className,
  immediate = false,
}: {
  children: ReactNode
  /** Segundos. */
  delay?: number
  y?: number
  variant?: RevealVariant
  className?: string
  /** Anima al montar sin esperar al observer (para lo que ya está en pantalla). */
  immediate?: boolean
}) {
  const reduce = useReducedMotion()
  const { ref, shown } = useAlreadyPassed(immediate)

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden(variant, y)}
      animate={shown ? SHOWN : hidden(variant, y)}
      transition={revealTransition(reduce, delay)}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  step = 0.1,
  className,
  immediate = false,
}: {
  children: ReactNode
  step?: number
  className?: string
  /** Anima al montar sin esperar al observer (para lo que ya está en pantalla). */
  immediate?: boolean
}) {
  const { ref, shown } = useAlreadyPassed(immediate)

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  y = REVEAL_Y,
  variant = 'up',
  className,
}: {
  children: ReactNode
  y?: number
  variant?: RevealVariant
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: hidden(variant, y),
        show: { ...SHOWN, transition: revealTransition(reduce, 0) },
      }}
    >
      {children}
    </motion.div>
  )
}
