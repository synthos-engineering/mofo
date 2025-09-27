'use client'

import { motion } from 'framer-motion'
import { Bot, ChevronLeft, Heart, MessageCircle, Calendar, Shield, Settings, Globe } from 'lucide-react'

interface AgentReadyScreenProps {
  onComplete: () => void
}

export function AgentReadyScreen({ onComplete }: AgentReadyScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Agent Created</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="flex items-center justify-center mb-8"
        >
          <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your AI Agent is Ready!</h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Meet your digital dating companion, powered by your unique personality
          </p>
        </motion.div>

        {/* Agent Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">VA</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Viman's Agent</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Globe className="w-3 h-3" />
                <span>viman.mofo.eth</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Personality Traits</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Curious 72%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Organized 85%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Thoughtful 55%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Caring 68%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What Your Agent Can Do */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="space-y-4 mb-8"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">What Your Agent Can Do</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Heart className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Smart Matching</div>
                <div className="text-sm text-gray-600">
                  Automatically finds compatible personalities based on your traits
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <MessageCircle className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Conversation Handling</div>
                <div className="text-sm text-gray-600">
                  Engages in meaningful chats that reflect your personality
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                <Calendar className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Date Coordination</div>
                <div className="text-sm text-gray-600">
                  Suggests and plans dates that align with mutual interests
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                <Shield className="w-3 h-3 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Privacy Protection</div>
                <div className="text-sm text-gray-600">
                  Your personal data stays secure with encrypted agent interactions
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Agent Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800">Agent Settings</h4>
              <p className="text-sm text-blue-700">Configure preferences and boundaries</p>
            </div>
            <button className="text-blue-600 font-medium">Configure</button>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          onClick={onComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
        >
          Start Auto-Matching
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="text-xs text-gray-500 text-center mt-4"
        >
          Your agent will begin finding compatible matches
        </motion.p>
      </div>
    </div>
  )
}
