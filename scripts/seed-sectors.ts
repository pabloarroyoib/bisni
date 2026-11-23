import { getCliClient } from 'sanity/cli'
import { exampleSectors } from '../lib/sector-defaults'

/**
 * Seed de los sectores.
 *
 * Crea un documento `sector` por cada ejemplo de `lib/sector-defaults.ts` con
 * `reviewed: false`: el texto de ejemplo queda cargado y editable en el Studio,
 * pero la página se muestra como borrador y no se indexa hasta que el cliente
 * reemplace el copy y active «Contenido aprobado».
 *
 * Es idempotente y NO pisa contenido: usa `createIfNotExists`. Cuando el cliente
 * ya editó un sector, volver a correrlo no lo modifica. Para sumar una industria
 * nueva alcanza con crearla en el Studio (Lista → Sectores → Crear).
 *
 * Uso: npx sanity exec scripts/seed-sectors.ts --with-user-token
 */

const client = getCliClient({ apiVersion: '2026-10-20' })

async function main() {
  for (const sector of exampleSectors) {
    const doc = await client.createIfNotExists({
      _id: `sector-${sector.slug}`,
      _type: 'sector',
      title: sector.title,
      slug: { _type: 'slug', current: sector.slug },
      summary: sector.summary,
      body: sector.body,
      order: 0,
      reviewed: false,
      seoTitle: sector.seoTitle,
      seoDescription: sector.seoDescription,
    })
    console.log(`documento ${doc._id}: ${doc._type} listo (borrador, reviewed=false)`)
  }

  console.log(
    'Seed de sectores completado. Reemplazá el copy de ejemplo y activá "Contenido aprobado" cuando el cliente lo valide.',
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
