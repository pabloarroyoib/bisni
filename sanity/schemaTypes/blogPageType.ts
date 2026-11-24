import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

/**
 * Portada del blog (`/blog`), editable desde el Studio.
 *
 * Es un singleton (`_id: blogPage`) porque hay una sola portada. Todos los
 * campos caen a los textos por defecto del código si faltan, así la página
 * nunca queda vacía y el cliente puede cambiar solo lo que le interese.
 */
export const blogPageType = defineType({
  name: 'blogPage',
  title: 'Portada del blog',
  type: 'document',
  icon: DocumentTextIcon,
  description: 'Título, introducción y textos de la lista de artículos en /blog.',
  groups: [
    {name: 'content', title: 'Portada', default: true},
    {name: 'list', title: 'Lista de artículos'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'content',
      description: 'Primera línea del título.',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'titleEmphasis',
      title: 'Título, segunda línea',
      type: 'string',
      group: 'content',
      description: 'Se muestra debajo y en cursiva.',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Introducción',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Bajada a la derecha del título.',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'searchPlaceholder',
      title: 'Texto del buscador',
      type: 'string',
      group: 'list',
      initialValue: 'Buscar artículos...',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'emptyNoPosts',
      title: 'Lista vacía (sin artículos publicados)',
      type: 'text',
      rows: 2,
      group: 'list',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'emptyNoResults',
      title: 'Lista vacía (sin resultados)',
      type: 'text',
      rows: 2,
      group: 'list',
      description: 'Cuando la búsqueda o el filtro no devuelven artículos.',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'seoTitle',
      title: 'Título para buscadores',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Descripción para buscadores',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (rule) => rule.max(160),
    }),
  ],
})
