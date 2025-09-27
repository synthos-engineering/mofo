'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Phone, Video, MoreVertical } from 'lucide-react'
import { AuthState, Message } from '@/types'
import { MiniKit } from '@worldcoin/minikit-js'

interface ChatScreenProps {
  authState: AuthState
  chatId: string | null
  onBack: () => void
}

// Mock chat data
const mockMessages: Message[] = [
  {
    id: '1',
    matchId: '1',
    senderId: '1',
    content: 'Hey! Thanks for the match 😊',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '2',
    matchId: '1',
    senderId: 'user1',
    content: 'Hi Sarah! I loved your profile, especially your photography work. Do you do landscapes or more portrait stuff?',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    isRead: true,
  },
  {
    id: '3',
    matchId: '1',
    senderId: '1',
    content: 'Thanks! I love both actually, but I\'ve been really into landscape photography lately. There\'s something magical about capturing nature\'s moments 📸',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: true,
  },
  {
    id: '4',
    matchId: '1',
    senderId: '1',
    content: 'Would you be interested in going on a photo walk sometime? I know some great spots around the city!',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
  },
]

const mockUser = {
  id: '1',
  name: 'Sarah Chen',
  age: 28,
  images: ['https://avatar.vercel.sh/sarah?text=SC'],
  isOnline: true,
}

export function ChatScreen({ authState, chatId, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Focus input when screen opens
    inputRef.current?.focus()
  }, [])

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    // Send haptic feedback
    if (MiniKit.isInstalled()) {
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'impact',
        style: 'light',
      })
    }

    const message: Message = {
      id: Date.now().toString(),
      matchId: chatId,
      senderId: authState.walletAddress || 'user1',
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate typing indicator and response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Simulate a response (in a real app this would come from the other user)
      if (Math.random() > 0.7) {
        const responses = [
          'That sounds great! 😊',
          'I\'d love that!',
          'Perfect, looking forward to it!',
          'Absolutely! When works for you?',
        ]
        const response: Message = {
          id: (Date.now() + 1).toString(),
          matchId: chatId,
          senderId: '1',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          isRead: false,
        }
        setMessages(prev => [...prev, response])
      }
    }, 1500 + Math.random() * 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isMyMessage = (senderId: string) => {
    return senderId === authState.walletAddress || senderId === 'user1'
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 -m-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={mockUser.images[0]}
                alt={mockUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {mockUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{mockUser.name}</h3>
              <p className="text-xs text-green-500">
                {mockUser.isOnline ? 'Online now' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => {
          const isMe = isMyMessage(message.senderId)
          const showTime = index === 0 || 
            messages[index - 1].timestamp.getTime() - message.timestamp.getTime() > 5 * 60 * 1000

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] space-y-1`}>
                {showTime && (
                  <p className="text-xs text-gray-500 text-center">
                    {formatMessageTime(message.timestamp)}
                  </p>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isMe
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
            />
          </div>
          
          <motion.button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
