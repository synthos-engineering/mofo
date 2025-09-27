'use client'

import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Camera, Shield } from 'lucide-react'

interface EegPairingScreenProps {
  onComplete: () => void
}

export function EegPairingScreen({ onComplete }: EegPairingScreenProps) {
  const handleScanQR = () => {
    // Simulate QR scanning
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500">
        <span>W-04: Pair EEG</span>
        <div className="flex space-x-2">
          <button className="p-1">←</button>
          <button className="p-1">→</button>
        </div>
      </div>

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Pair EEG Device</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-8">
        {/* EEG Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center mb-8"
        >
          <Brain className="w-16 h-16 text-gray-800" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl font-bold text-gray-900 mb-4 text-center"
        >
          Connect Your EEG Device
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-gray-600 text-center mb-8"
        >
          Scan the QR code on your EEG station to establish a secure connection
        </motion.p>

        {/* Privacy Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800 mb-1">Privacy Protected</div>
              <div className="text-sm text-blue-700">
                Your brain data is processed securely and only anonymized patterns are stored.
              </div>
            </div>
          </div>
        </motion.div>

        {/* QR Code Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex-1 flex flex-col items-center"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 w-full max-w-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">EEG Station QR Code</span>
            </div>

            {/* QR Code Placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-6xl text-gray-400 font-mono mb-2">QR</div>
              <div className="text-sm text-gray-500 mb-2">QR Code displayed on</div>
              <div className="text-sm text-gray-500">EEG Station screen</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="font-medium text-gray-800 mb-1">Look for this QR code on your EEG station</div>
            <div className="text-sm text-gray-500">The QR code should be visible on the station's display</div>
          </div>
        </motion.div>

        {/* Scan Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          onClick={handleScanQR}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 mb-6"
        >
          <Camera className="w-5 h-5" />
          <span>Scan QR Code with Camera</span>
        </motion.button>
      </div>
    </div>
  )
}
