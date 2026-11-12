import { describe, expect, it } from 'vitest'
import { defaultHomeContent } from '@/lib/content-defaults'
import { resolveHomeContent, type SanityHomePage } from '@/lib/home-content'

describe('resolveHomeContent', () => {
  it('devuelve los defaults cuando el documento no existe', () => {
    expect(resolveHomeContent(null)).toEqual(defaultHomeContent)
    expect(resolveHomeContent(undefined)).toEqual(defaultHomeContent)
  })

  it('usa los textos editados y completa con el default los campos vacíos', () => {
    const content = resolveHomeContent({
      hero: { title: '  Nuevo título  ', paragraph: '' },
    })

    expect(content.hero.title).toBe('Nuevo título')
    expect(content.hero.paragraph).toBe(defaultHomeContent.hero.paragraph)
  })

  it('ignora los campos que ya no existen en el contenido publicado', () => {
    // El documento viejo sigue teniendo estos campos guardados; el resolver no
    // debe dejarlos pasar al componente.
    const stale = {
      hero: { kicker: 'Viejo antetítulo' },
      about: { label: 'Vieja etiqueta', slides: [{ caption: 'Vieja bajada' }] },
      newsletter: { intro: 'Viejo intro' },
    } as unknown as SanityHomePage

    const content = resolveHomeContent(stale)

    expect(content.hero).not.toHaveProperty('kicker')
    expect(content.about).not.toHaveProperty('label')
    expect(content.about.slides[0]).not.toHaveProperty('caption')
    expect(content.newsletter).not.toHaveProperty('intro')
  })

  it('resuelve las redes del navbar y respeta una lista vacía', () => {
    const content = resolveHomeContent({
      nav: {
        socials: [{ network: 'whatsapp', href: 'https://wa.me/message/V56AOY6RHJMDH1' }],
      },
    })

    expect(content.navSocials).toEqual([
      { network: 'whatsapp', href: 'https://wa.me/message/V56AOY6RHJMDH1' },
    ])
    expect(resolveHomeContent({ nav: { socials: [] } }).navSocials).toEqual([])
    expect(resolveHomeContent(null).navSocials).toEqual(defaultHomeContent.navSocials)
  })

  it('no deja secciones vacías cuando los arrays llegan vacíos', () => {
    const content = resolveHomeContent({
      hero: { cards: [] },
      stages: { stages: [] },
      about: { slides: [] },
      risks: { sections: [] },
      footer: { linkGroups: [] },
      nav: { items: [] },
    })

    expect(content.hero.cards).toEqual(defaultHomeContent.hero.cards)
    expect(content.stages.stages).toEqual(defaultHomeContent.stages.stages)
    expect(content.about.slides).toEqual(defaultHomeContent.about.slides)
    expect(content.risks.sections).toEqual(defaultHomeContent.risks.sections)
    expect(content.footer.linkGroups).toEqual(defaultHomeContent.footer.linkGroups)
    expect(content.nav).toEqual(defaultHomeContent.nav)
  })

  it('mapea la imagen de Sanity al CDN y usa la imagen default si falta', () => {
    const content = resolveHomeContent({
      about: {
        slides: [
          {
            image: { asset: { _ref: 'image-abc123-1200x1500-jpg' } },
            alt: 'Nuevo alt',
            title: 'Nuevo título',
            isLogo: false,
          },
        ],
      },
    })

    expect(content.about.slides).toHaveLength(3)
    expect(content.about.slides[0].src).toMatch(
      /^https:\/\/cdn\.sanity\.io\/images\/test-project\/test-dataset\//,
    )
    expect(content.about.slides[0]).toMatchObject({
      alt: 'Nuevo alt',
      title: 'Nuevo título',
      isLogo: false,
    })
    expect(content.about.slides[1]).toEqual(defaultHomeContent.about.slides[1])
  })

  it('respeta isLogo y el aire del logo', () => {
    const content = resolveHomeContent({
      about: {
        slides: [
          {
            image: { asset: { _ref: 'image-abc123-1200x1500-jpg' } },
            isLogo: true,
            pad: 9,
          },
        ],
      },
    })

    expect(content.about.slides[0].isLogo).toBe(true)
    expect(content.about.slides[0].pad).toBe(9)
  })

  it('no muestra más de tres slides', () => {
    const slides = Array.from({ length: 4 }, (_, index) => ({
      image: { asset: { _ref: `image-abc${index}-1200x1500-jpg` } },
      alt: `Slide ${index}`,
    }))

    expect(resolveHomeContent({ about: { slides } }).about.slides).toHaveLength(3)
  })

  it('mezcla las secciones de riesgos por campo y conserva el nivel de subs', () => {
    const content = resolveHomeContent({
      risks: {
        sections: [
          null,
          { subs: [{ title: 'Riesgos laborales', paragraphs: ['Solo uno'] }] },
        ],
      },
    })

    expect(content.risks.sections[0]).toEqual(defaultHomeContent.risks.sections[0])
    expect(content.risks.sections[1].title).toBe(defaultHomeContent.risks.sections[1].title)
    expect(content.risks.sections[1].subs?.[0]).toMatchObject({
      title: 'Riesgos laborales',
      paragraphs: ['Solo uno'],
    })
    expect(content.risks.sections[1].subs?.[0].terms).toEqual(
      defaultHomeContent.risks.sections[1].subs?.[0].terms,
    )
  })

  it('permite agregar áreas de riesgo sin perder los defaults de las existentes', () => {
    const content = resolveHomeContent({
      risks: {
        sections: [null, null, null, { title: 'Nueva área', paragraphs: ['Texto nuevo'] }],
      },
    })

    expect(content.risks.sections).toHaveLength(4)
    expect(content.risks.sections[2]).toEqual(defaultHomeContent.risks.sections[2])
    expect(content.risks.sections[3]).toMatchObject({
      title: 'Nueva área',
      paragraphs: ['Texto nuevo'],
    })
  })

  it('completa navegación y footer con los defaults cuando el documento no los trae', () => {
    const content = resolveHomeContent({ hero: { title: 'Solo el hero' } })

    expect(content.nav).toEqual(defaultHomeContent.nav)
    expect(content.footer).toEqual(defaultHomeContent.footer)
    expect(content.newsletter).toEqual(defaultHomeContent.newsletter)
    expect(content.contact).toEqual(defaultHomeContent.contact)
  })

  it('acepta items de navegación extra y conserva el estilo de botón', () => {
    const content = resolveHomeContent({
      nav: {
        items: [
          { label: 'Inicio', href: '#inicio' },
          { label: 'Blog', href: '/blog' },
          { label: 'Nueva', href: '' },
          { label: 'Suscribirse', href: '#newsletter', variant: 'button' },
        ],
      },
    })

    expect(content.nav).toEqual([
      { label: 'Inicio', href: '#inicio', variant: 'link' },
      { label: 'Blog', href: '/blog', variant: 'link' },
      { label: 'Nueva', href: '', variant: 'link' },
      { label: 'Suscribirse', href: '#newsletter', variant: 'button' },
    ])
  })

  it('conserva los saltos de línea de los títulos', () => {
    const content = resolveHomeContent({
      blog: { title: 'Ideas para navegar\nlo que viene.' },
    })

    expect(content.blog.title).toBe('Ideas para navegar\nlo que viene.')
    expect(content.blog.kicker).toBe(defaultHomeContent.blog.kicker)
  })

  it('ignora íconos fuera de la lista cerrada', () => {
    const content = resolveHomeContent({
      stages: { stages: [{ icon: 'otro' }] },
      contact: { details: [{ icon: 'otro' }] },
    })

    expect(content.stages.stages[0].icon).toBe(defaultHomeContent.stages.stages[0].icon)
    expect(content.contact.details[0].icon).toBe(defaultHomeContent.contact.details[0].icon)
  })

  it('resuelve el copy del formulario de contacto y completa los campos vacíos', () => {
    const content = resolveHomeContent({
      contact: { form: { emailLabel: 'Correo', messagePlaceholder: 'Nuevo texto' } },
    })

    expect(content.contact.form.emailLabel).toBe('Correo')
    expect(content.contact.form.messagePlaceholder).toBe('Nuevo texto')
    expect(content.contact.form.messageLabel).toBe(defaultHomeContent.contact.form.messageLabel)
    expect(content.contact.form.privacyNote).toBe(defaultHomeContent.contact.form.privacyNote)
  })

  it('el copy inicial del formulario usa Email y el placeholder pedido', () => {
    const form = resolveHomeContent(null).contact.form

    expect(form.emailLabel).toBe('Email')
    expect(form.messagePlaceholder).toBe(
      'Cuéntanos brevemente tu reto, consulta o comentario',
    )
  })

  it('mantiene el puente de la newsletter y el CTA de nosotros', () => {
    const content = resolveHomeContent({
      newsletter: { bridgeText: '¿Otro puente?' },
      about: { cta: { label: 'Escribinos' } },
    })

    expect(content.newsletter.bridgeText).toBe('¿Otro puente?')
    expect(content.newsletter.bridgeLink).toEqual(defaultHomeContent.newsletter.bridgeLink)
    expect(content.about.cta).toEqual({
      label: 'Escribinos',
      href: defaultHomeContent.about.cta.href,
    })
  })

  it('cae al default si el raw no es un objeto', () => {
    expect(resolveHomeContent('no es un documento' as unknown as SanityHomePage)).toEqual(
      defaultHomeContent,
    )
  })
})
