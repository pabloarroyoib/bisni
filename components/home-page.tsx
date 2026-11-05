'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { ContactForm } from '@/components/contact-form'
import { NewsletterForm } from '@/components/newsletter-form'
import { SiteHeader } from '@/components/site-header'
import { CONTACT_EMAIL, gmailComposeUrl, mailtoHref } from '@/lib/email'
import type { BlogPost } from '@/lib/blog'
import type { ReactNode } from 'react'

const services = [
  { icon: LockKeyhole, number: '01', title: 'Ciberseguridad & Protección de Datos', text: 'Auditorías, gestión de vulnerabilidades y seguridad ofensiva para proteger lo que más importa.' },
  { icon: BarChart3, number: '02', title: 'Riesgo Financiero & Operativo', text: 'Análisis de flujo de caja, continuidad del negocio y optimización de capital con visión de futuro.' },
  { icon: FileCheck2, number: '03', title: 'Cumplimiento ISO 31000', text: 'Marcos de gestión y cumplimiento normativo que convierten la complejidad en confianza.' }
]

const probability = ['Remota', 'Improbable', 'Posible', 'Probable', 'Casi cierta']
const impact = ['Catastrófico', 'Mayor', 'Moderado', 'Menor', 'Insignificante']

function riskColor(score: number) {
  if (score >= 16) return 'risk-critical'
  if (score >= 10) return 'risk-high'
  if (score >= 5) return 'risk-medium'
  return 'risk-low'
}

function categoryIcon(category: string) {
  if (category === 'Ciberseguridad') return ShieldCheck
  if (category === 'Finanzas') return BarChart3
  if (category === 'Normativa') return FileCheck2
  return Sparkles
}

type HomePageProps = {
  posts: BlogPost[]
  categories: string[]
  /** Textura "Relieve" de página completa, ya renderizada en el servidor. */
  background: ReactNode
  /** Textura "Relieve" de la sección de contacto (variante oscura). */
  contactBackground: ReactNode
  /** Pie compartido, ya renderizado en el servidor. */
  footer: ReactNode
}

