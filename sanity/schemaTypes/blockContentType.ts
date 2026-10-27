import {defineType, defineArrayMember} from 'sanity'
import {ImageIcon as Image} from '@sanity/icons/Image'
import {VideoIcon as Video} from '@sanity/icons/Video'

export const blockContentType = defineType({
  title: 'Contenido enriquecido',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Título 1', value: 'h1'},
        {title: 'Título 2', value: 'h2'},
        {title: 'Título 3', value: 'h3'},
        {title: 'Título 4', value: 'h4'},
        {title: 'Cita', value: 'blockquote'},
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
    defineArrayMember({
      type: 'image',
      icon: Image,
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto alternativo',
        },
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'video',
      title: 'Video',
      icon: Video,
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'URL del video',
          description: 'URL de YouTube o Vimeo',
          validation: (rule) => rule.required(),
        },
      ],
      preview: {
        select: {
          url: 'url',
        },
        prepare(selection) {
          const {url} = selection
          return {
            title: 'Video',
            subtitle: url,
          }
        },
      },
    }),
  ],
})
