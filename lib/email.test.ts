import { describe, expect, it } from 'vitest'
import { CONTACT_EMAIL, CONTACT_SUBJECT, gmailComposeUrl, mailtoHref } from '@/lib/email'

describe('mailtoHref', () => {
  it('arma un mailto con el destinatario y el asunto por defecto', () => {
    const href = mailtoHref()
    expect(href.startsWith(`mailto:${CONTACT_EMAIL}?subject=`)).toBe(true)
    expect(decodeURIComponent(href.split('subject=')[1])).toBe(CONTACT_SUBJECT)
  })

  it('respeta destinatario y asunto propios', () => {
    expect(mailtoHref('otro@bisni.es', 'Hola')).toBe('mailto:otro@bisni.es?subject=Hola')
  })

  it('codifica el asunto para que sea una URL válida', () => {
    const href = mailtoHref(CONTACT_EMAIL, 'Consulta sobre riesgo & cumplimiento')
    expect(href).not.toContain(' ')
    expect(href).toContain('%20%26%20')
    expect(decodeURIComponent(href)).toBe(`mailto:${CONTACT_EMAIL}?subject=Consulta sobre riesgo & cumplimiento`)
  })

  it('omite el asunto cuando viene vacío', () => {
    expect(mailtoHref(CONTACT_EMAIL, '')).toBe(`mailto:${CONTACT_EMAIL}`)
  })
})

describe('gmailComposeUrl', () => {
  it('arma el compose web de Gmail con destinatario y asunto', () => {
    const url = new URL(gmailComposeUrl())
    expect(url.origin + url.pathname).toBe('https://mail.google.com/mail/')
    expect(url.searchParams.get('view')).toBe('cm')
    expect(url.searchParams.get('to')).toBe(CONTACT_EMAIL)
    expect(url.searchParams.get('su')).toBe(CONTACT_SUBJECT)
  })

  it('respeta un destinatario y un asunto propios', () => {
    const url = new URL(gmailComposeUrl('otro@bisni.es', 'Prueba'))
    expect(url.searchParams.get('to')).toBe('otro@bisni.es')
    expect(url.searchParams.get('su')).toBe('Prueba')
  })

  it('omite el asunto cuando viene vacío', () => {
    const url = new URL(gmailComposeUrl(CONTACT_EMAIL, ''))
    expect(url.searchParams.has('su')).toBe(false)
  })
})
