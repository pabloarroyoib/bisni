import {defineField, defineType} from 'sanity'

export const stage = defineType({
  name: 'stage',
  title: 'Etapa',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required().max(1200),
    }),
    defineField({
      name: 'icon',
      title: 'Ícono',
      type: 'string',
      options: {
        list: [
          {title: 'Diagnóstico', value: 'diagnostico'},
          {title: 'Diseño y propuesta', value: 'diseno'},
          {title: 'Implementación y seguimiento', value: 'seguimiento'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'icon',
    },
  },
})
