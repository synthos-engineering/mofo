'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, Users, Zap } from 'lucide-react'
import { WorldIDAuth } from './world-id-auth'
import { AuthState } from '@/types'

interface AuthScreenProps {
  onAuthSuccess: (authState: AuthState) => void
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8"
        >
          <div className="relative">
            <Heart className="w-20 h-20 text-primary-500 fill-current" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 bg-primary-500/20 rounded-full blur-xl"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl font-bold text-gradient">OnlyAgents</h1>
          <p className="text-lg text-gray-600 max-w-sm">
            AI-powered matchmaking that understands you better than you understand yourself
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4 mb-12 max-w-sm w-full"
        >
          <div className="text-center space-y-2">
            <Shield className="w-8 h-8 text-primary-500 mx-auto" />
            <p className="text-sm text-gray-600">Verified Users</p>
          </div>
          <div className="text-center space-y-2">
            <Zap className="w-8 h-8 text-secondary-500 mx-auto" />
            <p className="text-sm text-gray-600">AI Matching</p>
          </div>
          <div className="text-center space-y-2">
            <Users className="w-8 h-8 text-primary-500 mx-auto" />
            <p className="text-sm text-gray-600">Real Connections</p>
          </div>
          <div className="text-center space-y-2">
            <Heart className="w-8 h-8 text-secondary-500 mx-auto" />
            <p className="text-sm text-gray-600">Genuine Love</p>
          </div>
        </motion.div>

        {/* Auth Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-sm"
        >
          <WorldIDAuth
            onAuthStart={() => setIsAuthenticating(true)}
            onAuthSuccess={(authState) => {
              setIsAuthenticating(false)
              onAuthSuccess(authState)
            }}
            onAuthError={() => setIsAuthenticating(false)}
            isLoading={isAuthenticating}
          />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="p-6 text-center text-xs text-gray-500"
      >
        Powered by World ID · Secure · Private · Decentralized
      </motion.div>
    </div>
  )
}
