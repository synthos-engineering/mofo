'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Shield } from 'lucide-react'

interface EegCaptureScreenProps {
  onComplete: () => void
}

export function EegCaptureScreen({ onComplete }: EegCaptureScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)

  const startCapture = () => {
    setIsCapturing(true)
    
    // Simulate EEG capture progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 1
      })
    }, 60) // 60 second capture
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500">
        <span>W-05: EEG Capture</span>
        <div className="flex space-x-2">
          <button className="p-1">←</button>
          <button className="p-1">→</button>
        </div>
      </div>

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
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
          className="text-gray-600 text-center mb-12 max-w-sm"
        >
          {isCapturing 
            ? "We'll capture your brainwave patterns for 60 seconds to create your personality profile" 
            : "We'll capture your brainwave patterns for 60 seconds to create your personality profile"
          }
        </motion.p>

        {/* Privacy Notice */}
        {!isCapturing && (
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
                  Raw EEG data stays on your device. Only a zero-knowledge proof of your traits will be stored.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        {!isCapturing && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onClick={startCapture}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-sm bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
          >
            Start EEG Capture
          </motion.button>
        )}

        {/* Progress Text */}
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600"
          >
            <div className="text-sm">Estimated time remaining: {60 - Math.floor(progress * 0.6)}s</div>
            <div className="text-xs text-gray-500 mt-1">Please remain still and relaxed</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
