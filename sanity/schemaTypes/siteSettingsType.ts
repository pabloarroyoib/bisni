import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

/**
 * Datos legales y de contacto del responsable del sitio.
 *
 * Es un singleton (`_id: 'siteSettings'`) y la única fuente de estos datos: la
 * home, el footer y las páginas legales lo leen de acá. No cargar valores de
 * ejemplo: un dato que el cliente no confirmó no se publica.
 */
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Datos del sitio',
  type: 'document',
  icon: CogIcon,
  description:
    'Razón social, CUIT, domicilio, contacto y matrícula SSN. La home, el footer y las páginas legales usan estos datos; no se cargan valores de ejemplo.',
  groups: [
    {name: 'company', title: 'Empresa y contacto', default: true},
    {name: 'ssn', title: 'Matrícula SSN'},
  ],
  fields: [
    defineField({
      name: 'legalName',
      title: 'Razón social',
      type: 'string',
      group: 'company',
      description: 'Como figura en el estatuto y en el registro: incluye S.A., S.R.L. o la forma que corresponda.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'tradeName',
      title: 'Nombre comercial',
      type: 'string',
      group: 'company',
      description: 'Marca visible del sitio. No reemplaza a la razón social en los textos legales.',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'taxId',
      title: 'CUIT',
      type: 'string',
      group: 'company',
      description: 'Con o sin guiones. Se usa en el aviso legal.',
      validation: (rule) =>
        rule
          .required()
          .max(20)
          .custom((value) =>
            !value || /^\d{2}-?\d{8}-?\d$/.test(value)
              ? true
              : 'El CUIT tiene 11 dígitos (por ejemplo 30-71234567-8).',
          ),
    }),
    defineField({
      name: 'address',
      title: 'Domicilio legal',
      type: 'text',
      rows: 3,
      group: 'company',
      description: 'Calle, número, piso, localidad, provincia y código postal.',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'officeAddress',
      title: 'Domicilio de atención al público',
      type: 'text',
      rows: 3,
      group: 'company',
      description: 'Opcional. Si queda vacío, el sitio usa el domicilio legal.',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'phone',
      title: 'Teléfono',
      type: 'string',
      group: 'company',
      description: 'Con código de país, por ejemplo +54 11 5555 5555.',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'mapsUrl',
      title: 'Enlace del mapa',
      type: 'url',
      group: 'company',
      description:
        'Opcional. A dónde lleva el clic en el domicilio (Google Maps u otro mapa). Si queda vacío, el sitio arma una búsqueda en Google Maps con el domicilio.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'email',
      title: 'Email de contacto',
      type: 'string',
      group: 'company',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'privacyEmail',
      title: 'Email para derechos de datos',
      type: 'string',
      group: 'company',
      description:
        'Opcional. Canal para ejercer los derechos de la Ley 25.326. Si queda vacío, se usa el email de contacto.',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'website',
      title: 'Sitio web',
      type: 'url',
      group: 'company',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'jurisdiction',
      title: 'Jurisdicción',
      type: 'string',
      group: 'company',
      description:
        'Ciudad y provincia cuyos tribunales intervienen, por ejemplo Ciudad Autónoma de Buenos Aires. La redacción final la valida el abogado.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'ssnCondition',
      title: 'Condición registrada',
      type: 'string',
      group: 'ssn',
      description:
        'Como figura en el registro: Productor Asesor de Seguros, Sociedad de Productores Asesores de Seguros, Agente Institorio u otra.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'ssnRegistration',
      title: 'Matrícula SSN',
      type: 'string',
      group: 'ssn',
      description: 'Solo el número. El sitio antepone "Matrícula SSN N°".',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'ssnRegistry',
      title: 'Nombre del registro',
      type: 'string',
      group: 'ssn',
      description: 'Opcional: Registro de Sociedades de Productores Asesores de Seguros, etc.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'ssnUrl',
      title: 'Enlace del logo SSN',
      type: 'url',
      group: 'ssn',
      description: 'Destino del logo en el aviso legal, por ejemplo el sitio de la SSN o el registro.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'ssnLogo',
      title: 'Logo SSN',
      type: 'image',
      group: 'ssn',
      options: {hotspot: false},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Por ejemplo: Superintendencia de Seguros de la Nación.',
          validation: (rule) => rule.max(160),
        }),
      ],
    }),
    defineField({
      name: 'ssnShowInFooter',
      title: 'Mostrar el logo SSN en el footer',
      type: 'boolean',
      group: 'ssn',
      initialValue: false,
      description:
        'Activalo solo si las reglas de uso del logo lo permiten. La matrícula se muestra siempre que esté cargada.',
    }),
  ],
  preview: {
    select: {
      title: 'legalName',
      subtitle: 'taxId',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {title: title || 'Datos del sitio', subtitle: subtitle || 'Sin datos cargados'}
    },
  },
})
