import { getCliClient } from 'sanity/cli'

/**
 * Limpieza del documento `homePage` después de mover los datos de contacto a
 * `siteSettings`.
 *
 * 1. Quita `contact.details`, el array que guardaba los datos mockup (Madrid,
 *    +34, hola@bisni.es) y que ya no existe en el schema. Sin esto el Studio
 *    muestra "Unknown field found".
 * 2. Completa `contact.form.privacyLinkLabel` solo si está vacío. El campo es
 *    opcional y el sitio ya usa un fallback, pero así el documento queda
 *    completo para el cliente.
 *
 * Es idempotente y no pisa ningún otro contenido: usa `unset` acotado a ese
 * campo y `setIfMissing` para el texto del enlace.
 *
 * Uso: npx sanity exec scripts/patch-home-legal.ts --with-user-token
 */

const client = getCliClient({ apiVersion: '2026-10-20' })

type HomeDocument = {
  _id: string
  contact?: {
    details?: unknown
    form?: Record<string, unknown> | null
  } | null
}

async function main() {
  const doc = (await client.getDocument('homePage')) as HomeDocument | null

  if (!doc) {
    console.log('No existe el documento homePage: no hay nada que limpiar.')
    return
  }

  let patch = client.patch('homePage')
  const changes: string[] = []

  if (Array.isArray(doc.contact?.details) && doc.contact.details.length > 0) {
    patch = patch.unset(['contact.details'])
    changes.push('contact.details (datos de contacto mockup)')
  }

  if (doc.contact?.form && doc.contact.form.privacyLinkLabel === undefined) {
    patch = patch.setIfMissing({
      'contact.form.privacyLinkLabel': 'Política de privacidad',
    })
    changes.push('contact.form.privacyLinkLabel')
  }

  if (changes.length === 0) {
    console.log('El documento homePage ya está limpio: no se modificó nada.')
    return
  }

  await patch.commit({ visibility: 'sync' })
  console.log(`homePage actualizado: ${changes.join(', ')}.`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
