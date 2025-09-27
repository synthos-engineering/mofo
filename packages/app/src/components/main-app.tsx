'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, User, Settings } from 'lucide-react'
import { SwipeScreen } from './screens/swipe-screen'
import { MatchesScreen } from './screens/matches-screen'
import { ChatScreen } from './screens/chat-screen'
import { ProfileScreen } from './screens/profile-screen'
import { AuthState } from '@/types'
import { MiniKit, Permission } from '@worldcoin/minikit-js'

interface MainAppProps {
  authState: AuthState
}

type Screen = 'swipe' | 'matches' | 'chat' | 'profile'

export function MainApp({ authState }: MainAppProps) {
  const [activeScreen, setActiveScreen] = useState<Screen>('swipe')
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  useEffect(() => {
    // Request notification permissions on app start
    if (MiniKit.isInstalled()) {
      MiniKit.commands.requestPermission({
        permission: Permission.Notifications
      })
    }
  }, [])

  const handleScreenChange = (screen: Screen) => {
    // Send haptic feedback
    if (MiniKit.isInstalled()) {
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'selection-changed',
      })
    }
    
    setActiveScreen(screen)
    if (screen !== 'chat') {
      setSelectedChatId(null)
    }
  }

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId)
    setActiveScreen('chat')
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'swipe':
        return <SwipeScreen authState={authState} />
      case 'matches':
        return <MatchesScreen authState={authState} onChatSelect={handleChatSelect} />
      case 'chat':
        return <ChatScreen authState={authState} chatId={selectedChatId} onBack={() => setActiveScreen('matches')} />
      case 'profile':
        return <ProfileScreen authState={authState} />
      default:
        return <SwipeScreen authState={authState} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient">OnlyAgents</h1>
          <div className="flex items-center space-x-2">
            {authState.walletAddress && (
              <div className="text-xs text-gray-500 font-mono">
                {authState.walletAddress.slice(0, 6)}...{authState.walletAddress.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-t border-pink-100 px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'swipe', icon: Heart, label: 'Discover' },
            { id: 'matches', icon: MessageCircle, label: 'Matches' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              onClick={() => handleScreenChange(id as Screen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${
                activeScreen === id
                  ? 'text-primary-500 bg-primary-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeScreen === id ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </nav>
    </div>
  )
}
