export interface User {
  id: string
  name: string
  age: number
  bio: string
  images: string[]
  walletAddress?: string
  isVerified: boolean
  interests: string[]
  location: string
}

export interface Match {
  id: string
  userId: string
  matchedUserId: string
  timestamp: Date
  isActive: boolean
}

export interface Message {
  id: string
  matchId: string
  senderId: string
  content: string
  timestamp: Date
  isRead: boolean
}

export interface SwipeAction {
  userId: string
  targetUserId: string
  action: 'like' | 'dislike'
  timestamp: Date
}

export interface AuthState {
  isAuthenticated: boolean
  walletAddress: string | null
  user: User | null
}
