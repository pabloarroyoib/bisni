'use client'

import { useId, useState, type ReactNode } from 'react'
import { riskSections, type RiskContent, type RiskSub } from '@/lib/risk-insurance'

/**
 * Desplegable genérico. La altura se anima con CSS Grid: el panel pasa de
 * `grid-template-rows: 0fr` a `1fr` y el hijo tiene `min-height:0; overflow:hidden`,
 * así crece hasta su altura real sin medir nada con JavaScript. El panel cerrado
 * queda con `visibility:hidden` recién al terminar el cierre, para que salga del
 * orden de tabulación y de los lectores de pantalla sin cortar la animación.
 */
function RiskDisclosure({
  title,
  number,
  open,
  onToggle,
  nested = false,
  children,
}: {
  title: string
  number?: string
  open: boolean
  onToggle: () => void
  nested?: boolean
  children: ReactNode
}) {
  const uid = useId()
  // El título de la sección es h2, así que los niveles del acordeón bajan uno:
  // h3 para las áreas y h4 para las subsecciones.
  const Heading = nested ? 'h4' : 'h3'

  return (
    <div className={`risk-item${nested ? ' is-sub' : ''}${open ? ' is-open' : ''}`}>
      <Heading className="risk-heading">
        <button
          id={`${uid}-btn`}
          type="button"
          className="risk-trigger"
          aria-expanded={open}
          aria-controls={`${uid}-panel`}
          onClick={onToggle}
        >
          {number && <span className="risk-number">{number}</span>}
          <span className="risk-title">{title}</span>
          <span className="risk-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </Heading>

      <div id={`${uid}-panel`} role="region" aria-labelledby={`${uid}-btn`} className={`risk-panel${open ? ' is-open' : ''}`}>
        <div className="risk-panel-inner">
          <div className="risk-body">{children}</div>
        </div>
      </div>
    </div>
  )
}

function RiskContentBlock({ content }: { content: RiskContent }) {
  return (
    <>
      {content.paragraphs?.map((paragraph) => (
        <p className="risk-p" key={paragraph}>
          {paragraph}
        </p>
      ))}

      {content.label && <span className="risk-label">{content.label}</span>}

      {content.box && (
        <div className="risk-box">
          <b>{content.box.title}</b>
          {content.box.text}
        </div>
      )}

      {content.terms?.map((term) => (
        <div className="risk-term" key={term.name}>
          <b>{term.name}</b>
          {term.text}
          {term.note && <em className="risk-note">{term.note}</em>}
        </div>
      ))}

      {content.chips && (
        <div className="risk-chips">
          {content.chips.map((chip) => (
            <span className="risk-chip" key={chip}>
              {chip}
            </span>
          ))}
        </div>
      )}
    </>
  )
}

/** Subsección con estado propio: se abren y cierran sin afectarse entre sí. */
function RiskSubItem({ sub }: { sub: RiskSub }) {
  const [open, setOpen] = useState(false)

  return (
    <RiskDisclosure nested title={sub.title} open={open} onToggle={() => setOpen((value) => !value)}>
      <RiskContentBlock content={sub} />
    </RiskDisclosure>
  )
}

export function RiskAccordion() {
  // Primer nivel: se abre una sola área a la vez.
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="risk" id="riesgos" aria-labelledby="riesgos-titulo">
      <div className="risk-inner">
        <h2 id="riesgos-titulo">Riesgos y Seguros</h2>
        <p className="risk-intro">
          El Programa de Seguros es central para la gestión de riesgos, actúa principalmente en tres áreas.
        </p>

        {riskSections.map((section, index) => (
          <RiskDisclosure
            key={section.title}
            number={String(index + 1).padStart(2, '0')}
            title={section.title}
            open={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <RiskContentBlock content={section} />
            {section.subs?.map((sub) => (
              <RiskSubItem key={sub.title} sub={sub} />
            ))}
          </RiskDisclosure>
        ))}
      </div>
    </section>
  )
}
