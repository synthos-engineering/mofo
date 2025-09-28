'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Shield, User, Eye, ChevronLeft } from 'lucide-react'

interface VerificationCompleteScreenProps {
  onComplete: () => void
  onBack?: () => void
}

export function VerificationCompleteScreen({ onComplete, onBack }: VerificationCompleteScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      {onBack && (
        <div className="px-6 pt-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Verification Complete</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl font-bold text-green-600 mb-4"
        >
          Verification Complete
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-600 text-center mb-12 max-w-sm"
        >
          Your World ID has been successfully verified
        </motion.p>

        {/* Verification Items */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-green-50 border border-green-100 rounded-xl p-6 mb-12 w-full max-w-sm space-y-3"
        >
          <div className="flex items-center space-x-3 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">✓ Human verification confirmed</span>
          </div>
          
          <div className="flex items-center space-x-3 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">✓ Unique identity validated</span>
          </div>
          
          <div className="flex items-center space-x-3 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">✓ Privacy-preserving proof created</span>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          onClick={onComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-sm bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
        >
          Continue to EEG Setup
        </motion.button>

        {/* Next Step Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm text-gray-500 text-center mt-6 max-w-sm"
        >
          Next: Connect your EEG device for personality matching
        </motion.p>
      </div>
    </div>
  )
}
