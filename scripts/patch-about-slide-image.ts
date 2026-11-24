import {createReadStream} from 'node:fs'
import {getCliClient} from 'sanity/cli'

/**
 * Reemplaza la foto de Pablo Arroyo en el carrusel de «Nosotros» por la versión
 * con el logo de GROU en la esquina superior derecha.
 *
 * Sube `public/nosotros-1-pablo-arroyo-logo-sin-placa.jpg` como asset (si no existe ya,
 * buscando por `originalFilename`) y cambia solo la referencia del slide del
 * retrato: no toca títulos, `alt`, hotspot ni el resto del documento.
 *
 * Es idempotente: si el slide ya apunta al asset nuevo, no hace nada.
 *
 * Uso: npx sanity exec scripts/patch-about-slide-image.ts --with-user-token
 */

const client = getCliClient({apiVersion: '2026-10-20'})

const SOURCE_PHOTO = 'public/nosotros-1-pablo-arroyo-logo-sin-placa.jpg'
const NEW_FILENAME = 'nosotros-1-pablo-arroyo-logo-sin-placa.jpg'
/** Fotos anteriores del mismo slide, en orden de reemplazo. */
const OLD_FILENAMES = ['nosotros-1-pablo-arroyo-logo.jpg', 'nosotros-1-pablo-arroyo.jpg']

type Slide = {
  _key: string
  assetId: string | null
  filename: string | null
}

async function main() {
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    {filename: NEW_FILENAME},
  )

  const assetId =
    existing ??
    (
      await client.assets.upload('image', createReadStream(SOURCE_PHOTO), {
        filename: NEW_FILENAME,
        title: 'Pablo Arroyo con logo de GROU Asesores',
      })
    )._id

  console.log(`asset ${NEW_FILENAME}: ${existing ? 'reused' : 'uploaded'} (${assetId})`)

  const slides = await client.fetch<Slide[] | null>(
    `*[_id == "homePage"][0].about.slides[]{
      _key,
      "assetId": image.asset->_id,
      "filename": image.asset->originalFilename
    }`,
  )

  if (!slides || slides.length === 0) {
    throw new Error('homePage.about.slides está vacío: no hay slide que reemplazar.')
  }

  const index = slides.findIndex((slide) => OLD_FILENAMES.includes(slide.filename ?? ''))

  if (index === -1) {
    const already = slides.findIndex((slide) => slide.assetId === assetId)
    console.log(
      already === -1
        ? 'No hay slide con la foto original; no se modificó nada.'
        : `El slide ${already} ya usa la imagen con logo: nada que hacer.`,
    )
    return
  }

  await client
    .patch('homePage')
    .set({
      [`about.slides[${index}].image.asset`]: {
        _type: 'reference',
        _ref: assetId,
      },
    })
    .commit({autoGenerateArrayKeys: false})

  console.log(`homePage.about.slides[${index}] → ${NEW_FILENAME}`)
  console.log('Patch aplicado. El sitio lo toma en la próxima carga (Sanity Live).')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
