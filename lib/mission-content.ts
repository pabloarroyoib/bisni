/**
 * Texto corto con enlaces (Portable Text mínimo).
 *
 * La «Misión» de Nosotros se edita en el Studio con enlaces, pero también tiene
 * que funcionar cuando el documento no existe y se usa el texto por defecto del
 * código, que es un string plano. Estas funciones convierten uno en otro sin
 * duplicar la lógica en el resolver y en los defaults.
 */

export type MissionSpan = {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

export type MissionBlock = {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: never[]
  children: MissionSpan[]
}

export type MissionBlocks = MissionBlock[]

/** Convierte un texto plano en párrafos: una línea en blanco separa bloques. */
export function plainMissionBlocks(value: string): MissionBlocks {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: 'block' as const,
      _key: `mission-${index}`,
      style: 'normal' as const,
      markDefs: [],
      children: [
        {
          _type: 'span' as const,
          _key: `mission-${index}-span`,
          text: paragraph,
          marks: [],
        },
      ],
    }))
}

/**
 * Prefiere los bloques del Studio; si vienen vacíos o con otra forma, cae al
 * texto por defecto. Nunca devuelve una lista vacía: la sección siempre muestra
 * algo.
 */
export function missionBlocks(value: unknown, fallback: MissionBlocks | string): MissionBlocks {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(
      (block): block is MissionBlock =>
        typeof block === 'object' && block !== null && (block as {_type?: string})._type === 'block',
    )
  }

  // Compatibilidad: el campo fue texto plano antes de tener enlaces. Un
  // documento viejo (o una caché) puede traer el string; se convierte igual.
  if (typeof value === 'string' && value.trim() !== '') {
    return plainMissionBlocks(value)
  }

  return typeof fallback === 'string' ? plainMissionBlocks(fallback) : fallback
}
