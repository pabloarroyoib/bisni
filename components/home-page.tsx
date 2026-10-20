'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { PostBody } from '@/components/post-body'
import type { BlogPost } from '@/lib/blog'

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
}

export function HomePage({ posts, categories }: HomePageProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
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
          (category === 'Todos' || post.category === category) &&
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
      <header className="navbar">
        <a className="brand" href="#inicio" aria-label="bisni inicio"><span className="brand-mark">b</span>bisni<span className="brand-dot">.</span></a>
        <nav className={`nav-links ${mobileOpen ? 'is-open' : ''}`}>
          {['Servicios', 'Herramientas', 'Matriz', 'Blog', 'Contacto'].map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}>{item}</a>)}
        </nav>
        <a className="nav-cta" href="#contacto">Solicitar diagnóstico <ArrowUpRight aria-hidden="true" /></a>
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú">{mobileOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-one" aria-hidden="true" /><div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow"><span className="eyebrow-line" /> Gestión de riesgo, hecha clara</div>
          <h1>Protegemos lo que<br /><em>hace avanzar</em> tu negocio.</h1>
          <p className="hero-copy">Estrategia, datos y tecnología para anticipar riesgos, proteger tus activos y convertir la incertidumbre en una ventaja competitiva.</p>
          <div className="hero-actions"><a className="button button-primary" href="#servicios">Ver soluciones <ArrowUpRight aria-hidden="true" /></a><a className="button button-ghost" href="#herramientas">Probar matriz interactiva <ChevronRight aria-hidden="true" /></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>LM</span><span>AG</span><span>JR</span></div><p><strong>+120 empresas</strong><br />ya confían en bisni</p></div>
        </div>
        <div className="scroll-note"><span>01</span><i /> Desplaza para explorar</div>
      </section>

      <section className="services section" id="servicios"><div className="section-heading"><div><p className="section-kicker">Lo que hacemos</p><h2>El riesgo no se elimina.<br /><em>Se gestiona mejor.</em></h2></div><p className="section-intro">Una visión 360° para que puedas tomar decisiones con confianza, incluso cuando el entorno cambia.</p></div><div className="service-grid">{services.map(({ icon: Icon, number, title, text }) => <article className="service-card" key={title}><div className="card-top"><span className="service-icon"><Icon aria-hidden="true" /></span><span className="service-number">{number}</span></div><h3>{title}</h3><p>{text}</p><a href="#contacto">Saber más <ArrowUpRight aria-hidden="true" /></a></article>)}</div></section>

      <section className="tools-section section" id="herramientas"><div className="section-heading tools-heading"><div><p className="section-kicker">Herramientas interactivas</p><h2>Un primer paso<br /><em>hacia la claridad.</em></h2></div><p className="section-intro">Evalúa tu nivel de exposición en minutos y descubre dónde centrar tu atención.</p></div><div className="tools-grid"><div className="calculator panel"><div className="panel-heading"><span className="panel-icon"><Zap aria-hidden="true" /></span><div><h3>Calculadora de riesgo</h3><p>Diagnóstico preliminar</p></div><span className="step-count">01 / 02</span></div><div className="form-grid"><label>Industria<select value={industry} onChange={(e) => setIndustry(e.target.value)}><option>Tecnología</option><option>Finanzas</option><option>Salud</option><option>Manufactura</option></select><ChevronDown /></label><label>Tamaño de empresa<select value={size} onChange={(e) => setSize(e.target.value)}><option>1–50</option><option>51–200</option><option>+200</option></select><ChevronDown /></label><label>Nivel de cumplimiento<select value={compliance} onChange={(e) => setCompliance(e.target.value)}><option>Bajo</option><option>Medio</option><option>Alto</option></select><ChevronDown /></label></div><button className="button button-dark" onClick={calculateScore}>Calcular mi puntuación <ArrowUpRight aria-hidden="true" /></button><div className="score-result">{score === null ? <><span className="result-placeholder">—</span><div><strong>Completa el diagnóstico</strong><p>Tu puntuación aparecerá aquí</p></div></> : <><span className="score-number">{score}</span><div><strong>{score >= 7 ? 'Riesgo medio-alto' : 'Riesgo moderado'}</strong><p>{score >= 7 ? 'Recomendamos revisar tus controles críticos.' : 'Una base sólida, con margen de mejora.'}</p></div></>}<span className="score-ring" /></div></div><div className="matrix panel" id="matriz"><div className="panel-heading"><span className="panel-icon"><Network aria-hidden="true" /></span><div><h3>Matriz de riesgo</h3><p>ISO 31000 · 5 × 5</p></div><span className="step-count">INTERACTIVA</span></div><div className="matrix-layout"><div className="y-axis"><span>Impacto</span>{impact.map((item) => <small key={item}>{item}</small>)}</div><div className="matrix-main"><div className="cells">{impact.map((_, y) => probability.map((_, x) => <button aria-label={`Probabilidad ${probability[x]}, impacto ${impact[y]}`} className={`risk-cell ${riskColor((x + 1) * (5 - y))} ${selectedCell.x === x && selectedCell.y === y ? 'selected' : ''}`} key={`${x}-${y}`} onClick={() => setSelectedCell({ x, y })} />))}</div><div className="x-axis">{probability.map((item) => <small key={item}>{item}</small>)}</div><div className="matrix-caption">Probabilidad</div></div></div><div className="risk-detail"><span className={`risk-dot ${riskColor(selectedRisk)}`} /><p><strong>Probabilidad {probability[selectedCell.x]} e impacto {impact[selectedCell.y]}</strong><br /><span>Nivel <b>{selectedLevel}</b> · Selecciona otra celda para explorar</span></p></div></div></div></section>

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
            <input placeholder="Buscar artículos..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="category-filters">
            {categories.map((item) => (
              <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>
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
              const Icon = categoryIcon(post.category)
              return (
                <a
                  className="post-card"
                  key={post._id}
                  href={`/blog/${post.slug}`}
                >
                  <div className={`post-art ${post.imageUrl ? 'has-image' : post.accent}`}>
                    {post.imageUrl ? (
                      <img className="post-cover" src={post.imageUrl} alt={post.imageAlt} />
                    ) : (
                      <>
                        <span className="post-art-mark"><Icon /></span>
                        <span className="post-art-grid" />
                      </>
                    )}
                  </div>
                  <div className="post-meta">
                    <span>{post.category}</span>
                    <span>{[post.date, post.read].filter(Boolean).join(' · ')}</span>
                  </div>
                  <h3>{post.title}</h3>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                  <button>Leer artículo <ArrowUpRight aria-hidden="true" /></button>
                </a>
              )
            })}
          </div>
        )}
      </section>

      <section className="contact section" id="contacto"><div className="contact-copy"><p className="section-kicker">Hablemos</p><h2>El próximo movimiento<br /><em>empieza aquí.</em></h2><p>Cuéntanos qué te preocupa. Te ayudaremos a ponerle nombre, contexto y un plan.</p><div className="contact-details"><div><MapPin /><span>Calle Serrano 55<br />28006 Madrid</span></div><div><Mail /><span>hola@bisni.es</span></div><div><Globe2 /><span>+34 910 123 456</span></div></div></div><form className="contact-form" onSubmit={(e) => e.preventDefault()}><div className="form-row"><label>Tu nombre<input required placeholder="Nombre y apellidos" /></label><label>Empresa<input required placeholder="Nombre de empresa" /></label></div><label>Email corporativo<input required type="email" placeholder="tu@empresa.com" /></label><label>¿En qué podemos ayudarte?<textarea required placeholder="Cuéntanos brevemente tu reto..." rows={4} /></label><button className="button button-primary" type="submit">Enviar consulta <ArrowUpRight aria-hidden="true" /></button><p className="privacy-note"><Check aria-hidden="true" /> Respetamos tu privacidad. Nunca compartiremos tus datos.</p></form></section>

      <footer className="footer"><div className="footer-main"><div><a className="brand footer-brand" href="#inicio"><span className="brand-mark">b</span>bisni<span className="brand-dot">.</span></a><p>Riesgo claro.<br />Decisiones sólidas.</p></div><div className="footer-links"><div><strong>Explora</strong><a href="#servicios">Servicios</a><a href="#herramientas">Herramientas</a><a href="#blog">Perspectivas</a></div><div><strong>Empresa</strong><a href="#contacto">Contacto</a><a href="#contacto">Sobre bisni</a><a href="#contacto">Trabaja con nosotros</a></div><div><strong>Legal</strong><a href="#contacto">Aviso legal</a><a href="#contacto">Privacidad</a><a href="#contacto">Cookies</a></div></div></div><div className="footer-bottom"><span>© 2026 bisni. Protegiendo tu futuro corporativo.</span><span className="socials"><a href="#contacto" aria-label="LinkedIn"><Globe2 /></a><a href="#contacto" aria-label="Email"><Mail /></a></span><span>Hecho con intención <span className="brand-dot">●</span></span></div></footer>
    </main>
  )
}
