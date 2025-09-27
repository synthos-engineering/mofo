'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Heart, Clock } from 'lucide-react'
import { AuthState, Match, User } from '@/types'

interface MatchesScreenProps {
  authState: AuthState
  onChatSelect: (chatId: string) => void
}

// Mock matches data
const mockMatches = [
  {
    id: '1',
    userId: 'user1',
    matchedUserId: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isActive: true,
    user: {
      id: '1',
      name: 'Sarah Chen',
      age: 28,
      images: ['https://avatar.vercel.sh/sarah?text=SC'],
      lastMessage: 'Hey! Thanks for the match 😊',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      unreadCount: 2,
    }
  },
  {
    id: '2',
    userId: 'user1',
    matchedUserId: '2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isActive: true,
    user: {
      id: '2',
      name: 'Marcus Rodriguez',
      age: 32,
      images: ['https://avatar.vercel.sh/marcus?text=MR'],
      lastMessage: 'Would love to grab coffee sometime!',
      lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      unreadCount: 0,
    }
  },
  {
    id: '3',
    userId: 'user1',
    matchedUserId: '3',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isActive: true,
    user: {
      id: '3',
      name: 'Luna Park',
      age: 26,
      images: ['https://avatar.vercel.sh/luna?text=LP'],
      lastMessage: 'Your profile caught my eye! Love your photography work.',
      lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      unreadCount: 1,
    }
  },
]

const mockNewMatches = [
  {
    id: '4',
    name: 'Alex Kim',
    age: 29,
    images: ['https://avatar.vercel.sh/alex?text=AK'],
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
  },
  {
    id: '5',
    name: 'Riley Johnson',
    age: 27,
    images: ['https://avatar.vercel.sh/riley?text=RJ'],
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
]

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}

export function MatchesScreen({ authState, onChatSelect }: MatchesScreenProps) {
  const [matches, setMatches] = useState(mockMatches)
  const [newMatches, setNewMatches] = useState(mockNewMatches)

  return (
    <div className="flex-1 flex flex-col">
      {/* New Matches Section */}
      {newMatches.length > 0 && (
        <section className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Heart className="w-5 h-5 text-primary-500 mr-2 fill-current" />
            New Matches
          </h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {newMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 260,
                  damping: 20
                }}
                className="flex-shrink-0 text-center space-y-2 cursor-pointer"
                onClick={() => onChatSelect(match.id)}
              >
                <div className="relative">
                  <img
                    src={match.images[0]}
                    alt={match.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-primary-300 shadow-lg"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white fill-current" />
                  </div>
                </div>
                <div className="text-xs">
                  <div className="font-medium text-gray-800">{match.name}</div>
                  <div className="text-gray-500">{formatTime(match.timestamp)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Conversations Section */}
      <section className="flex-1 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 text-primary-500 mr-2" />
          Messages
        </h2>
        
        <div className="space-y-3">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onChatSelect(match.id)}
              className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
            >
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={match.user.images[0]}
                  alt={match.user.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {match.user.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {match.user.unreadCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {match.user.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(match.user.lastMessageTime)}
                  </div>
                </div>
                
                <p className={`text-sm truncate ${
                  match.user.unreadCount > 0 
                    ? 'text-gray-800 font-medium' 
                    : 'text-gray-500'
                }`}>
                  {match.user.lastMessage}
                </p>
              </div>

              {/* Arrow */}
              <div className="text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {matches.length === 0 && newMatches.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No matches yet</h3>
                <p className="text-gray-500 text-sm">
                  Start swiping to find your perfect connections!
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
