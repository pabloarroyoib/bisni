'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
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

const services = [
  { icon: LockKeyhole, number: '01', title: 'Ciberseguridad & Protección de Datos', text: 'Auditorías, gestión de vulnerabilidades y seguridad ofensiva para proteger lo que más importa.' },
  { icon: BarChart3, number: '02', title: 'Riesgo Financiero & Operativo', text: 'Análisis de flujo de caja, continuidad del negocio y optimización de capital con visión de futuro.' },
  { icon: FileCheck2, number: '03', title: 'Cumplimiento ISO 31000', text: 'Marcos de gestión y cumplimiento normativo que convierten la complejidad en confianza.' },
]

const posts = [
  { category: 'Ciberseguridad', date: '12.06.24', read: '5 min', title: 'El riesgo silencioso de las cadenas de suministro digitales', excerpt: 'Por qué mapear dependencias es hoy una prioridad estratégica para los equipos de dirección.', accent: 'cyan', content: 'Las cadenas de suministro digitales son más extensas y complejas que nunca. Una dependencia aparentemente menor puede convertirse en un punto de entrada crítico. La respuesta no es frenar la innovación, sino ganar visibilidad: inventariar proveedores, clasificar accesos y probar escenarios de interrupción. En bisni ayudamos a los equipos a transformar ese mapa en decisiones accionables.' },
  { category: 'Finanzas', date: '04.06.24', read: '7 min', title: 'Liquidez resiliente: más allá del colchón de caja', excerpt: 'Una mirada práctica para proteger la operación cuando el entorno cambia rápido.', accent: 'navy', content: 'La resiliencia financiera no se mide solo por el efectivo disponible. También depende de la velocidad con la que una organización puede detectar señales, ajustar costes y activar alternativas de financiación. Un buen modelo conecta escenarios operativos con métricas financieras para que cada decisión llegue a tiempo.' },
  { category: 'Normativa', date: '28.05.24', read: '4 min', title: 'ISO 31000 en la práctica: del marco a la cultura', excerpt: 'Tres hábitos para hacer que la gestión de riesgo viva en el día a día.', accent: 'lime', content: 'Adoptar ISO 31000 no consiste en llenar más documentos. Consiste en integrar el riesgo en las conversaciones donde se decide el rumbo. Lenguaje común, responsables claros y revisiones breves convierten el marco en una capacidad real de la organización.' },
  { category: 'Estrategia', date: '16.05.24', read: '6 min', title: 'Decidir con claridad en tiempos de incertidumbre', excerpt: 'Cómo crear una brújula común cuando el futuro tiene demasiadas variables.', accent: 'orange', content: 'La incertidumbre no desaparece con más datos. Se gestiona mejor cuando se definen umbrales, señales tempranas y opciones de respuesta. Las organizaciones que deciden con claridad no predicen el futuro: están preparadas para varios futuros posibles.' },
]

const categories = ['Todos', 'Ciberseguridad', 'Finanzas', 'Normativa', 'Estrategia']
const probability = ['Remota', 'Improbable', 'Posible', 'Probable', 'Casi cierta']
const impact = ['Catastrófico', 'Mayor', 'Moderado', 'Menor', 'Insignificante']

