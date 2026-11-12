import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Campos de contenido compartidos por el área (`riskGroup`) y sus
 * subsecciones (`riskSection`). La jerarquía es de un solo nivel: un área
 * tiene `subs`, una subsección no.
 */
const contentFields = () => [
  defineField({
    name: 'paragraphs',
    title: 'Párrafos',
    type: 'array',
    of: [defineArrayMember({type: 'string'})],
    validation: (rule) => rule.max(6),
  }),
  defineField({
    name: 'label',
    title: 'Etiqueta',
    type: 'string',
    validation: (rule) => rule.max(40),
  }),
  defineField({
    name: 'box',
    title: 'Caja destacada',
    type: 'object',
    fields: [
      defineField({
        name: 'title',
        title: 'Título',
        type: 'string',
        validation: (rule) => rule.required().max(100),
      }),
      defineField({
        name: 'text',
        title: 'Texto',
        type: 'text',
        rows: 4,
        validation: (rule) => rule.required().max(600),
      }),
    ],
  }),
  defineField({
    name: 'terms',
    title: 'Términos',
    type: 'array',
    of: [defineArrayMember({type: 'riskTerm'})],
    validation: (rule) => rule.max(12),
  }),
  defineField({
    name: 'chips',
    title: 'Chips',
    type: 'array',
    of: [defineArrayMember({type: 'string'})],
    validation: (rule) => rule.max(12),
  }),
]

const titleField = () =>
  defineField({
    name: 'title',
    title: 'Título',
    type: 'string',
    validation: (rule) => rule.required().max(100),
  })

export const riskSection = defineType({
  name: 'riskSection',
  title: 'Subsección de riesgo',
  type: 'object',
  fields: [titleField(), ...contentFields()],
  preview: {
    select: {
      title: 'title',
    },
  },
})

export const riskGroup = defineType({
  name: 'riskGroup',
  title: 'Área de riesgo',
  type: 'object',
  fields: [
    titleField(),
    ...contentFields(),
    defineField({
      name: 'subs',
      title: 'Subsecciones (un solo nivel)',
      type: 'array',
      of: [defineArrayMember({type: 'riskSection'})],
      validation: (rule) => rule.max(6),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
