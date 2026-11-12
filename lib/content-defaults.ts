import { CONTACT_EMAIL, mailtoHref } from './email'
import { riskSections } from './risk-insurance'
import type { HomeContent } from './home-content'

/**
 * Textos actuales de la home. Son el fallback del sitio: si el documento
 * `homePage` no existe (o una sección todavía no se publicó), se renderiza esto.
 * Al editar el contenido en el Studio, estos valores dejan de verse pero siguen
 * siendo la red de seguridad.
 */
export const defaultHomeContent: HomeContent = {
  nav: [
    { label: 'Inicio', href: '#inicio', variant: 'link' },
    { label: 'Servicios', href: '#servicios', variant: 'link' },
    { label: 'Nosotros', href: '#nosotros', variant: 'link' },
    { label: 'Blog', href: '/blog', variant: 'link' },
    { label: 'Contacto', href: '#contacto', variant: 'link' },
    { label: 'Suscribirse', href: '#newsletter', variant: 'button' },
  ],
  navSocials: [
    { network: 'linkedin', href: 'https://www.linkedin.com/company/145421807/' },
    { network: 'instagram', href: 'https://www.instagram.com/grouasesores/' },
    { network: 'facebook', href: 'https://www.facebook.com/grouasesores' },
    { network: 'whatsapp', href: 'https://wa.me/message/V56AOY6RHJMDH1' },
  ],
  hero: {
    title: 'Protección integral para empresas',
    paragraph:
      'En GROU Asesores evaluamos los riesgos específicos de cada empresa y diseñamos soluciones de seguros a medida para proteger los activos de tu organización, fortaleciendo la capacidad de respuesta de la empresa ante eventos críticos. Así puedes enfocarte en el crecimiento mientras nosotros gestionamos la protección. Trabajamos de manera proactiva para anticipar amenazas y diseñar soluciones a medida.',
    cards: [
      {
        title: 'Te ayudamos',
        text: 'GROU Asesores ofrece soluciones de seguros empresariales diseñadas para proteger activos, reducir riesgos y asegurar la continuidad operativa de tu negocio.',
      },
      {
        title: 'Soluciones Personalizadas',
        text: 'Identificamos las vulnerabilidades específicas de tu sector para diseñar coberturas de seguros que cubran cada eventualidad de manera precisa.',
      },
      {
        title: 'Nuestra misión',
        text: 'Entender cada riesgo y diseñar seguros empresariales que permitan a las compañías operar con confianza y resiliencia. Ser un aliado estratégico para la prevención y la protección del valor de las empresas.',
      },
    ],
  },
  stages: {
    kicker: 'Lo que hacemos',
    title: 'PROGRAMA DE SEGUROS',
    label: 'ETAPAS',
    intro:
      'Es el plan de seguros diseñado para las necesidades específicas de protección integral y que se alinea con los objetivos estratégicos de tu empresa.',
    stages: [
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
    ],
  },
  about: {
    kicker: 'Nosotros',
    title: 'Riesgo claro.\nDecisiones sólidas.',
    mission:
      'Entender cada riesgo y diseñar seguros empresariales que permitan a las compañías operar con confianza y resiliencia. Ser un aliado estratégico para la prevención y la protección del valor de las empresas.',
    cta: { label: 'Hablemos', href: '#contacto' },
    slides: [
      {
        src: '/nosotros-1-pablo-arroyo.jpg',
        alt: 'Pablo Arroyo, en la oficina de GROU Asesores',
        title: 'Pablo Arroyo',
        isLogo: false,
      },
      {
        src: '/nosotros-2-grupo-gaman.webp',
        alt: 'Logo de Grupo Gaman',
        title: 'Grupo Gaman',
        isLogo: true,
        pad: 9,
      },
      {
        src: '/nosotros-3-coa.webp',
        alt: 'Logo de COA Asesores de Seguros',
        title: 'COA Asesores de Seguros',
        isLogo: true,
        pad: 14,
      },
    ],
  },
  risks: {
    title: 'Riesgos y Seguros',
    intro:
      'El Programa de Seguros es central para la gestión de riesgos, actúa principalmente en tres áreas.',
    sections: riskSections,
  },
  blog: {
    kicker: 'Perspectivas GROU Asesores',
    title: 'Ideas para navegar\nlo que viene.',
  },
  newsletter: {
    kicker: 'Newsletter',
    title: 'Una idea útil,\nuna vez al mes.',
    bridgeText: '¿Buscas resolver un caso concreto?',
    bridgeLink: { label: 'Hablemos', href: '#contacto' },
  },
  contact: {
    kicker: 'Hablemos',
    title: 'El próximo movimiento\nempieza aquí.',
    paragraph: 'Cuéntanos qué te preocupa. Te ayudaremos a ponerle nombre, contexto y un plan.',
    details: [
      { icon: 'map', text: 'Calle Serrano 55\n28006 Madrid' },
      { icon: 'mail', text: CONTACT_EMAIL, href: mailtoHref() },
      { icon: 'phone', text: '+34 910 123 456' },
    ],
    form: {
      nameLabel: 'Tu nombre',
      namePlaceholder: 'Nombre y apellidos',
      companyLabel: 'Empresa',
      companyPlaceholder: 'Nombre de empresa',
      emailLabel: 'Email',
      emailPlaceholder: 'tu@empresa.com',
      messageLabel: '¿En qué podemos ayudarte?',
      messagePlaceholder: 'Cuéntanos brevemente tu reto, consulta o comentario',
      submitLabel: 'Enviar consulta',
      sendingLabel: 'Enviando…',
      privacyNote: 'Respetamos tu privacidad. Nunca compartiremos tus datos.',
    },
  },
  footer: {
    tagline: 'Riesgo claro.\nDecisiones sólidas.',
    linkGroups: [
      {
        title: 'Explora',
        links: [
          { label: 'Inicio', href: '/#inicio' },
          { label: 'Servicios', href: '/#servicios' },
          { label: 'Nosotros', href: '/#nosotros' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contacto', href: '/#contacto' },
          { label: 'Suscribirse', href: '/#newsletter' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Aviso legal', href: '/#contacto' },
          { label: 'Privacidad', href: '/#contacto' },
          { label: 'Cookies', href: '/#contacto' },
        ],
      },
    ],
    legal: '© 2026 GROU Asesores. Protegiendo tu futuro corporativo.',
  },
}
