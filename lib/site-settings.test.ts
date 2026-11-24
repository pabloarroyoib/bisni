import { describe, expect, it } from 'vitest'
import { CONTACT_EMAIL, CONTACT_SUBJECT, mailtoHref } from '@/lib/email'
import {
  buildContactDetails,
  contactAddress,
  dataRightsEmail,
  defaultSiteSettings,
  hasSsnData,
  isSiteSettingsComplete,
  mapSiteSettings,
  ssnRegistrationLabel,
  type SiteSettings,
} from '@/lib/site-settings'

const completeSettings: SiteSettings = {
  ...defaultSiteSettings,
  legalName: 'GROU Asesores S.R.L.',
  taxId: '30-71234567-8',
  address: 'Av. Corrientes 1234, piso 5\nC1043 Ciudad Autónoma de Buenos Aires',
  phone: '+54 11 5555 5555',
  email: 'contacto@example.com',
  privacyEmail: 'privacidad@example.com',
  jurisdiction: 'Ciudad Autónoma de Buenos Aires',
  ssnCondition: 'Productor Asesor de Seguros',
  ssnRegistration: '12.345',
  ssnRegistry: 'Registro de Sociedades de Productores Asesores de Seguros',
  ssnUrl: 'https://www.ssn.gob.ar',
}

describe('siteSettings', () => {
  it('no inventa datos legales: los defaults no traen razón social, CUIT ni matrícula', () => {
    expect(defaultSiteSettings.legalName).toBe('')
    expect(defaultSiteSettings.taxId).toBe('')
    expect(defaultSiteSettings.address).toBe('')
    expect(defaultSiteSettings.ssnCondition).toBe('')
    expect(defaultSiteSettings.ssnRegistration).toBe('')
    expect(defaultSiteSettings.ssnLogo).toBeNull()
    expect(defaultSiteSettings.ssnShowInFooter).toBe(false)
    // El único dato real disponible hoy es el buzón que recibe las consultas.
    expect(defaultSiteSettings.email).toBe(CONTACT_EMAIL)
  })

  it('marca los datos como incompletos mientras falten campos legales', () => {
    expect(isSiteSettingsComplete(defaultSiteSettings)).toBe(false)
    expect(isSiteSettingsComplete(completeSettings)).toBe(true)
    expect(isSiteSettingsComplete({ ...completeSettings, taxId: '' })).toBe(false)
    expect(isSiteSettingsComplete({ ...completeSettings, email: '' })).toBe(false)
  })

  it('detecta si hay matrícula y condición para el aviso legal', () => {
    expect(hasSsnData(defaultSiteSettings)).toBe(false)
    expect(hasSsnData({ ...completeSettings, ssnCondition: '' })).toBe(false)
    expect(hasSsnData(completeSettings)).toBe(true)
  })

  it('normaliza y recorta los valores que llegan de Sanity', () => {
    const settings = mapSiteSettings({
      legalName: '  GROU Asesores S.R.L.  ',
      taxId: ' 30-71234567-8 ',
      address: '  Av. Corrientes 1234  ',
      email: '',
      ssnShowInFooter: true,
    })

    expect(settings.legalName).toBe('GROU Asesores S.R.L.')
    expect(settings.taxId).toBe('30-71234567-8')
    expect(settings.address).toBe('Av. Corrientes 1234')
    // Un email vacío cae al buzón real, no a un valor inventado.
    expect(settings.email).toBe(CONTACT_EMAIL)
    expect(settings.ssnShowInFooter).toBe(true)
  })

  it('devuelve los defaults cuando todavía no hay documento', () => {
    expect(mapSiteSettings(null)).toEqual(defaultSiteSettings)
    expect(mapSiteSettings(undefined)).toEqual(defaultSiteSettings)
  })

  it('mapea el logo SSN al CDN de Sanity y usa un alt genérico si falta', () => {
    const settings = mapSiteSettings({
      ssnLogo: { asset: { _ref: 'image-abc123-400x200-png' } },
    })

    expect(settings.ssnLogo?.url).toContain('cdn.sanity.io')
    expect(settings.ssnLogo?.url).toContain('abc123')
    expect(settings.ssnLogo?.alt).toBe('Superintendencia de Seguros de la Nación')
  })

  it('compone los datos de contacto y omite los que están vacíos', () => {
    expect(buildContactDetails(defaultSiteSettings).map((detail) => detail.icon)).toEqual(['mail'])

    const details = buildContactDetails({
      ...defaultSiteSettings,
      address: 'Domicilio legal 1',
      officeAddress: 'Oficina 2',
      phone: '+54 11 5555 5555',
    })

    expect(details.map((detail) => detail.icon)).toEqual(['map', 'mail', 'phone'])
    expect(details[0].text).toBe('Oficina 2')
    expect(details[1].text).toBe(CONTACT_EMAIL)
    expect(details[1].href).toBe(mailtoHref(CONTACT_EMAIL, CONTACT_SUBJECT))
  })

  it('usa el domicilio legal cuando no hay uno de atención al público', () => {
    const details = buildContactDetails({ ...defaultSiteSettings, address: 'Domicilio legal 1' })
    // El domicilio también enlaza al mapa: search por dirección si no hay `mapsUrl`.
    expect(details[0]).toEqual({
      icon: 'map',
      text: 'Domicilio legal 1',
      href: 'https://www.google.com/maps/search/?api=1&query=Domicilio%20legal%201',
    })
  })

  it('prefiere el email de privacidad para los derechos de datos', () => {
    expect(dataRightsEmail(defaultSiteSettings)).toBe(CONTACT_EMAIL)
    expect(dataRightsEmail(completeSettings)).toBe('privacidad@example.com')
  })

  it('arma la línea de matrícula solo cuando hay número', () => {
    expect(ssnRegistrationLabel(defaultSiteSettings)).toBeNull()
    expect(ssnRegistrationLabel(completeSettings)).toBe('Matrícula SSN N° 12.345')
  })
})

describe('enlaces de contacto', () => {
  it('el domicilio enlaza al mapa configurado o a una búsqueda', () => {
    const conMapa = buildContactDetails({ ...completeSettings, mapsUrl: 'https://maps.app.goo.gl/abc' })
    expect(conMapa.find((detail) => detail.icon === 'map')?.href).toBe('https://maps.app.goo.gl/abc')

    const sinMapa = buildContactDetails({ ...completeSettings, mapsUrl: '' })
    expect(sinMapa.find((detail) => detail.icon === 'map')?.href).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactAddress(completeSettings))}`,
    )
  })

  it('el teléfono enlaza a tel: conservando el prefijo +', () => {
    const fijo = buildContactDetails({ ...completeSettings, phone: '387 555-1234' })
    expect(fijo.find((detail) => detail.icon === 'phone')?.href).toBe('tel:3875551234')

    const internacional = buildContactDetails({ ...completeSettings, phone: '+54 387 555-1234' })
    expect(internacional.find((detail) => detail.icon === 'phone')?.href).toBe('tel:+543875551234')
  })
})
