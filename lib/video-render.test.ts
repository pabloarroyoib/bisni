import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PostBody } from '@/components/post-body'

function render(...urls: string[]) {
  const body = urls.map((url, index) => ({ _type: 'video', _key: `k${index}`, url }))
  return renderToStaticMarkup(createElement(PostBody, { value: body }))
}

describe('PostBody · video por URL', () => {
  it('incrusta YouTube en todas sus variantes', () => {
    const html = render(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/abcdef12345',
      'https://www.youtube.com/embed/xyz9876543',
      'https://www.youtube.com/shorts/shortsId12',
      'https://m.youtube.com/watch?v=mmm1234567',
      'https://www.youtube.com/watch?v=withparams1&t=30s',
      'https://www.youtube.com/watch/?v=trailingSl1',
    )

    expect(html).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(html).toContain('https://www.youtube.com/embed/abcdef12345')
    expect(html).toContain('https://www.youtube.com/embed/xyz9876543')
    expect(html).toContain('https://www.youtube.com/embed/shortsId12')
    expect(html).toContain('https://www.youtube.com/embed/mmm1234567')
    expect(html).toContain('https://www.youtube.com/embed/withparams1')
    expect(html).toContain('https://www.youtube.com/embed/trailingSl1')
  })

  it('incrusta Vimeo, canales y enlaces no listados (hash)', () => {
    const html = render(
      'https://vimeo.com/123456789',
      'https://vimeo.com/channels/staffpicks/987654321',
      'https://player.vimeo.com/video/555555555',
      'https://vimeo.com/444444444/abc123def',
      'https://player.vimeo.com/video/333333333?h=hashFromQuery',
    )

    expect(html).toContain('https://player.vimeo.com/video/123456789')
    expect(html).toContain('https://player.vimeo.com/video/987654321')
    expect(html).toContain('https://player.vimeo.com/video/555555555')
    expect(html).toContain('https://player.vimeo.com/video/444444444?h=abc123def')
    expect(html).toContain('https://player.vimeo.com/video/333333333?h=hashFromQuery')
  })

  it('incrusta Google Drive', () => {
    const html = render(
      'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing',
      'https://drive.google.com/open?id=1ZyXwVuTsRqPoNmLkJiHgFeDcBa',
    )

    expect(html).toContain('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/preview')
    expect(html).toContain('https://drive.google.com/file/d/1ZyXwVuTsRqPoNmLkJiHgFeDcBa/preview')
  })

  it('usa <video> solo para archivos de video directos', () => {
    const html = render('https://example.com/clip.mp4', 'https://cdn.example.com/a.webm?v=2')

    expect((html.match(/<video/g) ?? []).length).toBe(2)
    expect(html).toContain('https://example.com/clip.mp4')
    expect(html).toContain('https://cdn.example.com/a.webm?v=2')
  })

  it('ignora URLs vacías y páginas que no son video', () => {
    const html = render('', 'https://example.com/not-a-video', 'no-es-una-url')
    expect(html).not.toContain('video-container')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('<video')
  })

  it('envuelve cada embed en .video-container', () => {
    const html = render('https://youtu.be/abcdef12345', 'https://vimeo.com/123456789')
    expect((html.match(/video-container/g) ?? []).length).toBe(2)
    expect((html.match(/<iframe/g) ?? []).length).toBe(2)
  })
})
