'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Heart, Globe, Users, AlertTriangle, Loader2 } from 'lucide-react'
import { MiniKit } from '@worldcoin/minikit-js'

interface SplashScreenProps {
  onComplete: (walletAddress: string) => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const handleContinueWithWorldID = async () => {
    // Check if running in World App first
    if (!MiniKit.isInstalled()) {
      setShowWarning(true)
      return
    }

    setIsLoading(true)
    
    try {
      // Generate nonce from backend
      const nonceRes = await fetch('/api/nonce')
      if (!nonceRes.ok) {
        throw new Error('Failed to generate nonce')
      }
      
      const { nonce } = await nonceRes.json()

      // Initiate wallet auth with MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        statement: 'Sign in to Mofo to create your AI dating agent',
      })

      if (finalPayload.status === 'error') {
        throw new Error((finalPayload as any).errorMessage || 'Authentication failed')
      }

      // Verify with backend
      const verifyRes = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      })

      const verifyResult = await verifyRes.json()

      if (verifyResult.status === 'error' || !verifyResult.isValid) {
        throw new Error('Authentication verification failed')
      }

      // Send haptic feedback for successful auth
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'notification',
        style: 'success',
      })

      onComplete((finalPayload as any).walletAddress || 'unknown')
    } catch (error) {
      console.error('Authentication failed:', error)
      setIsLoading(false)
      
      // Send haptic feedback for error
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'error',
        })
      }
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500">
        <span>W-01: Splash</span>
        <div className="flex space-x-2">
          <button className="p-1">←</button>
          <button className="p-1">→</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-6">
            <div className="flex items-center space-x-1 text-white">
              <Brain className="w-8 h-8" />
              <Heart className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold text-gray-900 mb-2"
        >
          Mofo
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg text-gray-600 text-center mb-12 max-w-sm"
        >
          AI-powered dating with personality matching
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-4 mb-16 w-full max-w-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <Globe className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-gray-700">World ID verified profiles</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <Brain className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-gray-700">EEG-based personality matching</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="w-3 h-3 text-pink-600" />
            </div>
            <span className="text-gray-700">AI agents handle the conversation</span>
          </div>
        </motion.div>

        {/* Warning for non-World App users */}
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 w-full max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-800 mb-1">World App Required</div>
                <div className="text-sm text-red-700 mb-3">
                  This app requires World App to function properly. Please open this link in World App.
                </div>
                <div className="text-xs text-red-600 bg-red-100 p-2 rounded font-mono">
                  worldapp://mini-app?app_id=app_4ff55a0e5a33ac735bc5146bca65bf60
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          onClick={handleContinueWithWorldID}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className="w-full max-w-sm bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            'Continue with World ID'
          )}
        </motion.button>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-xs text-gray-500 text-center mt-8 max-w-sm"
        >
          By continuing, you agree to our Terms and Privacy Policy
        </motion.p>
      </div>
    </div>
  )
}
