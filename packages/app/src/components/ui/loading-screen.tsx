'use client'

import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mx-auto"
        >
          <Brain className="w-16 h-16 text-gray-800" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gradient">MoFo</h1>
          <p className="text-gray-600">My On-chain Flirt Operator</p>
        </div>
        
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-gray-500"
        >
          Loading your perfect matches...
        </motion.div>
      </div>
    </div>
  )
}
