'use client'

import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/blog/` : `/blog/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/blog/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'all'

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Infer difficulty from tags or content
  const getPostDifficulty = (post: CoreContent<Blog>): Difficulty => {
    const tags = post.tags || []
    if (tags.includes('easy')) return 'easy'
    if (tags.includes('medium')) return 'medium'
    if (tags.includes('hard')) return 'hard'
    return 'easy' // default
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Filter by difficulty
      if (selectedDifficulty !== 'all') {
        const postDifficulty = getPostDifficulty(post)
        if (postDifficulty !== selectedDifficulty) return false
      }

      // Filter by tag
      if (selectedTag) {
        const postTags = post.tags || []
        if (!postTags.includes(selectedTag)) return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const titleMatch = post.title.toLowerCase().includes(query)
        const summaryMatch = post.summary?.toLowerCase().includes(query)
        const tagsMatch = (post.tags || []).some((tag) =>
          tag.toLowerCase().includes(query)
        )
        if (!titleMatch && !summaryMatch && !tagsMatch) return false
      }

      return true
    })
  }, [posts, selectedDifficulty, selectedTag, searchQuery])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : filteredPosts

  // Get recommended posts (based on difficulty and tags)
  const recommendedPosts = useMemo(() => {
    if (filteredPosts.length === 0) return []
    return filteredPosts.slice(0, 3)
  }, [filteredPosts])

  const difficultyColors = {
    all: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <>
      <div>
        <div className="pt-6 pb-6">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', 'easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? difficultyColors[diff]
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {diff === 'all' ? '📚 All' : diff === 'easy' ? '🟢 Easy' : diff === 'medium' ? '🟡 Medium' : '🔴 Hard'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Recommended Section */}
        {recommendedPosts.length > 0 && selectedDifficulty === 'all' && !selectedTag && !searchQuery && (
          <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-800 dark:bg-primary-900/20">
            <h2 className="mb-4 text-xl font-bold text-primary-900 dark:text-primary-100">
              ⭐ Recommended Problems
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedPosts.map((post) => (
                <Link
                  key={post.path}
                  href={`/${post.path}`}
                  className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {post.summary?.slice(0, 100)}...
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(post.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex sm:space-x-24">
          {/* Tags Sidebar */}
          <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
            <div className="px-6 py-4">
              {pathname.startsWith('/blog') ? (
                <h3 className="text-primary-500 font-bold uppercase">All Posts</h3>
              ) : (
                <Link
                  href={`/blog`}
                  className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
                >
                  All Posts
                </Link>
              )}
              <ul>
                {sortedTags.map((t) => {
                  return (
                    <li key={t} className="my-3">
                      <button
                        onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                        className={`w-full text-left ${
                          selectedTag === t
                            ? 'text-primary-500 font-bold'
                            : 'hover:text-primary-500 dark:hover:text-primary-500 text-sm font-medium text-gray-500 uppercase dark:text-gray-300'
                        }`}
                      >
                        {`${t} (${tagCounts[t]})`}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Posts List */}
          <div className="flex-1">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg">No posts found matching your filters.</p>
                <button
                  onClick={() => {
                    setSelectedDifficulty('all')
                    setSelectedTag(null)
                    setSearchQuery('')
                  }}
                  className="mt-4 text-primary-500 hover:text-primary-600"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <ul>
                {displayPosts.map((post) => {
                  const { path, date, title, summary, tags } = post
                  const difficulty = getPostDifficulty(post)
                  return (
                    <li key={path} className="py-5">
                      <article className="flex flex-col space-y-2 xl:space-y-0">
                        <dl>
                          <dt className="sr-only">Published on</dt>
                          <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                            <time dateTime={date} suppressHydrationWarning>
                              {formatDate(date, siteMetadata.locale)}
                            </time>
                          </dd>
                        </dl>
                        <div className="space-y-3">
                          <div>
                            <h2 className="text-2xl leading-8 font-bold tracking-tight">
                              <Link href={`/${path}`} className="text-gray-900 dark:text-gray-100">
                                {title}
                              </Link>
                            </h2>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColors[difficulty]}`}
                              >
                                {difficulty}
                              </span>
                              {tags?.map((tag) => <Tag key={tag} text={tag} />)}
                            </div>
                          </div>
                          <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                            {summary}
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
