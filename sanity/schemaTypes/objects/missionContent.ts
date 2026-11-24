import {defineArrayMember, defineType} from 'sanity'

/**
 * Texto corto con enlaces, para campos que no justifican el Portable Text
 * completo (por ejemplo la «Misión» de Nosotros).
 *
 * Un solo estilo de párrafo, sin listas ni imágenes: la idea es poder vincular
 * nombres de empresas o de redes a su URL, no maquetar un artículo. Las marcas
 * de énfasis y el enlace se resuelven en el componente que lo renderiza.
 */
export const missionContentType = defineType({
  name: 'missionContent',
  title: 'Texto con enlaces',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Párrafo', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Negrita', value: 'strong'},
          {title: 'Cursiva', value: 'em'},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Enlace',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                description: 'Por ejemplo https://grupogaman.com.ar o https://instagram.com/coa.seguros',
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
