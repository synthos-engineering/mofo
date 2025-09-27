'use client'

import { motion } from 'framer-motion'
import { Brain, Heart, Globe, Users } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
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

        {/* CTA Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          onClick={onComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-sm bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
        >
          Continue with World ID
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
