import { getCliClient } from 'sanity/cli'
import { LEGAL_DRAFTS } from '../lib/legal-content'
import { LEGAL_ROUTES } from '../lib/legal-routes'
import { defaultSiteSettings } from '../lib/site-settings'

/**
 * Seed de las páginas legales.
 *
 * Crea el singleton `siteSettings` (sin datos legales inventados: la razón
 * social, el CUIT, el domicilio y la matrícula los carga el cliente) y los
 * documentos `legalPage` con los borradores de `lib/legal-content.ts`.
 *
 * Es idempotente y NO pisa contenido: usa `createIfNotExists`. Si el cliente ya
 * cargó datos o aprobó un texto, volver a correrlo no los modifica.
 *
 * Los textos quedan con `reviewed: false`, así que el sitio los muestra con el
 * aviso de borrador y con `noindex` hasta que el abogado los apruebe.
 *
 * Uso: npx sanity exec scripts/seed-legal.ts --with-user-token
 */

const client = getCliClient({ apiVersion: '2026-10-20' })

async function main() {
  const settings = await client.createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    tradeName: defaultSiteSettings.tradeName,
    email: defaultSiteSettings.email,
    ssnShowInFooter: false,
  })
  console.log(
    `documento ${settings._id}: ${settings._type} listo (no se pisa si ya existía)`,
  )

  for (const route of LEGAL_ROUTES) {
    const draft = LEGAL_DRAFTS[route.slug]
    const doc = await client.createIfNotExists({
      _id: `legalPage-${route.slug}`,
      _type: 'legalPage',
      title: draft.title,
      slug: { _type: 'slug', current: route.slug },
      seoDescription: draft.seoDescription,
      body: draft.body,
      reviewed: false,
    })
    console.log(`documento ${doc._id}: ${doc._type} listo (borrador, reviewed=false)`)
  }

  console.log(
    'Seed legal completado. Completá "Datos del sitio", revisá los textos y activá "Texto revisado por el abogado".',
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
