import {defineField, defineType} from 'sanity'

export const linkItem = defineType({
  name: 'linkItem',
  title: 'Enlace',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Etiqueta',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'href',
      title: 'Destino',
      type: 'string',
      description: 'Ancla (#contacto), ruta interna (/blog) o URL completa',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'variant',
      title: 'Estilo en la navegación',
      type: 'string',
      description:
        'Solo se usa en la barra de navegación principal. En el footer y los CTA se ignora.',
      options: {
        list: [
          {title: 'Enlace', value: 'link'},
          {title: 'Botón', value: 'button'},
        ],
        layout: 'radio',
      },
      initialValue: 'link',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'href',
    },
  },
})
