// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import sanityClient, { SanityClient } from '@sanity/client'

const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCon: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
}

const client: SanityClient = sanityClient(config)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { _id, name, email, comment } = JSON.parse(req.body)
  console.log(name, _id, email, comment)
  try {
    await client
      .create({
        _type: 'comment',
        post: {
          _type: 'reference',
          _ref: _id,
        },
        name,
        email,
        comment,
      })
      .then(() => {
        return res.send(200)
      })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Couldn't submit comment ", err })
  }
}
