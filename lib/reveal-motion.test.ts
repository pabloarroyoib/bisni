import { describe, expect, it } from 'vitest'
import {
  REDUCED_DURATION,
  REVEAL_DURATION,
  REVEAL_EASE,
  REVEAL_Y,
  hiddenState,
  revealTransition,
} from './reveal-motion'

describe('hiddenState', () => {
  it('arranca oculto y desplazado 30px en la variante por defecto', () => {
    expect(REVEAL_Y).toBe(30)
    expect(hiddenState('up')).toEqual({ opacity: 0, y: 30 })
  })

  it('en fade arranca solo con opacidad cero', () => {
    expect(hiddenState('fade')).toEqual({ opacity: 0 })
  })

  it('en scale arranca con zoom reducido', () => {
    expect(hiddenState('scale')).toEqual({ opacity: 0, scale: 0.94 })
  })

  it('no depende de la preferencia de movimiento (evita el error de hidratación)', () => {
    // La función solo depende de variant/y: servidor y cliente renderizan lo mismo.
    expect(hiddenState.length).toBe(1)
    expect(hiddenState('up')).toEqual(hiddenState('up'))
  })
})

describe('revealTransition', () => {
  it('usa la duración y curva de la referencia', () => {
    expect(REVEAL_DURATION).toBe(0.55)
    expect(REVEAL_EASE).toEqual([0.215, 0.61, 0.355, 1])
    expect(revealTransition(false, 0.2)).toEqual({
      duration: 0.55,
      delay: 0.2,
      ease: [0.215, 0.61, 0.355, 1],
    })
  })

  it('con movimiento reducido conserva el fundido y anula el desplazamiento', () => {
    expect(revealTransition(true, 0)).toEqual({
      opacity: { duration: REDUCED_DURATION, delay: 0, ease: REVEAL_EASE },
      y: { duration: 0 },
      scale: { duration: 0 },
    })
    expect(REDUCED_DURATION).toBe(0.4)
  })

  it('trata una preferencia desconocida (null) como sin reducción', () => {
    expect(revealTransition(null)).toMatchObject({ duration: REVEAL_DURATION })
  })
})
