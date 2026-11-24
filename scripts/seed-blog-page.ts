import {getCliClient} from 'sanity/cli'
import {defaultBlogPage} from '../lib/blog-page'

/**
 * Seed de la portada del blog (`/blog`).
 *
 * Crea el singleton `blogPage` con los textos que hoy están en el código, para
 * que el cliente los edite desde el Studio sin empezar de cero.
 *
 * Es idempotente y NO pisa contenido: usa `createIfNotExists`.
 *
 * Uso: npx sanity exec scripts/seed-blog-page.ts --with-user-token
 */

const client = getCliClient({apiVersion: '2026-10-20'})

async function main() {
  const doc = await client.createIfNotExists({
    _id: 'blogPage',
    _type: 'blogPage',
    ...defaultBlogPage,
  })

  console.log(`documento ${doc._id}: ${doc._type} listo (no se pisa si ya existía)`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
