/**
 * Contenido de la sección "Riesgos y Seguros". El texto es el del documento del
 * cliente: no resumir, reordenar ni corregir. Las tres áreas del primer nivel y
 * sus subsecciones viven acá para que el componente quede solo con la mecánica.
 */

export type RiskTerm = { name: string; text?: string; note?: string }

export type RiskContent = {
  paragraphs?: string[]
  label?: string
  box?: { title: string; text: string }
  terms?: RiskTerm[]
  chips?: string[]
}

export type RiskSub = RiskContent & { title: string }
export type RiskSection = RiskContent & { title: string; subs?: RiskSub[] }

export const riskSections: RiskSection[] = [
  {
    title: 'Operaciones e Infraestructura',
    paragraphs: [
      'Las empresas están expuestas a riesgos que afectan desde la logística a la infraestructura y los sistemas.',
      'Eventos como incendio, fallas en procesos, ciberdelito o fenómenos naturales, provocan pérdidas directas y también interrupción de las operaciones, lo que incluso puede implicar un mayor impacto que el daño directo causado por el siniestro.',
    ],
    label: 'Seguros',
    box: {
      title: 'Seguros para la propiedad',
      text: 'Permiten la reposición o reconstrucción de los bienes siniestrados, y la continuidad de la explotación.',
    },
    chips: [
      'Seguro de Incendio',
      'Seguro de Robo',
      'Seguro Todo riesgo operativo',
      'Seguro de Transporte',
      'Seguro técnico',
      'Seguro de ciberdelito',
      'etc.',
    ],
  },
  {
    title: 'Capital Humano',
    subs: [
      {
        title: 'Riesgos laborales',
        paragraphs: [
          'Accidentes laborales, enfermedades profesionales, invalidez y fallecimiento de los trabajadores en ocasión de trabajo.',
          'También las indemnizaciones obligatorias de la Ley de Contrato de Trabajo (LCT): fallecimiento, medio sueldo por año trabajado; invalidez, un sueldo por año trabajado.',
        ],
        label: 'Seguros',
        terms: [
          {
            name: 'ART',
            text: 'Accidentes laborales, enfermedades profesionales, invalidez y fallecimiento, en ocasión de trabajo.',
            note: 'Contratación obligatoria',
          },
          {
            name: 'Seguro Ley de Contrato de Trabajo',
            text: 'Invalidez y fallecimiento en cualquier ocasión.',
            note: 'Contratación voluntaria, pero indemnización obligatoria',
          },
          {
            name: 'Seguro de Convenio Colectivo de Trabajo (CCT)',
            note: 'Contratación obligatoria por CCT',
          },
          {
            name: 'Seguro de Accidentes Personales prestacional',
            note: 'Contratación voluntaria para personas no cubiertas por ART',
          },
        ],
      },
      {
        title: 'Riesgo de estructura societaria',
        paragraphs: [
          'El fallecimiento de alguno de los socios de la empresa abre la posibilidad de quiebre de la estructura societaria.',
        ],
        label: 'Seguro',
        terms: [
          {
            name: 'Seguro de Vida para respaldo societario',
            text: 'Permite la negociación entre las partes para restaurar la estabilidad de la organización.',
          },
        ],
      },
      {
        title: 'Riesgo oferta laboral básica',
        paragraphs: [
          'Ante un escenario de mayor competitividad en los mercados y de mayor rotación en las nuevas generaciones, ofrecer una propuesta laboral más robusta, con beneficios extra que aumentan el «salario emocional», mejora la capacidad de la empresa de conservar cuadros y atraer nuevos talentos.',
          'Estos beneficios son:',
        ],
        chips: [
          'Seguros de Retiro colectivo',
          'Seguros de Vida colectivo',
          'Medicina Privada (planes corporativos)',
        ],
      },
    ],
  },
  {
    title: 'Responsabilidad',
    subs: [
      {
        title: 'Responsabilidad general',
        paragraphs: [
          'Es la obligación legal que tiene una organización de reparar o compensar económicamente los daños y perjuicios que su actividad, sus productos, sus instalaciones o su personal puedan ocasionar a terceros.',
        ],
        label: 'Seguros',
        box: {
          title: 'Seguros de Responsabilidad Civil',
          text: 'Protegen el patrimonio del asegurado haciéndose cargo de las indemnizaciones y los gastos legales cuando se causa un daño involuntario a un tercero.',
        },
        terms: [
          {
            name: 'Responsabilidad Civil comprensiva',
            text: 'Protege el patrimonio de la empresa ante reclamos económicos que puedan realizar terceros por daños o perjuicios ocasionados por el desarrollo de su actividad.',
          },
          {
            name: 'Responsabilidad Civil directivos y gerentes',
            text: 'Diseñada para amparar a las autoridades de una empresa frente a reclamos derivados de su gestión.',
          },
          {
            name: 'Responsabilidad Civil productos',
            text: 'Protege al fabricante, importador o distribuidor frente a reclamos o demandas por daños personales, materiales o económicos que sus productos puedan ocasionar a terceros o a los consumidores finales una vez que se encuentran en el mercado.',
          },
          {
            name: 'Responsabilidad Civil profesional',
            text: 'Protege el patrimonio de los profesionales frente a reclamos de terceros por errores, omisiones, negligencias o imprudencias cometidas durante el ejercicio de su actividad laboral.',
          },
        ],
      },
      {
        title: 'Responsabilidad contractual',
        paragraphs: [
          'Es la responsabilidad derivada de asumir una obligación, ya sea de realizar una obra, prestar un servicio o suministrar algún producto. Ante un incumplimiento de estas obligaciones, un cliente podría realizar un reclamo o demanda a la empresa.',
          'Para responder a esta situación están los instrumentos llamados Cauciones o Garantías, que posibilitan a la empresa garantizar el cumplimiento de la obligación.',
          'También se puede ofrecer una garantía para mejorar la chance de concretar un negocio.',
        ],
      },
    ],
  },
]
