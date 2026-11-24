import {getCliClient} from 'sanity/cli'
import {plainMissionBlocks} from '../lib/mission-content'

/**
 * Migra `homePage.about.mission` de string a Portable Text.
 *
 * El campo pasó de `text` a `missionContent` para poder enlazar nombres de
 * compañías o redes dentro del párrafo. Sanity no convierte el valor viejo, y un
 * string en un campo de tipo array deja el documento inválido en el Studio
 * (bloquea publicar), así que hay que reemplazarlo por bloques equivalentes.
 *
 * Es idempotente: si el campo ya es un array, no hace nada.
 *
 * Uso: npx sanity exec scripts/patch-about-mission.ts --with-user-token
 */

const client = getCliClient({apiVersion: '2026-10-20'})

async function main() {
  const mission = await client.fetch<unknown>(`*[_id == "homePage"][0].about.mission`)

  if (mission === null || mission === undefined) {
    console.log('homePage no tiene `about.mission`: nada que migrar.')
    return
  }

  if (Array.isArray(mission)) {
    console.log('`about.mission` ya es Portable Text: nada que hacer.')
    return
  }

  if (typeof mission !== 'string') {
    throw new Error(`Tipo inesperado en about.mission: ${typeof mission}`)
  }

  await client
    .patch('homePage')
    .set({'about.mission': plainMissionBlocks(mission)})
    .commit()

  console.log(`about.mission migrado a Portable Text (${mission.length} caracteres).`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
