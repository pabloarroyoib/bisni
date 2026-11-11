'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { stageTrackOffsetPercent } from '@/lib/stage-scroll'
import { Reveal } from '@/components/reveal'


type StageIconName = 'diagnostico' | 'diseno' | 'seguimiento'

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
 * Programa de seguros en tres etapas: la implementación y el seguimiento van
 * juntos porque forman un solo tramo de trabajo (emitir las pólizas y mantenerlas
 * vigentes). El ancho de la tira y el desplazamiento salen de `stages.length`, así
 * que agregar o quitar etapas no requiere tocar el CSS.
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
    title: 'Implementación y seguimiento',
    icon: 'seguimiento',
    text: 'Negociamos con las aseguradoras las condiciones de cada cobertura y gestionamos la emisión de las pólizas. Junto a tu equipo definimos los plazos de revisión y los responsables de cada paso, para que el programa se mantenga vigente y ajustado a la realidad de la empresa a medida que cambia.',
  },
]
/**
 * Sección "Programa de seguros": las tres etapas van en una fila horizontal y se
 * pasa de una a otra con los botones de anterior/siguiente (y los puntos), sin
 * scroll. Antes la sección medía una pantalla por etapa y el scroll vertical movía
 * la tira: para atravesarla había que scrollear varias pantallas. Ahora mide lo que
 * mide su contenido y el avance es explícito.
 *
 * El desplazamiento es solo un `transform` sobre la tira, con transición CSS: no hay
 * listeners de scroll ni intercepción de la rueda, y la página sigue scrolleando de
 * forma nativa.
 */
export function HorizontalStages() {
  const total = stages.length
  const [index, setIndex] = useState(0)

  const atStart = index === 0
  const atEnd = index === total - 1
  // Progreso 0..1 del recorrido entre la primera y la última etapa.
  const progress = index / (total - 1)

  return (
    <section
      className="services services-timeline"
      id="servicios"
      style={{ '--stage-count': total } as CSSProperties}
    >
      <Reveal className="section-heading services-timeline-head">
        <div>
          <p className="section-kicker">Lo que hacemos</p>
          <h2>PROGRAMA DE SEGUROS</h2>
          <p className="services-timeline-label">ETAPAS</p>
        </div>
        <p className="section-intro">
          Es el plan de seguros diseñado para las necesidades específicas de protección integral y que se alinea con
          los objetivos estratégicos de tu empresa.
        </p>
      </Reveal>

      <div className="services-timeline-progress">
        <span className="services-timeline-progress-fill" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
        {stages.map((stage, dotIndex) => (
          <button
            key={stage.title}
            type="button"
            className={`services-timeline-dot${dotIndex <= index ? ' is-filled' : ''}`}
            style={{ left: `${(dotIndex / (total - 1)) * 100}%` }}
            aria-label={`Ir a la etapa ${dotIndex + 1}: ${stage.title}`}
            aria-current={dotIndex === index}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>

      <div className="services-timeline-viewport">
        <div
          className="services-timeline-track"
          style={{ transform: `translate3d(${stageTrackOffsetPercent(progress, total)}%, 0, 0)` }}
        >
          {stages.map((stage, cardIndex) => (
            <article
              className={`services-timeline-card${cardIndex === index ? ' is-current' : ''}`}
              key={stage.title}
              aria-hidden={cardIndex !== index}
            >
              <div className="services-timeline-card-main">
                <div className="services-timeline-card-top">
                  <span className="services-timeline-card-number">{String(cardIndex + 1).padStart(2, '0')}</span>
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
        </div>

        <div className="services-timeline-navs">
          <button
            type="button"
            className="services-timeline-nav is-prev"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={atStart}
            aria-label="Etapa anterior"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="services-timeline-nav is-next"
            onClick={() => setIndex((value) => Math.min(total - 1, value + 1))}
            disabled={atEnd}
            aria-label="Etapa siguiente"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Anuncia el cambio de etapa sin ocupar espacio en pantalla. */}
      <p className="sr-only" aria-live="polite">
        Etapa {index + 1} de {total}: {stages[index].title}
      </p>
    </section>
  )
}
