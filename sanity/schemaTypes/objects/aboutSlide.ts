import {defineField, defineType} from 'sanity'

export const aboutSlide = defineType({
  name: 'aboutSlide',
  title: 'Slide de Nosotros',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: {hotspot: true},
      description: 'Foto del equipo o logo. El recorte respeta el hotspot.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      type: 'string',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'isLogo',
      title: 'Es un logo',
      type: 'boolean',
      description: 'Activa contain y el aire alrededor del logo.',
      initialValue: false,
    }),
    defineField({
      name: 'pad',
      title: 'Aire alrededor (%)',
      type: 'number',
      description: 'Solo para logos. Porcentaje del marco que queda libre.',
      initialValue: 14,
      validation: (rule) => rule.min(4).max(24),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'alt',
      media: 'image',
    },
  },
})
