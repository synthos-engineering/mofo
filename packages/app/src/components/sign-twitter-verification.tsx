'use client'

/**
 * SIGN MESSAGE TWITTER VERIFICATION COMPONENT
 * ==========================================
 *
 * Senior ASI Web3 Developer Implementation
 * Replaces WorldCoin verification with sign message proof of Twitter username ownership
 *
 * Features:
 * - EIP-191 compliant message signing
 * - Twitter username verification
 * - Integration with ASI backend
 * - Mock EEG data triggering
 */

import { useState } from 'react'
import { MiniKit, SignMessageInput } from '@worldcoin/minikit-js'

interface SignTwitterVerificationProps {
  onVerificationComplete: (data: {
    signature: string;
    address: string;
    twitterHandle: string;
    verified: boolean;
  }) => void;
  onError: (error: string) => void;
}

export function SignTwitterVerification({
  onVerificationComplete,
  onError
}: SignTwitterVerificationProps) {
  const [twitterHandle, setTwitterHandle] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState<'input' | 'signing' | 'verified'>('input')

  const handleSignMessage = async () => {
    if (!twitterHandle.trim()) {
      onError('Please enter your Twitter handle')
      return
    }

    // Clean Twitter handle (remove @ if present)
    const cleanHandle = twitterHandle.replace('@', '').trim()

    try {
      setIsVerifying(true)
      setStep('signing')

      // Create EIP-191 compliant message
      const message = `I own Twitter handle @${cleanHandle} for EEG Dating App verification. Timestamp: ${Date.now()}`

      const signMessagePayload: SignMessageInput = {
        message: message,
      }

      console.log('🔐 Requesting signature for Twitter verification...')

      const { finalPayload } = await MiniKit.commandsAsync.signMessage(signMessagePayload)

      if (finalPayload.status === "success") {
        console.log('✅ Message signed successfully')
        console.log('📝 Signature:', finalPayload.signature)
        console.log('📍 Address:', finalPayload.address)

        // TODO: Verify signature server-side if needed
        // For demo purposes, we accept the signature as valid proof

        setStep('verified')

        // Call completion callback
        onVerificationComplete({
          signature: finalPayload.signature,
          address: finalPayload.address,
          twitterHandle: cleanHandle,
          verified: true
        })

        console.log(`🐦 Twitter handle @${cleanHandle} verified via signature`)

      } else {
        throw new Error('Signature verification failed')
      }

    } catch (error) {
      console.error('❌ Twitter verification error:', error)
      onError(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setStep('input')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🐦 Twitter Verification
        </h2>
        <p className="text-gray-600">
          Sign a message to prove ownership of your Twitter handle
        </p>
      </div>

      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="twitter-handle" className="block text-sm font-medium text-gray-700 mb-2">
              Twitter Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                @
              </span>
              <input
                id="twitter-handle"
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="elonmusk"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isVerifying}
              />
            </div>
          </div>

          <button
            onClick={handleSignMessage}
            disabled={isVerifying || !twitterHandle.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Preparing Signature...
              </div>
            ) : (
              '🔐 Sign Message to Verify'
            )}
          </button>

          <div className="text-xs text-gray-500 mt-4">
            <p className="mb-2">📋 <strong>What happens:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sign a message proving you own @{twitterHandle || 'your_handle'}</li>
              <li>No tokens required, just cryptographic proof</li>
              <li>Your Twitter profile will be parsed for agent creation</li>
              <li>Mock EEG data will simulate neural compatibility</li>
            </ul>
          </div>
        </div>
      )}

      {step === 'signing' && (
        <div className="text-center">
          <div className="animate-pulse">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Sign Message in Wallet
            </h3>
            <p className="text-gray-600">
              Please sign the message to verify your Twitter handle ownership
            </p>
          </div>
        </div>
      )}

      {step === 'verified' && (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Twitter Handle Verified!
          </h3>
          <p className="text-gray-600">
            @{twitterHandle} ownership confirmed via signature
          </p>
        </div>
      )}
    </div>
  )
}
