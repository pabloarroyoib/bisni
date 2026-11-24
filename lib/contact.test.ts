import { describe, expect, it } from 'vitest'
import { validateContactInput } from '@/lib/contact'

const validInput = {
  name: 'Marta Ruiz',
  company: 'Acme SL',
  email: 'Marta@Acme.com',
  message: 'Necesitamos revisar nuestra matriz de riesgos.',
}

describe('validateContactInput', () => {
  it('acepta un envío válido y normaliza los campos', () => {
    const result = validateContactInput({ ...validInput, name: '  Marta Ruiz  ' })

    expect(result).toEqual({
      ok: true,
      data: {
        name: 'Marta Ruiz',
        company: 'Acme SL',
        email: 'marta@acme.com',
        phone: '',
        message: 'Necesitamos revisar nuestra matriz de riesgos.',
      },
    })
  })

  it('rechaza campos vacíos con mensajes por campo', () => {
    const result = validateContactInput({})

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(Object.keys(result.errors).sort()).toEqual(['company', 'email', 'message', 'name'])
  })

  it('acepta un teléfono válido y lo devuelve recortado', () => {
    const result = validateContactInput({ ...validInput, phone: '  +54 387 555-1234  ' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.phone).toBe('+54 387 555-1234')
  })

  it('rechaza un teléfono con letras o demasiado corto', () => {
    const conLetras = validateContactInput({ ...validInput, phone: 'llamame' })
    expect(conLetras.ok).toBe(false)
    if (!conLetras.ok) expect(conLetras.errors.phone).toBe('El teléfono no parece válido.')

    const corto = validateContactInput({ ...validInput, phone: '123' })
    expect(corto.ok).toBe(false)
    if (!corto.ok) expect(corto.errors.phone).toBe('El teléfono no parece válido.')
  })

  it('rechaza emails inválidos', () => {
    const result = validateContactInput({ ...validInput, email: 'no-es-un-email' })

    expect(result).toEqual({
      ok: false,
      errors: { email: 'El email no parece válido.' },
    })
  })

  it('rechaza mensajes demasiado cortos', () => {
    const result = validateContactInput({ ...validInput, message: 'Hola' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.message).toBeDefined()
  })

  it('rechaza mensajes demasiado largos', () => {
    const result = validateContactInput({ ...validInput, message: 'a'.repeat(5001) })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.message).toBe('El mensaje es demasiado largo.')
  })

  it('descarta envíos que rellenan el honeypot', () => {
    const result = validateContactInput({ ...validInput, website: 'https://spam.example' })
    expect(result.ok).toBe(false)
  })

  it('tolera valores que no son strings', () => {
    const result = validateContactInput({ name: 42, company: null, email: [], message: {} })
    expect(result.ok).toBe(false)
  })
})
