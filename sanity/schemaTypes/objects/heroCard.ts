import {defineField, defineType} from 'sanity'

export const heroCard = defineType({
  name: 'heroCard',
  title: 'Tarjeta del hero',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'text',
    },
  },
})
