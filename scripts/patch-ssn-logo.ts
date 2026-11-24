import {createReadStream} from 'node:fs'
import {getCliClient} from 'sanity/cli'

/**
 * Reemplaza el logo de la SSN de «Datos del sitio» por la versión horizontal con
 * las letras en blanco (`public/ssn_horizontal_web_1.png`, 650×108 con alfa).
 *
 * Ese logo se muestra en el footer (sobre el fondo oscuro, sin placa) y en el
 * aviso legal (sobre una placa del mismo azul que traía la versión anterior).
 *
 * Es idempotente: reusa el asset por `originalFilename` y solo cambia la
 * referencia; no toca el resto de `siteSettings`.
 *
 * Uso: npx sanity exec scripts/patch-ssn-logo.ts --with-user-token
 */

const client = getCliClient({apiVersion: '2026-10-20'})

const SOURCE = 'public/ssn_horizontal_web_1.png'
const FILENAME = 'ssn_horizontal_web_1.png'

async function main() {
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    {filename: FILENAME},
  )

  const assetId =
    existing ??
    (
      await client.assets.upload('image', createReadStream(SOURCE), {
        filename: FILENAME,
        title: 'SSN horizontal, letras en blanco',
      })
    )._id

  console.log(`asset ${FILENAME}: ${existing ? 'reused' : 'uploaded'} (${assetId})`)

  const current = await client.fetch<{assetId: string | null; alt: string | null} | null>(
    `*[_id == "siteSettings"][0]{ "assetId": ssnLogo.asset->_id, "alt": ssnLogo.alt }`,
  )

  if (current?.assetId === assetId) {
    console.log('siteSettings.ssnLogo ya apunta a este asset: nada que hacer.')
    return
  }

  await client
    .patch('siteSettings')
    .set({
      'ssnLogo.asset': {_type: 'reference', _ref: assetId},
      'ssnLogo.alt':
        current?.alt?.trim() || 'Superintendencia de Seguros de la Nación',
      'ssnLogo._type': 'image',
    })
    .commit()

  console.log(`siteSettings.ssnLogo → ${FILENAME}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
