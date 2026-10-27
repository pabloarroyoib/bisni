'use client'

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f5f8f7',
          color: '#14262d',
          fontFamily: 'Arial, Helvetica, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3d999d' }}>
            Error inesperado
          </p>
          <h1 style={{ fontSize: 32, lineHeight: 1.1, margin: '12px 0' }}>
            Algo ha fallado por nuestra parte.
          </h1>
          <p style={{ color: '#5f7778', lineHeight: 1.6, fontSize: 14 }}>
            Vuelve a intentarlo. Si el problema continúa, escríbenos a{' '}
            <a href="mailto:hola@bisni.es" style={{ color: '#319da7' }}>
              hola@bisni.es
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 20,
              padding: '12px 18px',
              border: 0,
              borderRadius: 3,
              background: '#14262d',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
          {error.digest ? (
            <p style={{ marginTop: 16, fontSize: 11, color: '#8ba09e' }}>Referencia: {error.digest}</p>
          ) : null}
        </div>
      </body>
    </html>
  )
}
