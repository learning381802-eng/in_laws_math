'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/lib/hooks/useSocket'
import Link from 'next/link'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  points: number
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { socket, isConnected, onlineUsers } = useSocket()
  
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch users on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    async function fetchUsers() {
      try {
        const res = await fetch('/api/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [status, router])

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!selectedUser || !session?.user?.id) return

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?userId=${selectedUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
  }, [selectedUser, session?.user?.id])

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !session?.user?.id) return

    const handleMessageReceive = (message: Message) => {
      if (selectedUser?.id === message.sender_id) {
        setMessages((prev) => [...prev, message])
      }
    }

    const handleMessageSent = (message: Message) => {
      if (selectedUser?.id === message.receiver_id) {
        setMessages((prev) => [...prev, message])
      }
    }

    socket.on('message:receive', handleMessageReceive)
    socket.on('message:sent', handleMessageSent)

    return () => {
      socket.off('message:receive', handleMessageReceive)
      socket.off('message:sent', handleMessageSent)
    }
  }, [socket, session?.user?.id, selectedUser?.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || !session?.user?.id || !socket) return

    // Optimistic update
    const tempMessage: Message = {
      id: Date.now().toString(),
      sender_id: session.user.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])
    setNewMessage('')

    // Send via socket
    socket.emit('message:send', {
      senderId: session.user.id,
      receiverId: selectedUser.id,
      content: tempMessage.content,
    })

    // Also save to database
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: tempMessage.content,
        }),
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            💬 Messages
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`flex w-full items-center gap-3 border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                selectedUser?.id === user.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </div>
                {onlineUsers.has(user.id) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.name || 'Anonymous'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.points} pts
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Back Link */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <Link
            href="/"
            className="text-sm text-primary-500 hover:text-primary-600"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedUser.name || 'Anonymous'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {onlineUsers.has(selectedUser.id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                  No messages yet. Say hello!
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === session?.user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-primary-500 text-white'
                              : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <p
                            className={`mt-1 text-xs ${
                              isOwn ? 'text-primary-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
