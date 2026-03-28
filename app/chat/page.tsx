'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RocketChatWidget from '@/components/RocketChatWidget'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const rocketChatUrl = process.env.NEXT_PUBLIC_ROCKET_CHAT_URL
  const roomId = process.env.NEXT_PUBLIC_ROCKET_CHAT_ROOM_ID

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      setIsLoading(false)
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Rocket.Chat Embedded Widget */}
      {rocketChatUrl && (
        <RocketChatWidget
          serverUrl={rocketChatUrl}
          roomId={roomId}
          position="left"
        />
      )}

      {/* Main Content */}
      <div className="flex w-full flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            💬 Welcome to Chat
          </h1>
          
          {!rocketChatUrl ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
              <h2 className="mb-4 text-xl font-semibold text-yellow-900 dark:text-yellow-100">
                ⚠️ Rocket.Chat Not Configured
              </h2>
              <p className="mb-4 text-yellow-800 dark:text-yellow-200">
                To enable chat functionality, please configure your Rocket.Chat server URL in the environment variables.
              </p>
              <div className="rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/30">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Add to your <code className="font-mono">.env.local</code>:
                </p>
                <pre className="mt-2 overflow-x-auto rounded bg-white p-3 text-left text-xs dark:bg-gray-800">
                  <code>
{`NEXT_PUBLIC_ROCKET_CHAT_URL=https://your-rocketchat-server.com
NEXT_PUBLIC_ROCKET_CHAT_ROOM_ID=general`}
                  </code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-green-800 dark:text-green-200">
                ✓ Chat widget is loading... Look for the chat button in the bottom corner of your screen.
              </p>
            </div>
          )}

          {/* User Info */}
          {session?.user && (
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/"
              className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-600"
            >
              ← Back to Home
            </Link>
            <Link
              href="/profile"
              className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
