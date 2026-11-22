import { getCliClient } from 'sanity/cli'

/**
 * Elimina la página legal de cookies.
 *
 * El cliente decidió retirarla: el sitio público no usa cookies propias y la
 * mención del iframe de Zoho (cookies de terceros) quedó dentro de la Política
 * de privacidad. El slug `cookies` ya no existe en el schema, así que la ruta
 * `/legal/cookies` responde 404 aunque el documento siga en el dataset; este
 * script limpia el documento publicado y su draft.
 *
 * Es idempotente: si los documentos no existen, no hace nada.
 *
 * Uso: npx sanity exec scripts/remove-cookies-page.ts --with-user-token
 */

const client = getCliClient({ apiVersion: '2026-10-20' })

const IDS = ['legalPage-cookies', 'drafts.legalPage-cookies']

async function main() {
  for (const id of IDS) {
    const doc = await client.getDocument(id)

    if (!doc) {
      console.log(`${id}: no existe, nada que eliminar`)
      continue
    }

    await client.delete(id)
    console.log(`${id}: eliminado`)
  }

  console.log('Limpieza de la página de cookies completada.')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
