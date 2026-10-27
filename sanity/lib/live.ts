import { defineLive } from 'next-sanity/live'
import { apiVersion } from '../env'
import { client } from './client'

/**
 * `serverToken` es solo de servidor: nunca lo expongas al navegador.
 * Sin `browserToken`, `<SanityLive />` recibe únicamente contenido publicado,
 * que es justo lo que queremos en producción.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion,
  }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: false,
})
