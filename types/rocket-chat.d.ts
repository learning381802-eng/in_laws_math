// Rocket.Chat Widget Type Declarations
export interface RocketChatWidgetAPI {
  initialize: (config: any) => void
  showWidget: () => void
  hideWidget: () => void
  maximizeWidget: () => void
  minimizeWidget: () => void
  setCustomField: (key: string, value: string) => void
  setGuestToken: (token: string) => void
  setGuestName: (name: string) => void
  setGuestEmail: (email: string) => void
  registerGuest: (guest: any) => void
  setTheme: (theme: any) => void
  setDepartment: (department: string) => void
  setLanguage: (lang: string) => void
}

export interface RocketChatWindow extends Window {
  RocketChat?: {
    _: any[]
    url?: string
    livechat?: RocketChatWidgetAPI
  }
}