export function HomePage({ posts, categories, background, contactBackground, footer }: HomePageProps) {
  const [industry, setIndustry] = useState('Tecnología')
  const [size, setSize] = useState('51–200')
  const [compliance, setCompliance] = useState('Medio')
  const [score, setScore] = useState<number | null>(null)
  const [selectedCell, setSelectedCell] = useState({ x: 3, y: 1 })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          (category === 'Todos' || post.categories.includes(category)) &&
          `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, posts, query],
  )
  const selectedRisk = (selectedCell.x + 1) * (5 - selectedCell.y)
  const selectedLevel = selectedRisk >= 16 ? 'CRÍTICO' : selectedRisk >= 10 ? 'ALTO' : selectedRisk >= 5 ? 'MEDIO' : 'BAJO'

  function calculateScore() {
    const base = industry === 'Finanzas' ? 8 : industry === 'Salud' ? 7 : industry === 'Manufactura' ? 6 : 5
    const sizeValue = size === '+200' ? 3 : size === '51–200' ? 2 : 1
    const complianceValue = compliance === 'Bajo' ? 4 : compliance === 'Medio' ? 2 : 0
    setScore(Number(Math.min(10, (base + sizeValue + complianceValue) / 2).toFixed(1)))
  }

  return (
    <main className="site-shell">
      <SiteHeader />

      {background}
      <span id="contenido" tabIndex={-1} />

      <section className="hero" id="inicio">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>Protegemos lo que hace avanzar tu negocio.</h1>
            <p className="hero-copy">Estrategia, datos y tecnología para anticipar riesgos, proteger tus activos y convertir la incertidumbre en una ventaja competitiva.</p>
            <div className="hero-actions"><a className="button button-primary" href="#servicios">Ver soluciones <ArrowUpRight aria-hidden="true" /></a><a className="button button-ghost" href="#herramientas">Probar matriz interactiva <ChevronRight aria-hidden="true" /></a></div>
            <div className="hero-proof"><div className="avatar-stack"><span>LM</span><span>AG</span><span>JR</span></div><p><strong>+120 empresas</strong><br />ya confían en bisni</p></div>
          </div>
          <aside className="hero-panel" aria-label="Ejemplo de panorama de riesgo">
            <div className="hero-panel-head"><span>Panorama de riesgo</span><small>Datos ilustrativos</small></div>
            <ul className="hero-panel-rows">
              <li><span className="hero-panel-label">Ciberseguridad</span><span className="meter meter-watch"><i /></span><b>Medio</b></li>
              <li><span className="hero-panel-label">Cumplimiento ISO 31000</span><span className="meter meter-ok"><i /></span><b>Alto</b></li>
              <li><span className="hero-panel-label">Continuidad operativa</span><span className="meter meter-low"><i /></span><b>Bajo</b></li>
            </ul>
            <div className="hero-panel-foot"><span>Índice de exposición</span><strong>7.2<small>/10</small></strong></div>
          </aside>
        </div>
      </section>

      <section className="services section" id="servicios"><div className="section-heading"><div><p className="section-kicker">Lo que hacemos</p><h2>El riesgo no se elimina.<br /><em>Se gestiona mejor.</em></h2></div><p className="section-intro">Una visión 360° para que puedas tomar decisiones con confianza, incluso cuando el entorno cambia.</p></div><div className="service-grid">{services.map(({ icon: Icon, number, title, text }) => <article className="service-card" key={title}><div className="card-top"><span className="service-icon"><Icon aria-hidden="true" /></span><span className="service-number">{number}</span></div><h3>{title}</h3><p>{text}</p><a href="#contacto">Saber más <ArrowUpRight aria-hidden="true" /></a></article>)}</div></section>

      <section className="tools-section section" id="herramientas"><div className="section-heading tools-heading"><div><p className="section-kicker">Herramientas interactivas</p><h2>Un primer paso<br /><em>hacia la claridad.</em></h2></div><p className="section-intro">Evalúa tu nivel de exposición en minutos y descubre dónde centrar tu atención.</p></div><div className="tools-grid"><div className="calculator panel"><div className="panel-heading"><span className="panel-icon"><Zap aria-hidden="true" /></span><div><h3>Calculadora de riesgo</h3><p>Diagnóstico preliminar</p></div><span className="step-count">01 / 02</span></div><div className="form-grid"><label>Industria<select value={industry} onChange={(e) => setIndustry(e.target.value)}><option>Tecnología</option><option>Finanzas</option><option>Salud</option><option>Manufactura</option></select><ChevronDown aria-hidden="true" /></label><label>Tamaño de empresa<select value={size} onChange={(e) => setSize(e.target.value)}><option>1–50</option><option>51–200</option><option>+200</option></select><ChevronDown aria-hidden="true" /></label><label>Nivel de cumplimiento<select value={compliance} onChange={(e) => setCompliance(e.target.value)}><option>Bajo</option><option>Medio</option><option>Alto</option></select><ChevronDown aria-hidden="true" /></label></div><button className="button button-dark" onClick={calculateScore}>Calcular mi puntuación <ArrowUpRight aria-hidden="true" /></button><div className="score-result">{score === null ? <><span className="result-placeholder">—</span><div><strong>Completa el diagnóstico</strong><p>Tu puntuación aparecerá aquí</p></div></> : <><span className="score-number">{score}</span><div><strong>{score >= 7 ? 'Riesgo medio-alto' : 'Riesgo moderado'}</strong><p>{score >= 7 ? 'Recomendamos revisar tus controles críticos.' : 'Una base sólida, con margen de mejora.'}</p></div></>}</div></div><div className="matrix panel" id="matriz"><div className="panel-heading"><span className="panel-icon"><Network aria-hidden="true" /></span><div><h3>Matriz de riesgo</h3><p>ISO 31000 · 5 × 5</p></div><span className="step-count">INTERACTIVA</span></div><div className="matrix-layout"><span className="axis-caption-y">Impacto</span><div className="y-axis">{impact.map((item) => <small key={item}>{item}</small>)}</div><div className="matrix-main"><div className="cells">{impact.map((_, y) => probability.map((_, x) => <button aria-label={`Probabilidad ${probability[x]}, impacto ${impact[y]}`} className={`risk-cell ${riskColor((x + 1) * (5 - y))} ${selectedCell.x === x && selectedCell.y === y ? 'selected' : ''}`} key={`${x}-${y}`} onClick={() => setSelectedCell({ x, y })} />))}</div><div className="x-axis">{probability.map((item) => <small key={item}>{item}</small>)}</div><div className="matrix-caption">Probabilidad</div></div></div><div className="risk-detail"><span className={`risk-dot ${riskColor(selectedRisk)}`} /><p><strong>Probabilidad {probability[selectedCell.x]} e impacto {impact[selectedCell.y]}</strong><br /><span>Nivel <b>{selectedLevel}</b> · Selecciona otra celda para explorar</span></p></div></div></div></section>

      <section className="blog section" id="blog">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Perspectivas bisni</p>
            <h2>Ideas para navegar<br /><em>lo que viene.</em></h2>
          </div>
        </div>
        <div className="blog-controls">
          <label className="search-box">
            <Search aria-hidden="true" />
            <span className="sr-only">Buscar artículos</span>
            <input
              type="search"
              placeholder="Buscar artículos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="category-filters">
            {categories.map((item) => (
              <button
                className={category === item ? 'active' : ''}
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {filteredPosts.length === 0 ? (
          <p className="blog-empty">
            {posts.length === 0
              ? 'Aún no hay artículos publicados. Cuando publiques un artículo en el Studio, aparecerá aquí.'
              : 'No hay artículos que coincidan con tu búsqueda.'}
          </p>
        ) : (
          <div className="post-grid">
            {filteredPosts.map((post) => {
              const Icon = categoryIcon(post.categories[0])
              return (
                <Link
                  className="post-card"
                  key={post._id}
                  href={`/blog/${post.slug}`}
                >
                  <div className={`post-art ${post.imageUrl ? 'has-image' : post.accent}`}>
                    {post.imageUrl ? (
                      <Image
                        className="post-cover"
                        src={post.imageUrl}
                        alt={post.imageAlt}
                        fill
                        sizes="(max-width: 650px) 50vw, (max-width: 900px) 50vw, 25vw"
                      />
                    ) : (
                      <span className="post-art-mark"><Icon aria-hidden="true" /></span>
                    )}
                  </div>
                  <div className="post-meta">
                    <span>{post.categories.join(' · ')}</span>
                    <span>{[post.date, post.read].filter(Boolean).join(' · ')}</span>
                  </div>
                  <h3>{post.title}</h3>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                  <span className="post-card-cta">Leer artículo <ArrowUpRight aria-hidden="true" /></span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="newsletter section" id="newsletter">
        <div className="newsletter-copy">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Newsletter</p>
              <h2>Una idea útil,<br /><em>una vez al mes.</em></h2>
            </div>
          </div>
          <p className="section-intro">Riesgo, ciberseguridad y cumplimiento. Un correo al mes, sin ruido y sin spam.</p>
        </div>
        <div className="newsletter-action">
          <NewsletterForm />
          <p className="newsletter-bridge">¿Buscas resolver un caso concreto? <a href="#contacto">Hablemos</a></p>
        </div>
      </section>

      <section className="contact section" id="contacto">{contactBackground}<div className="contact-copy"><p className="section-kicker">Hablemos</p><h2>El próximo movimiento<br /><em>empieza aquí.</em></h2><p>Cuéntanos qué te preocupa. Te ayudaremos a ponerle nombre, contexto y un plan.</p><div className="contact-details"><div><MapPin aria-hidden="true" /><span>Calle Serrano 55<br />28006 Madrid</span></div><div><Mail aria-hidden="true" /><span><a href={mailtoHref()}>{CONTACT_EMAIL}</a><a className="mail-alt" href={gmailComposeUrl()} target="_blank" rel="noopener noreferrer">o abrir en Gmail</a></span></div><div><Globe2 aria-hidden="true" /><span>+34 910 123 456</span></div></div></div><ContactForm /></section>

      {footer}
    </main>
  )
}
