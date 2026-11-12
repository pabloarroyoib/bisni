import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

const LINE_BREAK_NOTE = 'Podés usar un salto de línea: el sitio lo respeta.'

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  description:
    'Documento único de la home. Es el único que se edita desde el Studio y, si un campo falta o queda vacío, el sitio usa el contenido por defecto.',
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'stages', title: 'Etapas'},
    {name: 'about', title: 'Nosotros'},
    {name: 'risks', title: 'Riesgos'},
    {name: 'blog', title: 'Blog'},
    {name: 'newsletter', title: 'Newsletter'},
    {name: 'contact', title: 'Contacto'},
    {name: 'footer', title: 'Footer'},
    {name: 'nav', title: 'Navegación'},
  ],
  fields: [
    defineField({
      name: 'nav',
      title: 'Navegación',
      type: 'object',
      group: 'nav',
      fields: [
        defineField({
          name: 'items',
          title: 'Enlaces',
          type: 'array',
          of: [defineArrayMember({type: 'linkItem'})],
          validation: (rule) => rule.max(8),
        }),
        defineField({
          name: 'socials',
          title: 'Redes sociales',
          type: 'array',
          description:
            'Íconos de redes en la barra de navegación. Una lista vacía los oculta.',
          of: [defineArrayMember({type: 'socialItem'})],
          validation: (rule) => rule.max(4),
        }),
      ],
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'title',
          title: 'Título',
          type: 'string',
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: 'paragraph',
          title: 'Párrafo',
          type: 'text',
          rows: 5,
          validation: (rule) => rule.required().max(1200),
        }),
        defineField({
          name: 'cards',
          title: 'Tarjetas',
          type: 'array',
          of: [defineArrayMember({type: 'heroCard'})],
          description: 'El diseño del hero usa exactamente tres tarjetas.',
          validation: (rule) => rule.required().min(3).max(3),
        }),
      ],
    }),
    defineField({
      name: 'stages',
      title: 'Etapas',
      type: 'object',
      group: 'stages',
      fields: [
        defineField({
          name: 'kicker',
          title: 'Antetítulo',
          type: 'string',
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: 'title',
          title: 'Título',
          type: 'string',
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: 'label',
          title: 'Etiqueta',
          type: 'string',
          validation: (rule) => rule.required().max(40),
        }),
        defineField({
          name: 'intro',
          title: 'Introducción',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required().max(600),
        }),
        defineField({
          name: 'stages',
          title: 'Etapas del programa',
          type: 'array',
          of: [defineArrayMember({type: 'stage'})],
          description: 'El programa está diseñado para tres etapas.',
          validation: (rule) => rule.required().min(3).max(3),
        }),
      ],
    }),
    defineField({
      name: 'about',
      title: 'Nosotros',
      type: 'object',
      group: 'about',
      fields: [
        defineField({
          name: 'kicker',
          title: 'Antetítulo',
          type: 'string',
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: 'title',
          title: 'Título',
          type: 'text',
          rows: 2,
          description: LINE_BREAK_NOTE,
          validation: (rule) => rule.required().max(160),
        }),
        defineField({
          name: 'mission',
          title: 'Misión',
          type: 'text',
          rows: 5,
          validation: (rule) => rule.required().max(900),
        }),
        defineField({
          name: 'cta',
          title: 'Botón',
          type: 'linkItem',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'slides',
          title: 'Slides del carrusel',
          type: 'array',
          of: [defineArrayMember({type: 'aboutSlide'})],
          description: 'El carrusel está diseñado para tres marcos; no cambies la cantidad.',
          validation: (rule) => rule.required().min(3).max(3),
        }),
      ],
    }),
    defineField({
      name: 'risks',
      title: 'Riesgos',
      type: 'object',
      group: 'risks',
      fields: [
        defineField({
          name: 'title',
          title: 'Título',
          type: 'string',
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: 'intro',
          title: 'Introducción',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required().max(400),
        }),
        defineField({
          name: 'sections',
          title: 'Áreas de riesgo',
          type: 'array',
          of: [defineArrayMember({type: 'riskGroup'})],
          validation: (rule) => rule.required().min(1).max(8),
        }),
      ],
    }),
    defineField({
      name: 'blog',
      title: 'Blog',
      type: 'object',
      group: 'blog',
      fields: [
        defineField({
          name: 'kicker',
          title: 'Antetítulo',
          type: 'string',
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: 'title',
          title: 'Título',
          type: 'text',
          rows: 2,
          description: LINE_BREAK_NOTE,
          validation: (rule) => rule.required().max(160),
        }),
      ],
    }),
    defineField({
      name: 'newsletter',
      title: 'Newsletter',
      type: 'object',
      group: 'newsletter',
      fields: [
        defineField({
          name: 'kicker',
          title: 'Antetítulo',
          type: 'string',
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: 'title',
          title: 'Título',
          type: 'text',
          rows: 2,
          validation: (rule) => rule.required().max(160),
        }),
        defineField({
          name: 'bridgeText',
          title: 'Texto del puente',
          type: 'string',
          validation: (rule) => rule.required().max(160),
        }),
        defineField({
          name: 'bridgeLink',
          title: 'Enlace del puente',
          type: 'linkItem',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Contacto',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({
          name: 'kicker',
          title: 'Antetítulo',
          type: 'string',
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: 'title',
          title: 'Título',
          type: 'text',
          rows: 2,
          validation: (rule) => rule.required().max(160),
        }),
        defineField({
          name: 'paragraph',
          title: 'Párrafo',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required().max(500),
        }),
        defineField({
          name: 'details',
          title: 'Datos de contacto',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'contactDetail',
              title: 'Dato de contacto',
              fields: [
                defineField({
                  name: 'icon',
                  title: 'Ícono',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Ubicación', value: 'map'},
                      {title: 'Correo', value: 'mail'},
                      {title: 'Web', value: 'globe'},
                      {title: 'Teléfono', value: 'phone'},
                    ],
                    layout: 'radio',
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'text',
                  title: 'Texto',
                  type: 'text',
                  rows: 2,
                  description: 'Podés usar un salto de línea.',
                  validation: (rule) => rule.required().max(200),
                }),
                defineField({
                  name: 'href',
                  title: 'Enlace',
                  type: 'string',
                  description:
                    'Opcional: mailto:, #ancla o URL. Si el ícono es Correo, el sitio agrega el enlace de Gmail.',
                  validation: (rule) => rule.max(300),
                }),
              ],
              preview: {
                select: {
                  title: 'text',
                  subtitle: 'icon',
                },
              },
            }),
          ],
          validation: (rule) => rule.min(1).max(4),
        }),
        defineField({
          name: 'form',
          title: 'Formulario de contacto',
          type: 'object',
          description:
            'Copy visible del formulario. Los mensajes de validación y de estado siguen en código.',
          fields: [
            defineField({
              name: 'nameLabel',
              title: 'Etiqueta del nombre',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'namePlaceholder',
              title: 'Texto de ejemplo del nombre',
              type: 'string',
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: 'companyLabel',
              title: 'Etiqueta de la empresa',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'companyPlaceholder',
              title: 'Texto de ejemplo de la empresa',
              type: 'string',
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: 'emailLabel',
              title: 'Etiqueta del email',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'emailPlaceholder',
              title: 'Texto de ejemplo del email',
              type: 'string',
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: 'messageLabel',
              title: 'Etiqueta del mensaje',
              type: 'string',
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: 'messagePlaceholder',
              title: 'Texto de ejemplo del mensaje',
              type: 'string',
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: 'submitLabel',
              title: 'Texto del botón',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'sendingLabel',
              title: 'Texto mientras envía',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'privacyNote',
              title: 'Nota de privacidad',
              type: 'string',
              validation: (rule) => rule.required().max(160),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({
          name: 'tagline',
          title: 'Frase',
          type: 'text',
          rows: 2,
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: 'linkGroups',
          title: 'Grupos de enlaces',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'footerLinkGroup',
              title: 'Grupo de enlaces',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Título',
                  type: 'string',
                  validation: (rule) => rule.required().max(40),
                }),
                defineField({
                  name: 'links',
                  title: 'Enlaces',
                  type: 'array',
                  of: [defineArrayMember({type: 'linkItem'})],
                  validation: (rule) => rule.max(8),
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                },
              },
            }),
          ],
          validation: (rule) => rule.max(4),
        }),
        defineField({
          name: 'legal',
          title: 'Texto legal',
          type: 'string',
          validation: (rule) => rule.required().max(200),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'hero.title',
    },
    prepare(selection) {
      const {title} = selection
      return {title: title || 'Home', subtitle: 'Home'}
    },
  },
})
