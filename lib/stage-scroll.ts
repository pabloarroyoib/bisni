/**
 * Geometría del "Programa de seguros" fijado con `position: sticky`.
 *
 * La sección mide `count` viewports y el panel fijo uno, así que el recorrido útil
 * es el scroll que sobra después de que el panel se fija: `(count - 1)` viewports.
 * La tira es `count` paneles de ancho y se desplaza `progress * (count - 1) / count`
 * de su propio ancho, de modo que cada tarjeta entra al panel justo en su tramo del
 * recorrido. El progreso llega ya acotado a 0..1 y suavizado (useScroll + useSpring).
 */

/** Desplazamiento de la tira en porcentaje de su propio ancho (0 a -75 con 4 etapas). */
export function stageTrackOffsetPercent(progress: number, count: number): number {
  return -((progress * (count - 1)) / count) * 100
}

/** Etapa que está apoyada en el panel para un progreso dado. */
export function stageActiveIndex(progress: number, count: number): number {
  const clamped = Math.min(1, Math.max(0, progress))

  return Math.round(clamped * (count - 1))
}
