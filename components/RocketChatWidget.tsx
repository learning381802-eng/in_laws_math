'use client'

import { useEffect, useRef } from 'react'

interface RocketChatWidgetProps {
  serverUrl: string
  roomId?: string
  position?: 'left' | 'right'
}

export default function RocketChatWidget({
  serverUrl,
  roomId,
  position = 'right',
}: RocketChatWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const isWidgetLoaded = useRef(false)

  useEffect(() => {
    if (!serverUrl || isWidgetLoaded.current) return

    // Set the Rocket.Chat URL
    const win = window as any
    win.RocketChat = win.RocketChat || { _: [] }
    win.RocketChat.url = serverUrl

    // Load the Rocket.Chat widget script
    const script = document.createElement('script')
    script.src = `${serverUrl}/livechat/script.js`
    script.async = true
    script.onload = () => {
      isWidgetLoaded.current = true

      // Initialize widget configuration
      if (win.RocketChat?.livechat) {
        win.RocketChat.livechat.initialize({
          theme: {
            color: '#E94560', // Primary color matching your site
            position,
          },
          ...(roomId && { department: roomId }),
        })
      }
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup: Remove widget on unmount
      if (win.RocketChat?.livechat) {
        win.RocketChat.livechat.hideWidget()
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [serverUrl, roomId, position])

  return null // Widget renders as a floating button, no UI needed here
}
