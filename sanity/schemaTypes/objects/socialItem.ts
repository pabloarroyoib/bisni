import {defineField, defineType} from 'sanity'

const NETWORKS = [
  {title: 'LinkedIn', value: 'linkedin'},
  {title: 'Instagram', value: 'instagram'},
  {title: 'Facebook', value: 'facebook'},
  {title: 'WhatsApp', value: 'whatsapp'},
]

export const socialItem = defineType({
  name: 'socialItem',
  title: 'Red social',
  type: 'object',
  fields: [
    defineField({
      name: 'network',
      title: 'Red',
      type: 'string',
      description: 'El ícono se elige por red; solo cambia el destino.',
      options: {
        list: NETWORKS,
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description: 'URL completa del perfil o del chat (https://...).',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
  ],
  preview: {
    select: {
      network: 'network',
      href: 'href',
    },
    prepare(selection) {
      const network = NETWORKS.find((item) => item.value === selection.network)
      return {
        title: network?.title ?? 'Red social',
        subtitle: selection.href,
      }
    },
  },
})
