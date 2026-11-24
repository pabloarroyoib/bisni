import {getCliClient} from 'sanity/cli'

/**
 * Carga el enlace del mapa en «Datos del sitio».
 *
 * El domicilio del sitio abre este enlace al hacer clic. Si estuviera vacío, el
 * código arma una búsqueda en Google Maps con la dirección, así que este script
 * solo fija la ficha concreta que eligió el cliente.
 *
 * Es idempotente: si `mapsUrl` ya tiene el valor, no escribe nada.
 *
 * Uso: npx sanity exec scripts/patch-site-maps.ts --with-user-token
 */

const client = getCliClient({apiVersion: '2026-10-20'})

const MAPS_URL = 'https://maps.app.goo.gl/hHw9WkEcSVUuxMmC8?g_st=aw'

async function main() {
  const actual = await client.fetch<string | null>(`*[_id == "siteSettings"][0].mapsUrl`)

  if (actual === MAPS_URL) {
    console.log('siteSettings.mapsUrl ya tiene ese enlace: nada que hacer.')
    return
  }

  await client.patch('siteSettings').set({mapsUrl: MAPS_URL}).commit()
  console.log(`siteSettings.mapsUrl → ${MAPS_URL}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
