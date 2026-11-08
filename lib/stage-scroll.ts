/**
 * Geometría del "Programa de seguros": las etapas van en una fila horizontal y la
 * tira se desplaza según el índice activo. El desplazamiento se expresa en
 * porcentaje del ancho de la tira (que mide `count` paneles), no en píxeles: así no
 * depende de las medidas del viewport ni sufre por la barra de scroll.
 */

/** Desplazamiento de la tira en porcentaje de su propio ancho (0 a -75 con 4 etapas). */
export function stageTrackOffsetPercent(progress: number, count: number): number {
  return -((progress * (count - 1)) / count) * 100
}
