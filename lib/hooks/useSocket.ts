'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: Set<string>
  typingUsers: Set<string>
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    const socketInstance = io(window.location.origin, {
      path: '/api/socket',
      transports: ['websocket'],
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected')

      // Join user room
      socketInstance.emit('user:join', {
        userId: session.user.id,
        email: session.user.email || '',
        name: session.user.name || undefined,
      })
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket disconnected')
    })

    socketInstance.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId))
    })

    socketInstance.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })

    socketInstance.on('typing:indicator', ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev)
        if (isTyping) {
          next.add(userId)
        } else {
          next.delete(userId)
        }
        return next
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session?.user?.id])

  return { socket, isConnected, onlineUsers, typingUsers }
}
