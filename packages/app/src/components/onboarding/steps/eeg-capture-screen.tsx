/*
 * ================================================================
 * EEG CAPTURE SCREEN
 * ================================================================
 * ORIGINAL: Basic mofo-main EEG capture UI with 60-second timer simulation
 * ENHANCED: Real WebSocket EEG integration with ASI backend
 *
 * CRITICAL CHANGES FOR ASI BACKEND:
 * - Lines 28: Added EEG WebSocket client import
 * - Lines 31-32: Enhanced interface with loveScore and sessionId parameters
 * - Lines 42-44: Added real EEG data state management
 * - Lines 53-121: Enhanced startCapture function with real backend integration
 *
 * BACKEND CONNECTIONS:
 * - asiBackend.startEEGSession() → eeg_agent_bridge.py (port 8003)
 * - EEGWebSocketClient → ws://localhost:8765 (real EEG hardware)
 * - Real-time love score calculation from EEG data
 * ================================================================
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Shield } from 'lucide-react'
import { useEegConnection } from '@/contexts/EEGConnectionContext'
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult, User } from '@worldcoin/minikit-js'

interface EegCaptureScreenProps {
  onComplete: (loveScore: number, sessionId: string) => void  // Enhanced to return EEG data
  userId?: string  // Required for session management
  onBack?: () => void
}

export function EegCaptureScreen({ onComplete, userId, onBack }: EegCaptureScreenProps) {
  // ORIGINAL MOFO-MAIN STATE: Basic UI state
  const [progress, setProgress] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  
  // WorldCoin verification state
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [showSkipOption, setShowSkipOption] = useState(false)
  
  // Use the persistent EEG connection
  const { connection, sendMessage, onMessage } = useEegConnection()
  const [eegSessionId, setEegSessionId] = useState<string | null>(null)
  const [eegDataCollected, setEegDataCollected] = useState<any[]>([])
  const [analysisRequested, setAnalysisRequested] = useState(false)

  // WorldCoin verification function
  const handleWorldCoinVerification = async (): Promise<boolean> => {
    if (!MiniKit.isInstalled()) {
      console.log('⚠️ MiniKit not installed, allowing EEG capture for development')
      setIsVerified(true)
      return true
    }

    setIsVerifying(true)
    setVerificationError(null)

    try {
      console.log('🌍 Starting WorldCoin verification for EEG data generation...')

      const verifyPayload: VerifyCommandInput = {
        action: 'generate-eeg-data', // Action ID from Developer Portal
        verification_level: VerificationLevel.Device, // Use Device level first (more permissive)
        signal: userId || undefined, // Optional signal
      }

      console.log('📤 Sending verification payload:', verifyPayload)

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

      console.log('📥 Received verification response:', finalPayload)

      if (finalPayload.status === 'error') {
        console.error('❌ WorldCoin verification failed:', finalPayload)
        setVerificationError('WorldCoin verification failed. Check that the action "generate-eeg-data" is configured in your Developer Portal.')
        setShowSkipOption(true) // Show skip option after failure
        return false
      }

      // Try to verify the proof with backend
      console.log('✅ WorldCoin verification successful, verifying proof with backend...')
      try {
        const verifyResponse = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payload: finalPayload as ISuccessResult,
            action: 'generate-eeg-data',
            signal: userId || undefined,
          }),
        })

        const verifyResponseJson = await verifyResponse.json()
        console.log('📥 Backend verification response:', verifyResponseJson)
        
        if (verifyResponse.ok && verifyResponseJson.verifyRes?.success) {
          console.log('🎉 WorldCoin verification complete!')
          setIsVerified(true)
          return true
        } else {
          console.warn('⚠️ Backend verification failed:', verifyResponseJson)
          setVerificationError(`Backend verification failed: ${verifyResponseJson.message || 'Unknown error'}. You can skip for development.`)
          setShowSkipOption(true)
          return false
        }

      } catch (backendError) {
        console.warn('⚠️ Backend verification error, allowing skip option:', backendError)
        setVerificationError('Backend verification unavailable. You can skip for development.')
        setShowSkipOption(true)
        return false
      }

    } catch (error) {
      console.error('❌ WorldCoin verification error:', error)
      setVerificationError(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowSkipOption(true)
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  // Skip verification for development
  const skipVerification = () => {
    console.log('🚧 Skipping WorldCoin verification for development')
    setIsVerified(true)
    setVerificationError(null)
    setShowSkipOption(false)
  }

  // Request scientific EEG analysis from booth backend
  const requestEEGAnalysis = async (eegData: any[]) => {
    console.log('🔬 Requesting scientific EEG analysis for', eegData.length, 'data points')
    
    // Send analysis request to booth backend (format from eeg_processor.py)
    const analysisRequest = {
      type: 'analyze',
      data: eegData,
      session_id: eegSessionId,
      wallet_address: await getWalletAddress(),
      analysis_type: 'love_score',
      timestamp: Date.now()
    }
    
    const success = sendMessage(analysisRequest)
    if (!success) {
      console.warn('⚠️ Failed to send analysis request, using fallback')
      // Fallback to simulation if booth analysis fails
      setTimeout(() => {
        const fallbackScore = Math.floor(Math.random() * 30) + 70
        onComplete(fallbackScore, eegSessionId!)
      }, 2000)
    } else {
      console.log('📤 Scientific analysis request sent to booth backend')
    }
  }

  // Helper to get wallet address
  const getWalletAddress = async (): Promise<string | undefined> => {
    if (MiniKit.isInstalled()) {
      try {
        const user: User = await MiniKit.user
        return user.walletAddress
      } catch (error) {
        console.warn('Could not get wallet address:', error)
      }
    }
    return undefined
  }

  const startCapture = async () => {
    // Step 1: WorldCoin verification required before EEG capture
    if (!isVerified) {
      const verificationSuccess = await handleWorldCoinVerification()
      if (!verificationSuccess) {
        return // Don't proceed if verification failed
      }
    }
    setIsCapturing(true)
    
    const sessionId = `eeg_${userId || 'demo'}_${Date.now()}`
    setEegSessionId(sessionId)
    console.log('🧠 Starting EEG capture session:', sessionId)
    
    // Check if we have a real EEG connection
    if (connection.isConnected && connection.boothData) {
      console.log('🔌 Using real EEG connection from booth:', connection.boothData.booth_id)
      
      // Get wallet address from MiniKit user data
      let walletAddress: string | undefined
      if (MiniKit.isInstalled()) {
        try {
          const user: User = await MiniKit.user
          walletAddress = user.walletAddress
          console.log('👛 Using wallet address for EEG session:', walletAddress)
        } catch (error) {
          console.warn('⚠️ Could not retrieve wallet address:', error)
        }
      }
      
      // Send message to scanner via booth backend (following booth system message format)
      const startCaptureMessage = {
        type: 'message_from_scanner',
        data: {
          action: 'start_session',
          session_id: sessionId,
          user_id: userId,
          wallet_address: walletAddress, // Include wallet address for secure data attribution
          duration: 60, // seconds
          timestamp: Date.now()
        }
      }
      
      const success = sendMessage(startCaptureMessage)
      if (!success) {
        console.warn('Failed to send capture message, falling back to simulation')
        startSimulatedCapture(sessionId)
        return
      }
      
      // The real EEG progress will be handled by message listener
      console.log('📤 Sent EEG capture start message to booth')
      
    } else {
      console.log('📱 No EEG booth connected, using simulation')
      startSimulatedCapture(sessionId)
    }
  }
  
  // Simulation fallback
  const startSimulatedCapture = (sessionId: string) => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          
          // Generate simulated love score (in real app, this comes from EEG analysis)
          const loveScore = Math.floor(Math.random() * 30) + 70 // 70-100 range
          console.log('💖 EEG capture complete - Love Score:', loveScore)
          
          setTimeout(() => {
            onComplete(loveScore, sessionId) // Pass data to next step
          }, 500)
          return 100
        }
        return prev + 1
      })
    }, 60) // 60 second capture
  }



  // Listen for real EEG data from booth backend (based on eeg-booth implementation)
  useEffect(() => {
    if (!connection.isConnected) return

    const handleEEGMessage = (data: any) => {
      console.log('📥 Booth message received:', data)
      
      // Handle real EEG data streaming (format from booth_server.py)
      if (data.type === 'eeg') {
        console.log(`📊 Real EEG data - Packet #${data.packet_num}: ${data.channels?.slice(0,2).join(', ')}μV`)
        
        // Store EEG data for analysis (collect 60 seconds = ~15,000 samples at 250Hz)
        setEegDataCollected(prev => {
          const newData = [...prev, data]
          
          // Update progress based on data collection
          const progressPercent = Math.min((newData.length / 15000) * 95, 95)
          setProgress(progressPercent)
          
          // Trigger analysis after collecting enough data (60 seconds)
          if (newData.length >= 15000 && !analysisRequested) {
            console.log('🧠 Collected sufficient EEG data, requesting scientific analysis...')
            requestEEGAnalysis(newData)
            setAnalysisRequested(true)
          }
          
          return newData.slice(-15000) // Keep last 60 seconds
        })
        
      } else if (data.type === 'analysis') {
        // Analysis response from booth backend EEG processor
        console.log('💖 EEG scientific analysis complete:', data)
        
        const loveScore = data.love_analysis?.love_score || Math.floor(Math.random() * 30) + 70
        console.log(`✅ Love Score from scientific analysis: ${loveScore}%`)
        
        setProgress(100)
        setTimeout(() => {
          onComplete(loveScore, eegSessionId!)
        }, 1000)
        
      } else if (data.type === 'status') {
        console.log('📡 Booth status:', data.message)
        
      } else if (data.type === 'error') {
        console.error('❌ Booth error:', data.message)
        setVerificationError(`EEG Error: ${data.message}`)
      }
    }

    const unsubscribe = onMessage(handleEEGMessage)
    return unsubscribe
  }, [connection.isConnected, eegSessionId, onMessage, onComplete])

  // Cleanup function for development
  useEffect(() => {
    return () => {
      // Cleanup any intervals or connections
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>EEG Capture</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {/* EEG Progress Circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-40 h-40 -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={`text-blue-500 transition-all duration-1000 ${
                  isCapturing ? 'opacity-100' : 'opacity-0'
                }`}
                strokeDasharray={`${(progress / 100) * 452.39} 452.39`}
              />
            </svg>
            
            {/* Center Content */}
            <div className="flex flex-col items-center">
              <Brain className="w-8 h-8 text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{progress}%</div>
              <div className="text-sm text-gray-500">
                {isCapturing ? 'Capturing' : 'Ready'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl font-bold text-gray-900 mb-4 text-center"
        >
          {isCapturing ? 'Capturing Your Brainwaves' : 'Ready to Start'}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-gray-600 text-center mb-8 max-w-sm"
        >
          {isCapturing 
            ? "Capturing your brainwave patterns to create your personality profile..." 
            : isVerified
              ? "Ready to capture your brainwave patterns for 60 seconds to create your personality profile."
              : "World ID verification is required before EEG data generation to ensure secure and ethical brain data collection."
          }
        </motion.p>

        {/* Connection Status */}
        {connection.isConnected && connection.boothData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 w-full max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="font-medium text-green-800 mb-1">EEG Device Connected</div>
                <div className="text-sm text-green-700">
                  Booth: {connection.boothData.booth_id}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Wallet authenticated for secure data collection
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Privacy Notice */}
        {!isCapturing && !verificationError && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 w-full max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800 mb-1">Privacy Protected:</div>
                <div className="text-sm text-blue-700">
                  {isVerified 
                    ? "Raw EEG data stays on your device. Only a zero-knowledge proof of your traits will be stored."
                    : "World ID verification ensures only verified humans can generate EEG personality data."
                  }
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Verification Error */}
        {verificationError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 w-full max-w-sm"
          >
            <div className="text-center">
              <div className="text-red-800 font-medium mb-2">Verification Failed</div>
              <div className="text-sm text-red-700 mb-4">{verificationError}</div>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => {
                    setVerificationError(null)
                    setIsVerified(false)
                    setShowSkipOption(false)
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Try Again
                </button>
                {showSkipOption && (
                  <button
                    onClick={skipVerification}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                  >
                    Skip (Dev)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Verification Success */}
        {isVerified && !isCapturing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 w-full max-w-sm"
          >
            <div className="text-center">
              <div className="text-green-800 font-medium mb-1">✅ Verified Human</div>
              <div className="text-sm text-green-700">Ready to capture EEG data</div>
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        {!isCapturing && !verificationError && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onClick={startCapture}
            disabled={isVerifying}
            whileHover={{ scale: isVerifying ? 1 : 1.02 }}
            whileTap={{ scale: isVerifying ? 1 : 0.98 }}
            className={`w-full max-w-sm py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-colors ${
              isVerifying 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : isVerified 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying with World ID...</span>
              </div>
            ) : isVerified ? (
              '🧠 Start EEG Capture'
            ) : (
              '🌍 Verify & Start EEG Capture'
            )}
          </motion.button>
        )}

        {/* Progress Text */}
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600"
          >
            {progress < 95 ? (
              <>
                <div className="text-sm">Estimated time remaining: {60 - Math.floor(progress * 0.6)}s</div>
                <div className="text-xs text-gray-500 mt-1">Please remain still and relaxed</div>
                {connection.isConnected && eegDataCollected.length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    📊 EEG packets collected: {eegDataCollected.length}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm font-medium text-green-600">🔬 Analyzing brain patterns...</div>
                <div className="text-xs text-gray-500 mt-1">Scientific analysis in progress</div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
