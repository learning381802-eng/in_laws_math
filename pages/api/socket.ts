import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest } from 'next'
import { Server as NetServer, Socket } from 'net'

export type NextApiResponseServerIO = {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

interface SocketData {
  userId: string
  email: string
  name?: string
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: HTTPServer = res.socket.server as any
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    })

    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // User joins with their ID
      socket.on('user:join', (data: SocketData) => {
        socket.data = data
        socket.join(`user:${data.userId}`)
        io.emit('user:online', { userId: data.userId, socketId: socket.id })
        console.log(`User ${data.userId} joined`)
      })

      // Send message
      socket.on('message:send', async (data: {
        senderId: string
        receiverId: string
        content: string
      }) => {
        // Emit to receiver
        io.to(`user:${data.receiverId}`).emit('message:receive', {
          ...data,
          timestamp: new Date().toISOString(),
        })

        // Also emit back to sender for confirmation
        io.to(`user:${data.senderId}`).emit('message:sent', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      })

      // Typing indicator
      socket.on('typing:start', (data: { userId: string, receiverId: string }) => {
        io.to(`user:${data.receiverId}`).emit('typing:indicator', {
          userId: data.userId,
          isTyping: true,
        })
      })

      socket.on('typing:stop', (data: { userId: string, receiverId: string }) => {
        io.to(`user:${data.receiverId}`).emit('typing:indicator', {
          userId: data.userId,
          isTyping: false,
        })
      })

      socket.on('disconnect', () => {
        if (socket.data?.userId) {
          io.emit('user:offline', { userId: socket.data.userId })
          console.log(`User ${socket.data.userId} disconnected`)
        }
      })
    })
  } else {
    console.log('Socket.IO server already running')
  }

  res.end()
}

export default SocketHandler
