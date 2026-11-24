import {getCliClient} from 'sanity/cli'

/**
 * Quita el campo `reviewed` de los documentos legales.
 *
 * El freno de revisión se retiró a pedido del cliente: las páginas legales se
 * publican y se indexan en cuanto existen, sin banner de borrador. Como el campo
 * ya no está en el schema, dejarlo en los documentos haría que el Studio muestre
 * «Unknown field found»; este script lo elimina tanto del publicado como del
 * borrador, porque el Studio edita el draft y también reporta el campo huérfano
 * ahí.
 *
 * Es idempotente: si ningún documento lo tiene, no hace nada.
 *
 * Uso: npx sanity exec scripts/patch-legal-review-flag.ts --with-user-token
 */

const client = getCliClient({apiVersion: '2026-10-20'})

async function main() {
  const publicados = await client.fetch<string[]>(
    `*[_type == "legalPage" && defined(reviewed)]._id`,
  )

  // Un documento puede tener el campo solo en el draft (o solo en el publicado).
  const candidatos = [...new Set([...publicados, ...publicados.map((id) => `drafts.${id}`)])]
  const existentes = await client.fetch<string[]>(`*[_id in $ids]._id`, {ids: candidatos})

  if (existentes.length === 0) {
    console.log('Ningún documento legal tiene `reviewed`: nada que hacer.')
    return
  }

  let tx = client.transaction()
  for (const id of existentes) tx = tx.patch(id, (patch) => patch.unset(['reviewed']))
  const result = await tx.commit()

  console.log(
    `Campo reviewed eliminado en ${result.results.length} documento(s): ${existentes.join(', ')}`,
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
