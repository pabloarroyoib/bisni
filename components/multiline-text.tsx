import { Fragment } from 'react'

/**
 * Respeta los saltos de línea que el cliente escribe en el Studio sin cambiar
 * el flujo del texto: los títulos de dos líneas del diseño se siguen partiendo
 * en el mismo lugar.
 */
export function MultilineText({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  )
}
