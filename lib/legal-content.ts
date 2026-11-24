import type { LegalSlug } from './legal-routes'

/**
 * Textos base de las páginas legales (borrador v1 para revisión del abogado).
 *
 * Reglas de edición:
 * - `{{token}}` se reemplaza con los datos de `siteSettings` al renderizar.
 * - `[PENDIENTE: …]` marca una decisión legal o un dato que el cliente todavía
 *   no confirmó. No se reemplaza por valores inventados.
 * - Los enlaces internos van como marcas `link` de Portable Text.
 *
 * El contenido cargado en Sanity reemplaza a este borrador. Mientras no exista
 * el documento (o no tenga `reviewed: true`), la página se muestra como borrador
 * y no se indexa.
 */

export type LegalInline = string | { text: string; href: string }

type LegalSpan = {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

type LegalMarkDef = {
  _key: string
  _type: 'link'
  href: string
}

export type LegalBlock = {
  _type: 'block'
  _key: string
  style: 'normal' | 'h2' | 'h3'
  markDefs: LegalMarkDef[]
  children: LegalSpan[]
  listItem?: 'bullet' | 'number'
  level?: number
}

export type LegalDraft = {
  title: string
  seoDescription: string
  body: LegalBlock[]
}

function block(
  key: string,
  style: LegalBlock['style'],
  parts: LegalInline[],
  listItem?: 'bullet' | 'number',
): LegalBlock {
  const markDefs: LegalMarkDef[] = []
  const children = parts.map((part, index) => {
    if (typeof part === 'string') {
      return { _type: 'span' as const, _key: `${key}-s${index}`, text: part, marks: [] }
    }

    const markKey = `${key}-m${index}`
    markDefs.push({ _key: markKey, _type: 'link', href: part.href })
    return { _type: 'span' as const, _key: `${key}-s${index}`, text: part.text, marks: [markKey] }
  })

  return {
    _type: 'block',
    _key: key,
    style,
    markDefs,
    children,
    ...(listItem ? { listItem, level: 1 } : {}),
  }
}

const h2 = (key: string, text: string) => block(key, 'h2', [text])
const p = (key: string, ...parts: LegalInline[]) => block(key, 'normal', parts)
const bullets = (key: string, items: LegalInline[][]) =>
  items.map((parts, index) => block(`${key}-${index}`, 'normal', parts, 'bullet'))

const AVISO_LEGAL_BODY: LegalBlock[] = [
  h2('al-titular', 'Titular del sitio'),
  p(
    'al-titular-p1',
    'Este sitio web es titularidad de {{legalName}}, CUIT {{taxId}}, con domicilio legal en {{address}}.',
  ),
  p('al-titular-p2', 'Datos de contacto: {{email}}. Teléfono: {{phone}}.'),

  h2('al-condicion', 'Condición registrada'),
  p(
    'al-condicion-p1',
    '{{legalName}} se desempeña como {{ssnCondition}} y está inscripta ante la Superintendencia de Seguros de la Nación con {{ssn}}.',
  ),
  p(
    'al-condicion-p2',
    'La condición y la matrícula pueden verificarse en el sitio oficial de la Superintendencia de Seguros de la Nación.',
  ),

  h2('al-terminos', 'Términos de uso'),
  p(
    'al-terminos-p1',
    'El acceso a este sitio implica aceptar los términos de este aviso. La información publicada es general, informativa y no constituye asesoramiento técnico, jurídico ni una oferta de cobertura. Las condiciones de cada seguro surgen de la propuesta aceptada y de la póliza emitida.',
  ),
  p(
    'al-terminos-p2',
    'El sitio puede actualizarse, modificarse o interrumpirse sin aviso previo.',
  ),

  h2('al-propiedad', 'Propiedad intelectual'),
  p(
    'al-propiedad-p1',
    'Los textos, marcas, logotipos, imágenes y demás contenidos son propiedad de {{legalName}} o se utilizan con autorización. No se permite su reproducción, distribución ni modificación sin consentimiento previo por escrito, salvo los usos que la ley permita.',
  ),

  h2('al-responsabilidad', 'Responsabilidad'),
  p(
    'al-responsabilidad-p1',
    '{{legalName}} adopta medidas razonables para que la información del sitio sea correcta y esté actualizada, pero no garantiza que esté libre de errores ni que el acceso sea ininterrumpido.',
  ),
  p(
    'al-responsabilidad-p2',
    'En la medida permitida por la ley, no se responde por daños derivados del uso del sitio o de la imposibilidad de acceder a él. Nada de lo dispuesto en este aviso limita los derechos que la Ley 24.240 y el Código Civil y Comercial reconocen a los consumidores.',
  ),

  h2('al-terceros', 'Enlaces a sitios de terceros'),
  p(
    'al-terceros-p1',
    'El sitio puede incluir enlaces a sitios de terceros. {{legalName}} no controla su contenido, disponibilidad ni políticas, y no asume responsabilidad por ellos.',
  ),

  h2('al-consumidor', 'Defensa del consumidor'),
  p('al-consumidor-p1', 'Para consultas o reclamos, escribí a {{email}}.'),
  p(
    'al-consumidor-p2',
    'Si el usuario reviste el carácter de consumidor conforme la Ley 24.240, conserva todos los derechos que esa norma le reconoce y puede reclamar en su domicilio, conforme el artículo 36.',
  ),

  h2('al-datos', 'Datos personales'),
  p(
    'al-datos-p1',
    'El tratamiento de datos personales se describe en la ',
    { text: 'Política de privacidad', href: '/legal/privacidad' },
    '.',
  ),

  h2('al-jurisdiccion', 'Jurisdicción'),
  p(
    'al-jurisdiccion-p1',
    'Para las relaciones que no estén alcanzadas por normas de orden público, resultan competentes los tribunales de {{jurisdiction}}.',
  ),
]

const PRIVACIDAD_BODY: LegalBlock[] = [
  h2('pp-responsable', 'Responsable del tratamiento'),
  p(
    'pp-responsable-p1',
    'El responsable del tratamiento de los datos personales es {{legalName}}, CUIT {{taxId}}, con domicilio legal en {{address}}.',
  ),
  p(
    'pp-responsable-p2',
    'Canal para ejercer derechos y hacer consultas sobre datos personales: {{dataRightsEmail}}.',
  ),

  h2('pp-datos', 'Qué datos tratamos'),
  p(
    'pp-datos-p1',
    'Formulario de contacto: nombre, empresa, email y mensaje. También se registra la dirección IP del envío, necesaria para prevenir el abuso del formulario.',
  ),
  p('pp-datos-p2', 'Suscripción para recibir novedades: nombre de pila y email.'),
  p(
    'pp-datos-p3',
    'Datos técnicos: los registros habituales del servidor, como la dirección IP y la fecha de acceso, necesarios para el funcionamiento y la seguridad del sitio.',
  ),
  p('pp-datos-p4', 'No se solicitan datos sensibles en los términos del artículo 7 de la Ley 25.326.'),

  h2('pp-finalidades', 'Para qué los usamos'),
  ...bullets('pp-finalidades', [
    ['Responder consultas y coordinar una evaluación de riesgos.'],
    ['Enviar las novedades a quienes se suscribieron.'],
    ['Prevenir abusos, fraudes y ataques al sitio.'],
    ['Cumplir obligaciones legales y regulatorias aplicables.'],
  ]),
  p(
    'pp-finalidades-p1',
    'No se usan los datos para decisiones automatizadas ni para elaborar perfiles con efectos jurídicos.',
  ),

  h2('pp-consentimiento', 'Consentimiento'),
  p(
    'pp-consentimiento-p1',
    'La base de legitimación es el consentimiento libre, expreso e informado del artículo 5 de la Ley 25.326. Se presta al enviar el formulario de contacto y, en la suscripción para recibir novedades, al completar el formulario, que informa que la suscripción implica aceptar esta política.',
  ),
  p(
    'pp-consentimiento-p2',
    '[PENDIENTE: confirmar si el alta de la suscripción para recibir novedades sigue siendo directa (sin correo de confirmación) o si se activa doble opt-in. El texto debe describir el mecanismo real.]',
  ),

  h2('pp-proveedores', 'Proveedores y transferencias'),
  p(
    'pp-proveedores-p1',
    'Para operar el sitio se utilizan proveedores de servicios que pueden alojar o procesar datos fuera de la República Argentina: alojamiento del sitio, gestión de contenidos, envío de correo y medición de visitas sin cookies.',
  ),
  p(
    'pp-proveedores-p3',
    'A estos proveedores se les exige tratar los datos solo para las finalidades contratadas.',
  ),

  h2('pp-conservacion', 'Conservación'),
  p(
    'pp-conservacion-p1',
    'Las consultas del formulario se conservan mientras dure la relación y hasta [PENDIENTE: plazo] después del último contacto.',
  ),
  p(
    'pp-conservacion-p2',
    'Los datos de la suscripción para recibir novedades se conservan hasta la baja o hasta [PENDIENTE: plazo] de inactividad.',
  ),
  p(
    'pp-conservacion-p3',
    'Los datos cuya conservación exija una norma, por ejemplo la prevención de lavado de activos, se conservan por el plazo legal.',
  ),

  h2('pp-seguridad', 'Seguridad'),
  p(
    'pp-seguridad-p1',
    'El sitio usa HTTPS. El acceso al CMS, al buzón y a las credenciales está restringido a las personas que lo necesitan, con contraseñas de aplicación para el envío por SMTP. El sitio no almacena datos de tarjetas ni contraseñas de visitantes.',
  ),
  p(
    'pp-seguridad-p2',
    'Si ocurre un incidente de seguridad que afecte datos personales, se aplican las medidas de contención y se notifica según corresponda.',
  ),

  h2('pp-derechos', 'Derechos de las personas'),
  p(
    'pp-derechos-p1',
    'Podés solicitar el acceso, la rectificación, la actualización, la supresión y la oposición al tratamiento de tus datos escribiendo a {{dataRightsEmail}}.',
  ),
  p(
    'pp-derechos-p2',
    'La Ley 25.326 prevé un plazo de diez días corridos para responder un informe y de cinco días hábiles para una rectificación.',
  ),
  p(
    'pp-derechos-p3',
    'El derecho de habeas data puede ejercerse en los términos de los artículos 14 y concordantes de la Ley 25.326 y de la normativa procesal de la jurisdicción.',
  ),

  h2('pp-aaip', 'Autoridad de aplicación y registro'),
  p(
    'pp-aaip-p1',
    'La autoridad de aplicación es la Agencia de Acceso a la Información Pública (AAIP).',
  ),

  h2('pp-menores', 'Menores de edad'),
  p(
    'pp-menores-p1',
    'El sitio está dirigido a empresas y a personas mayores de 18 años. No se recopilan datos de menores de manera intencional. Si se advierte una carga de ese tipo, se elimina.',
  ),

  h2('pp-cookies', 'Cookies y tecnologías similares'),
  p(
    'pp-cookies-p1',
    'El sitio público no utiliza cookies propias de analítica, publicidad ni almacenamiento local para rastrear visitantes. Por eso no se muestra un banner de consentimiento. La medición de visitas del sitio funciona sin cookies ni identificadores persistentes.',
  ),
  p(
    'pp-cookies-p2',
    'El panel de edición de contenidos, disponible en /studio, usa cookies de sesión para editores autenticados. El formulario de suscripción para recibir novedades se envía a un proveedor externo dentro de un iframe, y ese proveedor puede usar cookies de terceros en su propio dominio; esas cookies no las controlamos.',
  ),
  p(
    'pp-cookies-p4',
    'Si se incorporan herramientas de analítica o publicidad con cookies no esenciales, se implementará un sistema de gestión de consentimiento con bloqueo previo.',
  ),

  h2('pp-cambios', 'Cambios'),
  p(
    'pp-cambios-p1',
    'Esta política puede actualizarse. La versión vigente es la publicada en esta página y la fecha de última actualización se muestra al inicio.',
  ),
  p('pp-cambios-p2', 'Ver también el ', { text: 'Aviso legal', href: '/legal/aviso-legal' }, '.'),
]

export const LEGAL_DRAFTS: Record<LegalSlug, LegalDraft> = {
  'aviso-legal': {
    title: 'Aviso legal',
    seoDescription:
      'Datos del titular del sitio, condición registrada ante la SSN, términos de uso, propiedad intelectual y jurisdicción.',
    body: AVISO_LEGAL_BODY,
  },
  privacidad: {
    title: 'Política de privacidad',
    seoDescription:
      'Qué datos personales tratamos, con qué finalidad, quiénes los procesan y cómo ejercer tus derechos (Ley 25.326).',
    body: PRIVACIDAD_BODY,
  },
}
