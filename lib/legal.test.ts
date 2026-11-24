import { describe, expect, it } from 'vitest'
import {
  formatLegalDate,
  interpolateLegalText,
  legalPlainText,
  resolveLegalBlocks,
  resolveLegalPage,
} from '@/lib/legal'
import { LEGAL_DRAFTS } from '@/lib/legal-content'
import { LEGAL_ROUTES, legalHref } from '@/lib/legal-routes'
import { siteUrl } from '@/lib/site'
import { defaultSiteSettings, type SiteSettings } from '@/lib/site-settings'

/** Datos completos: el escenario en el que una página puede publicarse. */
const completeSettings: SiteSettings = {
  ...defaultSiteSettings,
  legalName: 'GROU Asesores S.R.L.',
  tradeName: 'GROU Asesores',
  taxId: '30-71234567-8',
  address: 'Av. Corrientes 1234, piso 5\nC1043 Ciudad Autónoma de Buenos Aires',
  officeAddress: 'Av. Corrientes 1234, piso 5',
  phone: '+54 11 5555 5555',
  email: 'contacto@example.com',
  privacyEmail: 'privacidad@example.com',
  website: 'https://grou.example.com',
  jurisdiction: 'Ciudad Autónoma de Buenos Aires',
  ssnCondition: 'Productor Asesor de Seguros',
  ssnRegistration: '12.345',
  ssnRegistry: 'Registro de Productores Asesores de Seguros',
}

describe('resolveLegalPage', () => {
  it('cae al borrador estático cuando el documento todavía no existe', () => {
    const page = resolveLegalPage('privacidad', null)
    const draft = LEGAL_DRAFTS.privacidad

    expect(page.title).toBe(draft.title)
    expect(page.body).toBe(draft.body)
    expect(page.seoDescription).toBe(draft.seoDescription)
    expect(page.seoTitle).toBe(draft.title)
    expect(page.lastUpdated).toBeNull()
    // Sin documento no hay aprobación: la página sigue siendo borrador.
  })

  it('prefiere los campos del documento y usa el borrador solo en los vacíos', () => {
    const body = [
      {
        _type: 'block',
        _key: 'doc-1',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 'doc-1-s0', text: 'Texto aprobado.', marks: [] }],
      },
    ]

    const page = resolveLegalPage('aviso-legal', {
      title: 'Aviso legal (revisado)',
      slug: 'aviso-legal',
      body,
      lastUpdated: '2026-11-12',
      seoTitle: '   ',
      seoDescription: 'Descripción del documento.',
    })

    expect(page.title).toBe('Aviso legal (revisado)')
    expect(page.body).toBe(body)
    expect(page.lastUpdated).toBe('2026-11-12')
    expect(page.seoDescription).toBe('Descripción del documento.')
    // Un SEO vacío cae al título resuelto, no a un texto en blanco.
    expect(page.seoTitle).toBe('Aviso legal (revisado)')
    expect(page.slug).toBe('aviso-legal')
  })
})

