import { createClient, createCurrentUserHook } from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'

const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: '2021-03-25',

  useCdn: process.env.NODE_ENV === 'production',
}
// fetch query
const sanityClient = createClient(config)

const imageBuilder = createImageUrlBuilder(config)

const urlFor = (source) => imageBuilder.image(source)

export { urlFor, sanityClient, config }
