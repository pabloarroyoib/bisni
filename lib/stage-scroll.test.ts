import { describe, expect, it } from 'vitest'
import { stageTrackOffsetPercent } from './stage-scroll'

/**
 * Posición de la tarjeta `index` medida en anchos de panel: 0 significa que está
 * apoyada en el viewport y 1 que está justo fuera, a la derecha.
 */
function cardOffsetInPanels(index: number, progress: number, count: number) {
  return index + (count * stageTrackOffsetPercent(progress, count)) / 100
}

describe('stageTrackOffsetPercent', () => {
  it('al final del recorrido desplaza la tira un panel menos de su ancho', () => {
    expect(stageTrackOffsetPercent(1, 4)).toBeCloseTo(-75, 10)
  })
})

describe('posición de las tarjetas', () => {
  it('al inicio la primera tarjeta está en el panel y el resto a la derecha', () => {
    const positions = [0, 1, 2, 3].map((index) => cardOffsetInPanels(index, 0, 4))

    expect(positions).toEqual([0, 1, 2, 3])
  })

  it('cada tarjeta llega al panel en su tramo del recorrido', () => {
    for (const index of [0, 1, 2, 3]) {
      expect(cardOffsetInPanels(index, index / 3, 4)).toBeCloseTo(0, 10)
    }
  })
})

