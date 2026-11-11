/**
 * Lógica pura del efecto de aparición al scroll. Vive acá, separada del componente,
 * para poder testearla y para dejar explícita la regla que evita el error de
 * hidratación: el estado inicial **no** puede depender de `prefers-reduced-motion`,
 * porque el servidor no conoce esa preferencia y el cliente sí.
 */

export const REVEAL_EASE = [0.215, 0.61, 0.355, 1] as const
export const REVEAL_DURATION = 0.55
export const REDUCED_DURATION = 0.4
export const REVEAL_Y = 30

export type RevealVariant = 'up' | 'fade' | 'scale'

export type RevealTransition = {
  duration: number
  delay: number
  ease: readonly [number, number, number, number]
}

export type ReducedTransition = {
  opacity: { duration: number; delay: number; ease: readonly [number, number, number, number] }
  y: { duration: number }
  scale: { duration: number }
}

/** Estado visible final, común a todas las variantes. */
export const SHOWN = { opacity: 1, y: 0, scale: 1 }

/**
 * Estado inicial. Igual en servidor y cliente: no recibe la preferencia de
 * movimiento reducido a propósito.
 */
export function hiddenState(variant: RevealVariant, y = REVEAL_Y) {
  if (variant === 'fade') {
    return { opacity: 0 }
  }

  if (variant === 'scale') {
    return { opacity: 0, scale: 0.94 }
  }

  return { opacity: 0, y }
}

/**
 * Con movimiento reducido se conserva el fundido y el desplazamiento se resuelve
 * en 0 s: el elemento aparece con opacidad, sin movimiento visible.
 */
export function revealTransition(reduce: boolean | null | undefined, delay = 0): RevealTransition | ReducedTransition {
  if (!reduce) {
    return { duration: REVEAL_DURATION, delay, ease: REVEAL_EASE }
  }

  return {
    opacity: { duration: REDUCED_DURATION, delay, ease: REVEAL_EASE },
    y: { duration: 0 },
    scale: { duration: 0 },
  }
}
