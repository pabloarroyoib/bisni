/**
 * Textura de fondo: curvas de nivel, el mapa de relieve del riesgo.
 * Se genera de forma determinista (sin aleatoriedad) para que el HTML del
 * servidor y el del cliente coincidan y no haya desajustes de hidratación.
 * Puramente decorativo: sin JS, sin estado, oculto a lectores de pantalla.
 */

type PeakSeed = {
  /** Posición horizontal y vertical como fracción del viewBox. */
  fx: number
  fy: number
  r0: number
  rings: number
  step: number
  amp: number
  phase: number
}

type ViewBox = { w: number; h: number }

/**
 * Variante de página: el viewBox es alto porque el SVG cubre todo el documento.
 * Si se usara un viewBox bajo, `preserveAspectRatio="slice"` lo ampliaría
 * ~8x y las curvas quedarían desproporcionadas.
 */
const PAGE_VIEWBOX: ViewBox = { w: 1200, h: 3200 }
const PAGE_SEEDS: PeakSeed[] = [
  { fx: 0.21, fy: 0.07, r0: 34, rings: 9, step: 30, amp: 0.17, phase: 0.4 },
  { fx: 0.74, fy: 0.15, r0: 30, rings: 8, step: 28, amp: 0.15, phase: 2.1 },
  { fx: 0.5, fy: 0.27, r0: 40, rings: 9, step: 32, amp: 0.19, phase: 4.3 },
  { fx: 0.92, fy: 0.37, r0: 26, rings: 6, step: 26, amp: 0.14, phase: 1.2 },
  { fx: 0.16, fy: 0.48, r0: 36, rings: 8, step: 30, amp: 0.16, phase: 3.1 },
  { fx: 0.69, fy: 0.6, r0: 32, rings: 9, step: 30, amp: 0.18, phase: 5.2 },
  { fx: 0.37, fy: 0.73, r0: 28, rings: 7, step: 28, amp: 0.15, phase: 0.9 },
  { fx: 0.87, fy: 0.85, r0: 34, rings: 8, step: 30, amp: 0.17, phase: 2.7 },
  { fx: 0.13, fy: 0.94, r0: 30, rings: 7, step: 28, amp: 0.16, phase: 4.9 },
]

/** Variante de panel: se usa dentro de una sección concreta (contacto, fondo oscuro). */
const PANEL_VIEWBOX: ViewBox = { w: 1200, h: 700 }
const PANEL_SEEDS: PeakSeed[] = [
  { fx: 0.21, fy: 0.3, r0: 34, rings: 9, step: 30, amp: 0.17, phase: 0.4 },
  { fx: 0.73, fy: 0.21, r0: 30, rings: 8, step: 28, amp: 0.15, phase: 2.1 },
  { fx: 0.53, fy: 0.8, r0: 40, rings: 9, step: 32, amp: 0.19, phase: 4.3 },
  { fx: 0.91, fy: 0.74, r0: 26, rings: 6, step: 26, amp: 0.14, phase: 1.2 },
]

const SAMPLES = 128

/** Anillo cerrado con ondulación suave: se lee como una curva de nivel. */
function ringPath(seed: PeakSeed, viewBox: ViewBox, ring: number) {
  const cx = seed.fx * viewBox.w
  const cy = seed.fy * viewBox.h
  const radius = seed.r0 + ring * seed.step
  const points: string[] = []

  for (let i = 0; i < SAMPLES; i += 1) {
    const t = (i / SAMPLES) * Math.PI * 2
    const wobble =
      1 + seed.amp * Math.sin(3 * t + seed.phase + ring * 0.12) + seed.amp * 0.55 * Math.sin(5 * t + seed.phase * 1.7)
    const r = radius * wobble
    const x = cx + r * Math.cos(t)
    // Aplastado en vertical para que se lea como un terreno, no como círculos.
    const y = cy + r * Math.sin(t) * 0.7
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
  }

  return `M${points.join('L')}Z`
}

function buildLayers(seeds: PeakSeed[], viewBox: ViewBox) {
  const half = Math.ceil(seeds.length / 2)
  return {
    far: seeds.slice(half).flatMap((seed) => Array.from({ length: seed.rings }, (_, ring) => ringPath(seed, viewBox, ring))),
    near: seeds.slice(0, half).flatMap((seed) => Array.from({ length: seed.rings }, (_, ring) => ringPath(seed, viewBox, ring))),
  }
}

const PAGE_LAYERS = buildLayers(PAGE_SEEDS, PAGE_VIEWBOX)
const PANEL_LAYERS = buildLayers(PANEL_SEEDS, PANEL_VIEWBOX)

export function ContourField({ variant = 'page' }: { variant?: 'page' | 'panel' }) {
  const isPage = variant === 'page'
  const viewBox = isPage ? PAGE_VIEWBOX : PANEL_VIEWBOX
  const layers = isPage ? PAGE_LAYERS : PANEL_LAYERS

  return (
    <svg
      className={`contour-field contour-field-${variant}`}
      viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className="contour-layer contour-layer-far">
        {layers.far.map((d, i) => (
          <path d={d} key={`far-${i}`} />
        ))}
      </g>
      <g className="contour-layer contour-layer-near">
        {layers.near.map((d, i) => (
          <path d={d} key={`near-${i}`} />
        ))}
      </g>
    </svg>
  )
}
