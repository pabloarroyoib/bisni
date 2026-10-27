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
