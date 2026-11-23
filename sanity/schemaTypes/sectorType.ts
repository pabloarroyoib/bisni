import {CaseIcon} from '@sanity/icons/Case'
import {defineField, defineType} from 'sanity'

/**
 * Sector: página propia por industria (`/sectores/[slug]`).
 *
 * La lista del desplegable del navbar se arma con estos documentos ordenados por
 * `order`, así que sumar un sector es crear un documento, no tocar código.
 * `reviewed` es el freno de contenido: mientras sea `false`, la página muestra
 * un aviso de borrador y no se indexa (el texto de ejemplo no debe rankear).
 */
export const sectorType = defineType({
  name: 'sector',
  title: 'Sector',
  type: 'document',
  icon: CaseIcon,
  description:
    'Página por industria, enlazada desde el desplegable "Sectores" del navbar. No aparece en la home.',
  groups: [
    {name: 'content', title: 'Contenido', default: true},
    {name: 'settings', title: 'Ajustes'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre del sector',
      type: 'string',
      group: 'content',
      description: 'Es el texto que se ve en el desplegable y como título de la página.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description: 'Parte final de la URL: /sectores/<slug>. Se genera desde el nombre.',
      options: {source: 'title', maxLength: 64},
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
              ? true
              : 'Usá solo minúsculas, números y guiones (por ejemplo: inmobiliaria).',
          ),
    }),
    defineField({
      name: 'summary',
      title: 'Resumen',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Una o dos frases: se muestran debajo del título de la página.',
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: 'body',
      title: 'Contenido',
      type: 'blockContent',
      group: 'content',
      description: 'Texto de la página. Admite encabezados, listas, enlaces, imágenes y video.',
    }),
    defineField({
      name: 'order',
      title: 'Orden en el desplegable',
      type: 'number',
      group: 'settings',
      description: 'Menor va primero. Los sectores sin orden quedan al final, alfabéticos.',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0).max(999),
    }),
    defineField({
      name: 'reviewed',
      title: 'Contenido aprobado por el cliente',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description:
        'Mientras esté apagado, la página se muestra como borrador y no se indexa ni entra al sitemap.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'Título para buscadores',
      type: 'string',
      group: 'seo',
      description: 'Si queda vacío se usa el nombre del sector.',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Descripción para buscadores',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Si queda vacía se usa el resumen.',
      validation: (rule) => rule.max(160),
    }),
  ],
  orderings: [
    {
      title: 'Orden del desplegable',
      name: 'dropdown',
      by: [
        {field: 'order', direction: 'asc'},
        {field: 'title', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'summary', reviewed: 'reviewed'},
    prepare: ({title, subtitle, reviewed}) => ({
      title,
      subtitle: reviewed ? subtitle : `Borrador · ${subtitle ?? 'sin resumen'}`,
    }),
  },
})
