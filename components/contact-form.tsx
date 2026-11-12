'use client'

import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import type { ContactErrors } from '@/lib/contact'
import type { ContactFormContent } from '@/lib/home-content'

type Status = 'idle' | 'sending' | 'success' | 'error'

const GENERIC_ERROR = 'No hemos podido enviar tu consulta. Inténtalo de nuevo en unos minutos.'

export function ContactForm({ copy }: { copy: ContactFormContent }) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<ContactErrors>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: data.get('name'),
      company: data.get('company'),
      email: data.get('email'),
      message: data.get('message'),
      website: data.get('website'),
    }

    setStatus('sending')
    setMessage('')
    setErrors({})

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        errors?: ContactErrors
        error?: string
        retryAfter?: number
      }

      if (response.ok && result.ok) {
        form.reset()
        setStatus('success')
        setMessage('Gracias. Hemos recibido tu mensaje y te responderemos en breve.')
        return
      }

      if (response.status === 422 && result.errors) {
        setErrors(result.errors)
        setStatus('error')
        setMessage('Revisa los campos marcados.')
        return
      }

      if (response.status === 429) {
        setStatus('error')
        setMessage(
          `Has enviado demasiadas consultas seguidas. Espera ${result.retryAfter ?? 60} segundos e inténtalo de nuevo.`,
        )
        return
      }

      if (response.status === 503) {
        setStatus('error')
        setMessage('El formulario no está disponible ahora mismo. Escríbenos a hola@bisni.es.')
        return
      }

      setStatus('error')
      setMessage(GENERIC_ERROR)
    } catch {
      setStatus('error')
      setMessage(GENERIC_ERROR)
    }
  }

  const sending = status === 'sending'

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label>
          {copy.nameLabel}
          <input name="name" required placeholder={copy.namePlaceholder} autoComplete="name" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>
          {copy.companyLabel}
          <input name="company" required placeholder={copy.companyPlaceholder} autoComplete="organization" />
          {errors.company && <span className="field-error">{errors.company}</span>}
        </label>
      </div>
      <label>
        {copy.emailLabel}
        <input name="email" required type="email" placeholder={copy.emailPlaceholder} autoComplete="email" />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </label>
      <label>
        {copy.messageLabel}
        <textarea name="message" required placeholder={copy.messagePlaceholder} rows={4} />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </label>

      {/* Honeypot anti-bots: invisible para personas, tentador para scripts. */}
      <div className="form-honeypot" aria-hidden="true">
        <label>
          No rellenar
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button className="button button-primary" type="submit" disabled={sending}>
        {sending ? copy.sendingLabel : copy.submitLabel} <ArrowUpRight aria-hidden="true" />
      </button>

      {message && (
        <p
          className={`form-status ${status === 'success' ? 'is-success' : 'is-error'}`}
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {message}
        </p>
      )}

      <p className="privacy-note"><Check aria-hidden="true" /> {copy.privacyNote}</p>
    </form>
  )
}
