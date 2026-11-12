import {defineField, defineType} from 'sanity'

export const riskTerm = defineType({
  name: 'riskTerm',
  title: 'Término de riesgo',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'note',
      title: 'Nota',
      type: 'string',
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'note',
    },
  },
})
