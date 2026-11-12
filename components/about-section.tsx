'use client'

import Image from 'next/image'
import { useEffect, useState, type CSSProperties } from 'react'
import { MultilineText } from '@/components/multiline-text'
import { Reveal } from '@/components/reveal'
import type { AboutContent } from '@/lib/home-content'

/**
 * Tres marcos fijos en pantalla: el frontal nítido y dos detrás, más chicos y
 * difuminados. Las posiciones no cambian nunca; lo único que cambia son las clases
 * de las capas que están dentro de cada marco.
 */
const FRAMES = [
  { x: '-8%', y: '2%', scale: 1, blur: 0, opacity: 1, zIndex: 3 },
  { x: '8%', y: '-5%', scale: 0.88, blur: 2, opacity: 0.95, zIndex: 2 },
  { x: '24%', y: '-12%', scale: 0.76, blur: 5, opacity: 0.8, zIndex: 1 },
]

const ROTATION_MS = 4000

export function AboutSection({ content }: { content: AboutContent }) {
  const { slides } = content
  const total = slides.length
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  // setTimeout dependiente de `current`: al elegir un punto, el temporizador se
  // reinicia solo porque el efecto se vuelve a montar.
  useEffect(() => {
    if (paused) {
      return
    }

    const id = window.setTimeout(() => setCurrent((value) => (value + 1) % total), ROTATION_MS)

    return () => window.clearTimeout(id)
  }, [current, paused, total])

  return (
    <section className="about" id="nosotros" aria-labelledby="nosotros-titulo">
      <div
        className="about-visual"
        role="group"
        aria-label="Imágenes de Nosotros"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="about-stage">
          {FRAMES.map((frame, frameIndex) => {
            // Este marco muestra la imagen `current + frameIndex`.
            const target = (current + frameIndex) % total
            // La que acaba de salir queda debajo mientras dura el fundido: así
            // nunca se ve el fondo vacío entre una imagen y la siguiente.
            const previous = (target - 1 + total) % total
            const isFront = frameIndex === 0

            return (
              <figure
                key={frameIndex}
                className="about-frame"
                aria-hidden={!isFront}
                style={
                  {
                    '--frame-x': frame.x,
                    '--frame-y': frame.y,
                    '--frame-s': frame.scale,
                    filter: frame.blur > 0 ? `blur(${frame.blur}px)` : undefined,
                    opacity: frame.opacity,
                    zIndex: frame.zIndex,
                  } as CSSProperties
                }
              >
                <div className="about-frame-inner">
                  {/* Las tres imágenes quedan montadas: el cambio es solo de clases. */}
                  {slides.map((slide, index) => {
                    const state = index === target ? 'on' : index === previous ? 'prev' : ''

                    return (
                      <div
                        key={`${index}-${slide.src}`}
                        className={`about-layer about-layer-${slide.isLogo ? 'logo' : 'photo'}${state ? ` is-${state}` : ''}`}
                      >
                        <Image
                          src={slide.src}
                          alt={isFront && index === target ? slide.alt : ''}
                          fill
                          sizes="(max-width: 900px) 72vw, 30vw"
                          priority={isFront && index === 0}
                          className="about-image"
                          style={slide.isLogo ? { objectFit: 'contain', padding: `${slide.pad ?? 14}%` } : undefined}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Subtítulos: solo en el marco frontal, en capas que no se superponen. */}
                {isFront && (
                  <figcaption className="about-captions">
                    {slides.map((slide, index) => (
                      <div key={`${index}-${slide.src}`} className={`about-caption${index === current ? ' is-on' : ''}`}>
                        <b>{slide.title}</b>
                      </div>
                    ))}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>

        <div className="about-dots">
          {slides.map((slide, index) => (
            <button
              key={`${index}-${slide.src}`}
              type="button"
              className={`about-dot${index === current ? ' is-current' : ''}`}
              aria-label={`Ir a la imagen ${index + 1} de ${total}`}
              aria-current={index === current}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>

      <div className="about-content">
        <Reveal>
          <p className="section-kicker">{content.kicker}</p>
        </Reveal>
        <Reveal>
          <h2 id="nosotros-titulo">
            <MultilineText text={content.title} />
          </h2>
        </Reveal>
        <Reveal className="about-mission-copy-reveal">
          <p className="about-mission-copy">{content.mission}</p>
        </Reveal>
        <Reveal className="about-cta-reveal">
          <a className="button button-primary about-cta" href={content.cta.href}>
            {content.cta.label}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