function riskColor(score: number) {
  if (score >= 16) return 'risk-critical'
  if (score >= 10) return 'risk-high'
  if (score >= 5) return 'risk-medium'
  return 'risk-low'
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [industry, setIndustry] = useState('Tecnología')
  const [size, setSize] = useState('51–200')
  const [compliance, setCompliance] = useState('Medio')
  const [score, setScore] = useState<number | null>(null)
  const [selectedCell, setSelectedCell] = useState({ x: 3, y: 1 })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[number] | null>(null)

  const filteredPosts = useMemo(() => posts.filter((post) => (category === 'Todos' || post.category === category) && `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase())), [category, query])
  const selectedRisk = (selectedCell.x + 1) * (5 - selectedCell.y)
  const selectedLevel = selectedRisk >= 16 ? 'CRÍTICO' : selectedRisk >= 10 ? 'ALTO' : selectedRisk >= 5 ? 'MEDIO' : 'BAJO'

  function calculateScore() {
    const base = industry === 'Finanzas' ? 8 : industry === 'Salud' ? 7 : industry === 'Manufactura' ? 6 : 5
    const sizeValue = size === '+200' ? 3 : size === '51–200' ? 2 : 1
    const complianceValue = compliance === 'Bajo' ? 4 : compliance === 'Medio' ? 2 : 0
    setScore(Math.min(10, +(base + sizeValue + complianceValue) / 2).toFixed(1) as unknown as number)
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

      <section className="blog section" id="blog"><div className="section-heading"><div><p className="section-kicker">Perspectivas bisni</p><h2>Ideas para navegar<br /><em>lo que viene.</em></h2></div><a className="text-link" href="#contacto">Ver todos los artículos <ArrowUpRight aria-hidden="true" /></a></div><div className="blog-controls"><label className="search-box"><Search aria-hidden="true" /><input placeholder="Buscar artículos..." value={query} onChange={(e) => setQuery(e.target.value)} /></label><div className="category-filters">{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="post-grid">{filteredPosts.map((post) => <article className="post-card" key={post.title} onClick={() => setSelectedPost(post)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedPost(post)}><div className={`post-art ${post.accent}`}><span className="post-art-mark">{post.category === 'Ciberseguridad' ? <ShieldCheck /> : post.category === 'Finanzas' ? <BarChart3 /> : post.category === 'Normativa' ? <FileCheck2 /> : <Sparkles />}</span><span className="post-art-grid" /></div><div className="post-meta"><span>{post.category}</span><span>{post.date} · {post.read}</span></div><h3>{post.title}</h3><p>{post.excerpt}</p><button>Leer artículo <ArrowUpRight aria-hidden="true" /></button></article>)}</div></section>

      <section className="contact section" id="contacto"><div className="contact-copy"><p className="section-kicker">Hablemos</p><h2>El próximo movimiento<br /><em>empieza aquí.</em></h2><p>Cuéntanos qué te preocupa. Te ayudaremos a ponerle nombre, contexto y un plan.</p><div className="contact-details"><div><MapPin /><span>Calle Serrano 55<br />28006 Madrid</span></div><div><Mail /><span>hola@bisni.es</span></div><div><Globe2 /><span>+34 910 123 456</span></div></div></div><form className="contact-form" onSubmit={(e) => e.preventDefault()}><div className="form-row"><label>Tu nombre<input required placeholder="Nombre y apellidos" /></label><label>Empresa<input required placeholder="Nombre de empresa" /></label></div><label>Email corporativo<input required type="email" placeholder="tu@empresa.com" /></label><label>¿En qué podemos ayudarte?<textarea required placeholder="Cuéntanos brevemente tu reto..." rows={4} /></label><button className="button button-primary" type="submit">Enviar consulta <ArrowUpRight aria-hidden="true" /></button><p className="privacy-note"><Check aria-hidden="true" /> Respetamos tu privacidad. Nunca compartiremos tus datos.</p></form></section>

      <footer className="footer"><div className="footer-main"><div><a className="brand footer-brand" href="#inicio"><span className="brand-mark">b</span>bisni<span className="brand-dot">.</span></a><p>Riesgo claro.<br />Decisiones sólidas.</p></div><div className="footer-links"><div><strong>Explora</strong><a href="#servicios">Servicios</a><a href="#herramientas">Herramientas</a><a href="#blog">Perspectivas</a></div><div><strong>Empresa</strong><a href="#contacto">Contacto</a><a href="#contacto">Sobre bisni</a><a href="#contacto">Trabaja con nosotros</a></div><div><strong>Legal</strong><a href="#contacto">Aviso legal</a><a href="#contacto">Privacidad</a><a href="#contacto">Cookies</a></div></div></div><div className="footer-bottom"><span>© 2024 bisni. Protegiendo tu futuro corporativo.</span><span className="socials"><a href="#contacto" aria-label="LinkedIn"><Globe2 /></a><a href="#contacto" aria-label="Email"><Mail /></a></span><span>Hecho con intención <span className="brand-dot">●</span></span></div></footer>

      {selectedPost && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedPost(null)}><article className="article-modal" role="dialog" aria-modal="true" aria-labelledby="article-title" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedPost(null)} aria-label="Cerrar artículo"><X /></button><div className={`post-art ${selectedPost.accent}`}><span className="post-art-mark"><Sparkles /></span><span className="post-art-grid" /></div><div className="modal-content"><div className="post-meta"><span>{selectedPost.category}</span><span>{selectedPost.date} · {selectedPost.read}</span></div><h2 id="article-title">{selectedPost.title}</h2><p className="article-lead">{selectedPost.excerpt}</p><p>{selectedPost.content}</p><p>En bisni combinamos análisis, experiencia y una visión práctica para que cada riesgo tenga una respuesta proporcional y medible. Si este tema te interesa, <a href="#contacto" onClick={() => setSelectedPost(null)}>hablemos</a>.</p></div></article></div>}
    </main>
  )
}
