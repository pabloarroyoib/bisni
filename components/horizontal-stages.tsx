'use client'

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { stageActiveIndex, stageTrackOffsetPercent } from '@/lib/stage-scroll'

type StageIconName = 'diagnostico' | 'diseno' | 'implementacion' | 'seguimiento'

/**
 * Iconos inline (sin librería de iconos): trazo sobre un viewBox de 24 unidades,
 * el tamaño final lo fija `.services-timeline-card-icon svg`.
 */
const STAGE_ICONS: Record<StageIconName, ReactNode> = {
  diagnostico: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20.5 20.5-4.7-4.7" />
    </>
  ),
  diseno: (
    <>
      <path d="M6.5 3.5H14l4.5 4.5v12.5h-12z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M9.5 12.5h5M9.5 16h3.5" />
    </>
  ),
  implementacion: (
    <>
      <path d="M12 3.5 5 6.5v5.2c0 4 2.9 7.4 7 8.8 4.1-1.4 7-4.8 7-8.8V6.5z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  seguimiento: (
    <>
      <path d="M20 12a8 8 0 1 1-2.5-5.8" />
      <path d="M20 4v4.5h-4.5" />
      <path d="m9.5 13.5 2 2 3.5-4" />
    </>
  ),
}

type Stage = {
  title: string
  text: string
  icon: StageIconName
}

/**
 * Programa de seguros en cuatro etapas. La tercera etapa original
 * ("Implementación y seguimiento") se separó en 03 y 04.
 */
const stages: Stage[] = [
  {
    title: 'Diagnóstico',
    icon: 'diagnostico',
    text: 'Nuestro equipo realiza un relevamiento donde recopilamos información detallada sobre las operaciones, activos y exposición a riesgos de la empresa. Analizamos los datos para identificar vulnerabilidades críticas y áreas de mejora. El resultado es un informe claro que sirve de base para diseñar la estrategia de seguros.',
  },
  {
    title: 'Diseño y propuesta',
    icon: 'diseno',
    text: 'Con base en el diagnóstico, elaboramos propuestas de seguros que reducen la exposición a pérdidas y aseguran la operatividad ante eventos adversos. Combinan coberturas de responsabilidad civil, daños materiales y riesgos de capital humano. Presentamos el plan al cliente, explicando beneficios, exclusiones y procesos de reclamación.',
  },
  {
    title: 'Implementación',
    icon: 'implementacion',
    text: 'Negociamos con las aseguradoras las condiciones de cada cobertura y gestionamos la emisión de las pólizas.',
  },
  {
    title: 'Seguimiento',
    icon: 'seguimiento',
    text: 'Junto a tu equipo definimos los plazos de revisión y los responsables de cada paso, para que el programa se mantenga vigente y ajustado a la realidad de la empresa a medida que cambia.',
  },
]

/**
 * Sección "Programa de seguros": cada etapa ocupa todo el ancho del panel y el scroll
 * vertical de la página pasa de una tarjeta a la siguiente deslizándolas en horizontal:
 * la que está en el panel sale por la izquierda y la siguiente entra por la derecha.
 *
 * El progreso del scroll pasa por un resorte (`useSpring`) antes de mover la tira. Así,
 * una muesca de rueda (100px) ya no se traduce en un salto de un frame, sino en un
 * desplazamiento con inercia al arrancar y al frenar. El scroll de la página es el
 * nativo: no hay listeners de `wheel` ni `preventDefault`.
 */
export function HorizontalStages() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  // Suavizado: el progreso persigue al scroll real con física de resorte.
  const progress = useSpring(scrollYProgress, { stiffness: 300, damping: 30, mass: 0.3 })

  // Todo se deriva del progreso suavizado. El porcentaje es del ancho de la tira (N paneles).
  const x = useTransform(progress, [0, 1], ['0%', `${stageTrackOffsetPercent(1, stages.length)}%`])

  // Solo se re-renderiza cuando cambia la etapa activa, no en cada frame.
  useMotionValueEvent(progress, 'change', (value) => {
    const next = stageActiveIndex(value, stages.length)
    setActive((current) => (current === next ? current : next))
  })

  return (
    <section
      className="services services-timeline"
      id="servicios"
      ref={sectionRef}
      style={{ '--stage-count': stages.length } as CSSProperties}
    >
      <div className="services-timeline-sticky">
        <div className="section-heading services-timeline-head">
          <div>
            <p className="section-kicker">Lo que hacemos</p>
            <h2>PROGRAMA DE SEGUROS</h2>
            <p className="services-timeline-label">ETAPAS</p>
          </div>
          <p className="section-intro">
            Es el plan de seguros diseñado para las necesidades específicas de protección integral y que se alinea con
            los objetivos estratégicos de tu empresa.
          </p>
        </div>

        {/* Decorativo: el estado real está en las tarjetas y en su numeración. */}
        <div className="services-timeline-progress" aria-hidden="true">
          <motion.span className="services-timeline-progress-fill" style={{ scaleX: progress }} />
          {stages.map((stage, index) => (
            <span
              className={`services-timeline-dot${index <= active ? ' is-filled' : ''}`}
              key={stage.title}
              style={{ left: `${(index / (stages.length - 1)) * 100}%` }}
            />
          ))}
        </div>

        {/* El recorte va en el viewport: la tira solo se ve dentro del panel. */}
        <div className="services-timeline-viewport">
          <motion.div className="services-timeline-track" style={{ x }}>
            {stages.map((stage, index) => (
              <article className="services-timeline-card" key={stage.title}>
                <div className="services-timeline-card-main">
                  <div className="services-timeline-card-top">
                    <span className="services-timeline-card-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="services-timeline-card-icon">
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {STAGE_ICONS[stage.icon]}
                      </svg>
                    </span>
                  </div>
                  <h3>{stage.title}</h3>
                </div>
                <p>{stage.text}</p>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
