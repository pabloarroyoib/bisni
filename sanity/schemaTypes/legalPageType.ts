import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

/**
 * Página legal (aviso legal o privacidad).
 *
 * Los tres documentos son fijos: sus rutas viven en `LEGAL_ROUTES` y el footer
 * las enlaza siempre, así que no se pueden despublicar ni cambiar de slug sin
 * tocar código. `reviewed` es el freno legal: mientras sea `false`, la página se
 * muestra con un aviso de borrador y no se indexa.
 */
export const legalPageType = defineType({
  name: 'legalPage',
  title: 'Página legal',
  type: 'document',
  icon: DocumentTextIcon,
  description:
    'Aviso legal y Política de privacidad. Los textos los valida el abogado del cliente. Los datos del responsable salen de "Datos del sitio".',
  groups: [
    {name: 'content', title: 'Contenido', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description: 'Parte final de la URL: /legal/<slug>. Los valores válidos son aviso-legal y privacidad.',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            !value?.current || /^(aviso-legal|privacidad)$/.test(value.current)
              ? true
              : 'El slug debe ser aviso-legal o privacidad.',
          ),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Última actualización',
      type: 'date',
      group: 'content',
      description: 'Se muestra al inicio de la página.',
    }),
    defineField({
      name: 'reviewed',
      title: 'Texto revisado por el abogado',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description:
        'Mientras esté desactivado, la página muestra un aviso de borrador y no se indexa. Activalo solo cuando el texto esté aprobado.',
    }),
    defineField({
      name: 'body',
      title: 'Contenido',
      type: 'legalBlockContent',
      group: 'content',
      description:
        'Podés usar los tokens {{legalName}}, {{tradeName}}, {{taxId}}, {{address}}, {{officeAddress}}, {{phone}}, {{email}}, {{dataRightsEmail}}, {{ssn}}, {{ssnCondition}}, {{jurisdiction}} y {{website}}. El sitio los completa con "Datos del sitio".',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'seoTitle',
      title: 'Título para buscadores',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Descripción para buscadores',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (rule) => rule.max(200),
    }),
  ],
  orderings: [
    {
      title: 'Título',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      updated: 'lastUpdated',
      reviewed: 'reviewed',
    },
    prepare(selection) {
      const {title, updated, reviewed} = selection
      const status = reviewed ? 'Revisado' : 'Borrador'
      return {
        title: title || 'Página legal',
        subtitle: [status, updated].filter(Boolean).join(' · '),
      }
    },
  },
})
