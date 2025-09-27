'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'
import { Loader2, Wallet, Shield } from 'lucide-react'
import { AuthState } from '@/types'

interface WorldIDAuthProps {
  onAuthStart: () => void
  onAuthSuccess: (authState: AuthState) => void
  onAuthError: (error?: string) => void
  isLoading: boolean
}

export function WorldIDAuth({ 
  onAuthStart, 
  onAuthSuccess, 
  onAuthError, 
  isLoading 
}: WorldIDAuthProps) {
  const [error, setError] = useState<string | null>(null)

  const handleWalletAuth = useCallback(async () => {
    try {
      onAuthStart()
      setError(null)

      if (!MiniKit.isInstalled()) {
        // For development/browser testing
        console.log('MiniKit not installed, simulating auth...')
        setTimeout(() => {
          onAuthSuccess({
            isAuthenticated: true,
            walletAddress: '0x1234567890123456789012345678901234567890',
            user: null
          })
        }, 2000)
        return
      }

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
        statement: 'Sign in to OnlyAgents to find your perfect AI-matched connections',
      })

      if (finalPayload.status === 'error') {
        throw new Error((finalPayload as any).errorMessage || 'Authentication failed')
      }

      // Verify with backend
      const verifyRes = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce: nonce,
        }),
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

      onAuthSuccess({
        isAuthenticated: true,
        walletAddress: (finalPayload as any).walletAddress || 'unknown',
        user: null // Will be loaded separately
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      onAuthError(errorMessage)
      
      // Send haptic feedback for error
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'error',
        })
      }
    }
  }, [onAuthStart, onAuthSuccess, onAuthError])

  const handleVerification = useCallback(async () => {
    try {
      if (!MiniKit.isInstalled()) {
        console.log('Verification not available in browser mode')
        return
      }

      onAuthStart()

      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || 'verify-human',
        signal: 'onlyagents-verification',
        verification_level: VerificationLevel.Orb, // or VerificationLevel.Device
      })

      if (finalPayload.status === 'error') {
        throw new Error('Verification failed')
      }

      // Send to backend for verification
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || 'verify-human',
          signal: 'onlyagents-verification',
        }),
      })

      const result = await verifyRes.json()

      if (result.verifyRes.success) {
        // Send success haptic
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'success',
        })
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
      onAuthError(errorMessage)
    }
  }, [onAuthStart, onAuthError])

  return (
    <div className="space-y-4">
      {/* Main Auth Button */}
      <motion.button
        onClick={handleWalletAuth}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>Sign in with World ID</span>
          </>
        )}
      </motion.button>

      {/* Verification Button (Optional) */}
      <motion.button
        onClick={handleVerification}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white border-2 border-primary-500 text-primary-500 py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-primary-50"
      >
        <Shield className="w-4 h-4" />
        <span>Verify Human Status</span>
      </motion.button>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
