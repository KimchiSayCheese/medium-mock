import React, { FunctionComponent, useState } from 'react'
import { sanityClient, urlFor } from '../../sanity'
import Header from '../../components/Header'
import { Post } from '../../typings'
import { GetStaticProps, GetStaticPaths } from 'next'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'

interface Props {
  post: Post
}

interface FormInput {
  _id: string
  name: string
  email: string
  comment: string
}

const Post: FunctionComponent<Props> = ({ post }) => {
  const [submit, setSubmit] = useState<boolean>(false)
  const { comments } = post
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormInput>()

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    const dataSent = await fetch('/api/createComment', {
      method: 'POST',

      body: JSON.stringify(data),
    })
      .then((res) => {
        console.log(res.status)

        setSubmit(true)
      })
      .catch((err) => {
        console.error('hello ', err)
        setSubmit(false)
      })
  }

  return (
    <main>
      <Header />
      <img
        className="h-40 w-full object-cover"
        src={urlFor(post.mainImage).url()}
        alt="main image"
      />

      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="mb-2 text-xl font-light text-gray-500">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()}
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog post by{' '}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props}></h1>
              ),
              h2: (props: any) => (
                <h1 className="my-5 text-xl font-bold" {...props}></h1>
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
              img: ({ href }: any) => <img src={href} className="mb-6 mt-4" />,
            }}
          />
        </div>
      </article>
      <hr className="my-5 mx-auto max-w-lg border border-yellow-500" />
      {submit ? (
        <div className="mx-auto my-10 flex max-w-2xl flex-col items-center justify-center bg-yellow-500 py-10 text-white">
          <h1 className="mb-4 text-3xl font-bold">Submitted!</h1>
          <p>The comment will be pending approval by an admin.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="my-10 mx-auto flex max-w-2xl flex-col p-10"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">
            Contribute by leaving a comment below.
          </h4>
          <hr className="mt-2 py-3" />
          <input
            {...register('_id', { required: true })}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <label className="mb-5 block">
            <span className="text-gray-700">Name</span>
            <input
              {...register('name', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow focus:ring focus:ring-yellow-500"
              type="text"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Email</span>
            <input
              {...register('email', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow focus:ring focus:ring-yellow-500"
              placeholder="Janie.Doe@gmail.com"
              type="email"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register('comment', { required: true })}
              className="ring-yello-500 focus:npm install react-hook-formnpm install react-hook-formring-yellow-500 form-textarea block w-full rounded border py-2 px-3 shadow focus:ring"
              cols={30}
              rows={8}
            ></textarea>
          </label>

          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="inline-block text-sm text-red-500">
                - The Name field is required!
              </span>
            )}
            {errors.email && (
              <span className="inline-block text-sm text-red-500">
                - The Email field is required!
              </span>
            )}
            {errors.comment && (
              <span className="inline-block text-sm text-red-500">
                - The Comment field is required!
              </span>
            )}
          </div>

          <input
            type="submit"
            className="focus:rine cursor-pointer rounded bg-yellow-500 px-4 py-2 font-bold hover:bg-yellow-400"
          />
        </form>
      )}
      <div className="my-10 mx-auto flex max-w-2xl flex-col space-y-2 p-10 shadow shadow-yellow-500">
        <h3 className="text-4xl">Comment Section</h3>
        <hr className="pb-2" />

        {comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-yellow-500">{comment.name}</span>:{' '}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const query = `*[_type == "post"] {
    _id,
    slug {
    current
    }
  }`

  const posts = await sanityClient.fetch(query)
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))
  //ß console.log('this is from getStaticPaths :::: ', paths)
  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  //console.log('this is from getStaticProps :::: ', params)
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAt,
    title,
    author -> {
      name,
      image
    },
    'comments': *[_type == "comment" && approved == true && post._ref == ^._id],
    description,
    mainImage,
    slug,
    body
  }`
  const post = await sanityClient.fetch(query, { slug: params?.slug })

  if (!post) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      post,
    },
    revalidate: 60,
  }
}

export default Post