describe('interpolateLegalText', () => {
  it('reemplaza los token de datos del responsable', () => {
    const text = interpolateLegalText(
      'Titular {{legalName}} ({{tradeName}}), CUIT {{taxId}}, domicilio {{address}}, atención {{officeAddress}}, teléfono {{phone}}, email {{email}}, web {{website}}, jurisdicción {{jurisdiction}}.',
      completeSettings,
    )

    expect(text).toBe(
      'Titular GROU Asesores S.R.L. (GROU Asesores), CUIT 30-71234567-8, domicilio Av. Corrientes 1234, piso 5\nC1043 Ciudad Autónoma de Buenos Aires, atención Av. Corrientes 1234, piso 5, teléfono +54 11 5555 5555, email contacto@example.com, web https://grou.example.com, jurisdicción Ciudad Autónoma de Buenos Aires.',
    )
  })

  it('resuelve el canal de derechos de datos con el email dedicado y con el de contacto', () => {
    expect(interpolateLegalText('Derechos: {{dataRightsEmail}}', completeSettings)).toBe(
      'Derechos: privacidad@example.com',
    )
    expect(
      interpolateLegalText('Derechos: {{dataRightsEmail}}', { ...completeSettings, privacyEmail: '' }),
    ).toBe('Derechos: contacto@example.com')
  })

  it('arma la matrícula SSN y la condición con los datos del sitio', () => {
    expect(interpolateLegalText('{{ssn}} — {{ssnCondition}} — {{ssnRegistry}}', completeSettings)).toBe(
      'Matrícula SSN N° 12.345 — Productor Asesor de Seguros — Registro de Productores Asesores de Seguros',
    )
  })

  it('marca cada dato faltante como pendiente, con su etiqueta', () => {
    const settings: SiteSettings = {
      ...defaultSiteSettings,
      email: '',
      privacyEmail: '',
      website: '',
    }

    const text = interpolateLegalText(
      '{{legalName}}|{{taxId}}|{{address}}|{{officeAddress}}|{{phone}}|{{email}}|{{dataRightsEmail}}|{{ssn}}|{{ssnCondition}}|{{ssnRegistry}}|{{jurisdiction}}',
      settings,
    )

    expect(text).toBe(
      '[PENDIENTE: razón social]|[PENDIENTE: CUIT]|[PENDIENTE: domicilio legal]|[PENDIENTE: domicilio de atención al público]|[PENDIENTE: teléfono]|[PENDIENTE: email]|[PENDIENTE: email para derechos de datos]|[PENDIENTE: matrícula SSN]|[PENDIENTE: condición ante la SSN]|[PENDIENTE: registro SSN]|[PENDIENTE: jurisdicción]',
    )
  })

  it('no toca los token desconocidos', () => {
    expect(interpolateLegalText('Hola {{desconocido}} y {{legalName}}', completeSettings)).toBe(
      'Hola {{desconocido}} y GROU Asesores S.R.L.',
    )
  })

  it('cae a la URL canónica del sitio cuando no hay website configurado', () => {
    expect(interpolateLegalText('{{website}}', { ...completeSettings, website: '' })).toBe(siteUrl)
    // Un valor con solo espacios también cuenta como vacío.
    expect(interpolateLegalText('{{website}}', { ...completeSettings, website: '   ' })).toBe(siteUrl)
  })
})

describe('resolveLegalBlocks', () => {
  type TestBlock = { _type: string; _key: string; children: { text: string }[] }

  const blocks: unknown[] = [
    {
      _type: 'block',
      _key: 'b1',
      children: [
        { _type: 'span', _key: 's1', text: 'Titular: {{legalName}}' },
        { _type: 'span', _key: 's2', text: 'CUIT {{taxId}}.' },
      ],
    },
    { _type: 'image', _key: 'img1' },
  ]

  it('interpola el texto de cada span', () => {
    const resolved = resolveLegalBlocks(blocks, completeSettings) as unknown as TestBlock[]
    const first = resolved[0]

    expect(first.children[0].text).toBe('Titular: GROU Asesores S.R.L.')
    expect(first.children[1].text).toBe('CUIT 30-71234567-8.')
  })

  it('no muta la entrada y deja pasar los bloques que no son de texto', () => {
    const before = JSON.stringify(blocks)
    const resolved = resolveLegalBlocks(blocks, completeSettings) as unknown as TestBlock[]

    expect(JSON.stringify(blocks)).toBe(before)
    expect((blocks[0] as TestBlock).children[0].text).toBe('Titular: {{legalName}}')
    expect(resolved[0]).not.toBe(blocks[0])
    expect(resolved[1]).toBe(blocks[1])
  })
})

describe('formatLegalDate', () => {
  it('formatea la fecha sin corrimiento de día', () => {
    expect(formatLegalDate('2026-11-12')).toBe('12 de noviembre de 2026')
    expect(formatLegalDate('2026-01-01')).toBe('1 de enero de 2026')
  })

  it('devuelve null para valores vacíos o inválidos', () => {
    expect(formatLegalDate(null)).toBeNull()
    expect(formatLegalDate(undefined)).toBeNull()
    expect(formatLegalDate('')).toBeNull()
    expect(formatLegalDate('no-es-una-fecha')).toBeNull()
    expect(formatLegalDate('2026-13-45')).toBeNull()
  })
})


describe('legalPlainText', () => {
  it('encuentra una frase del aviso legal y otra de la política de privacidad', () => {
    const aviso = legalPlainText(LEGAL_DRAFTS['aviso-legal'].body)
    const privacidad = legalPlainText(LEGAL_DRAFTS.privacidad.body)

    expect(aviso).toContain('Titular del sitio')
    expect(privacidad).toContain('Responsable del tratamiento')
  })
})

describe('LEGAL_ROUTES', () => {
  it('tiene las páginas legales con sus hrefs', () => {
    expect(LEGAL_ROUTES).toHaveLength(2)
    expect(LEGAL_ROUTES.map((route) => legalHref(route.slug))).toEqual([
      '/legal/aviso-legal',
      '/legal/privacidad',
    ])
  })
})
