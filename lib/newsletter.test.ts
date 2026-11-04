import { describe, expect, it } from 'vitest'
import { validateNewsletterInput } from '@/lib/newsletter'

const validInput = {
  email: 'Marta@Acme.com',
  name: 'Marta Ruiz',
}

describe('validateNewsletterInput', () => {
  it('acepta un envío válido y normaliza el email y el nombre', () => {
    const result = validateNewsletterInput({ email: '  Marta@Acme.com  ', name: '  Marta Ruiz  ' })

    expect(result).toEqual({
      ok: true,
      data: { email: 'marta@acme.com', name: 'Marta Ruiz' },
    })
  })

  it('no pasa el nombre a minúsculas', () => {
    const result = validateNewsletterInput({ ...validInput, name: 'MARTA Ruiz' })

    expect(result).toEqual({
      ok: true,
      data: { email: 'marta@acme.com', name: 'MARTA Ruiz' },
    })
  })

  it('exige el email', () => {
    const result = validateNewsletterInput({ ...validInput, email: '' })

    expect(result).toEqual({
      ok: false,
      errors: { email: 'Indica tu email.' },
    })
  })

  it('exige el nombre', () => {
    const result = validateNewsletterInput({ ...validInput, name: '' })

    expect(result).toEqual({
      ok: false,
      errors: { name: 'Indica tu nombre.' },
    })
  })

  it('rechaza un nombre de un solo carácter', () => {
    const result = validateNewsletterInput({ ...validInput, name: 'M' })

    expect(result).toEqual({
      ok: false,
      errors: { name: 'Indica tu nombre.' },
    })
  })

  it('rechaza un nombre que solo tiene espacios', () => {
    const result = validateNewsletterInput({ ...validInput, name: '   ' })

    expect(result).toEqual({
      ok: false,
      errors: { name: 'Indica tu nombre.' },
    })
  })

  it('acepta un nombre de 120 caracteres', () => {
    const name = 'a'.repeat(120)
    expect(name).toHaveLength(120)

    const result = validateNewsletterInput({ ...validInput, name })

    expect(result).toEqual({ ok: true, data: { email: 'marta@acme.com', name } })
  })

  it('rechaza un nombre de 121 caracteres', () => {
    const name = 'a'.repeat(121)
    expect(name).toHaveLength(121)

    const result = validateNewsletterInput({ ...validInput, name })

    expect(result).toEqual({
      ok: false,
      errors: { name: 'El nombre es demasiado largo.' },
    })
  })

  it('rechaza un email sin dominio de nivel superior', () => {
    const result = validateNewsletterInput({ ...validInput, email: 'hola@bisni' })

    expect(result).toEqual({
      ok: false,
      errors: { email: 'El email no parece válido.' },
    })
  })

  it('acepta un email de 254 caracteres', () => {
    const email = `${'a'.repeat(242)}@example.com`
    expect(email).toHaveLength(254)

    const result = validateNewsletterInput({ ...validInput, email })

    expect(result).toEqual({ ok: true, data: { email, name: 'Marta Ruiz' } })
  })

  it('rechaza un email de 255 caracteres', () => {
    const email = `${'a'.repeat(243)}@example.com`
    expect(email).toHaveLength(255)

    const result = validateNewsletterInput({ ...validInput, email })

    expect(result).toEqual({
      ok: false,
      errors: { email: 'El email no parece válido.' },
    })
  })

  it('descarta envíos que rellenan el honeypot', () => {
    const result = validateNewsletterInput({ ...validInput, website: 'https://spam.example' })

    expect(result).toEqual({
      ok: false,
      errors: { email: 'Envío rechazado.' },
    })
  })

  it('ignora un honeypot que solo tiene espacios', () => {
    const result = validateNewsletterInput({ ...validInput, website: '   ' })

    expect(result).toEqual({
      ok: true,
      data: { email: 'marta@acme.com', name: 'Marta Ruiz' },
    })
  })

  it('tolera valores que no son strings', () => {
    const result = validateNewsletterInput({ ...validInput, email: [], name: 42 })

    expect(result).toEqual({
      ok: false,
      errors: { email: 'Indica tu email.', name: 'Indica tu nombre.' },
    })
  })
})
