'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Shield, User, ChevronLeft } from 'lucide-react'
import { MiniKit } from '@worldcoin/minikit-js'

interface WorldIdVerificationScreenProps {
  onComplete: (walletAddress: string) => void
}

export function WorldIdVerificationScreen({ onComplete }: WorldIdVerificationScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleVerification = async () => {
    setIsLoading(true)
    
    try {
      if (!MiniKit.isInstalled()) {
        // Simulate verification for browser testing
        setTimeout(() => {
          onComplete('0x1234567890123456789012345678901234567890')
        }, 2000)
        return
      }

      // Generate nonce from backend
      const nonceRes = await fetch('/api/nonce')
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
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'success',
        })
      }

      onComplete((finalPayload as any).walletAddress || 'unknown')
    } catch (error) {
      console.error('Verification failed:', error)
      setIsLoading(false)
      
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
        <span>W-02: World Login</span>
        <div className="flex space-x-2">
          <button className="p-1">←</button>
          <button className="p-1">→</button>
        </div>
      </div>

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Globe className="w-10 h-10 text-blue-600" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          World ID Verification
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-600 text-center mb-12 max-w-sm"
        >
          Verify your humanity to create a trusted profile
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-4 mb-16 w-full max-w-sm"
        >
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-gray-800 font-medium">Privacy Protected</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Globe className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-800">One Person, One Account</div>
              <div className="text-sm text-gray-600">Prevents fake profiles and bots</div>
            </div>
          </div>
        </motion.div>

        {/* Verification Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          onClick={handleVerification}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className="w-full max-w-sm bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            'Verify with World ID'
          )}
        </motion.button>
      </div>
    </div>
  )
}
