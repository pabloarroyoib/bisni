import {defineArrayMember, defineType} from 'sanity'

/**
 * Cuerpo de una página legal: solo texto, listas y enlaces.
 *
 * No reusa `blockContent` a propósito: una página legal no lleva imágenes ni
 * videos, y conviene que el editor no pueda insertarlos por accidente. Los
 * datos del responsable no se escriben acá: se referencian con tokens
 * (`{{legalName}}`, `{{taxId}}`, …) que el sitio resuelve desde `siteSettings`.
 */
export const legalBlockContentType = defineType({
  name: 'legalBlockContent',
  title: 'Contenido legal',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Título', value: 'h2'},
        {title: 'Subtítulo', value: 'h3'},
      ],
      lists: [
        {title: 'Viñetas', value: 'bullet'},
        {title: 'Numerada', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Negrita', value: 'strong'},
          {title: 'Cursiva', value: 'em'},
        ],
        annotations: [
          {
            title: 'Enlace',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: (rule) =>
                  rule.uri({
                    allowRelative: true,
                    scheme: ['http', 'https', 'mailto', 'tel'],
                  }),
              },
            ],
          },
        ],
      },
    }),
  ],
})
