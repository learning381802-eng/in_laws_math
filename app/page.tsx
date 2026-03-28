import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'
import Link from 'next/link'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  
  return (
    <>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          In Laws Math:{' '}
          <Link
            href="/chat"
            className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent transition-all hover:from-primary-600 hover:to-primary-700 hover:underline hover:decoration-2 hover:underline-offset-4"
            title="Connect with other mathematicians"
          >
            Math for everyone
          </Link>
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Explore mathematics through interactive problems, insightful articles, and hidden connections
        </p>
      </div>
      <Main posts={posts} />
    </>
  )
}
