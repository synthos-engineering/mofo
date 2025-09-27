'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Coffee, MapPin, Camera, X, AlertTriangle, ThumbsUp } from 'lucide-react'

interface AgentDateSummaryProps {
  onBack: () => void
  onPlanDate: () => void
  onPass: () => void
}

export function AgentDateSummary({ onBack, onPlanDate, onPass }: AgentDateSummaryProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Agent Date Summary</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 pb-6 space-y-6 overflow-y-auto">
        {/* Compatibility Score */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-pink-50 border border-pink-100 rounded-xl p-6 text-center"
        >
          <Coffee className="w-12 h-12 text-pink-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Agent Date Complete</h2>
          
          <div className="text-4xl font-bold text-pink-600 mb-2">8.2/10</div>
          <div className="text-sm text-gray-600 mb-4">Compatibility Score</div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full" style={{ width: '82%' }}></div>
          </div>
          
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            ✓ High Compatibility
          </div>
        </motion.div>

        {/* Meet Your Match */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Meet Your Match</h3>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
              <span className="text-pink-700 font-bold text-lg">E</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">Elena, 28</h4>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                <Camera className="w-3 h-3" />
                <span>Product Designer</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                <MapPin className="w-3 h-3" />
                <span>Kuala Lumpur, 2.3 km away</span>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                Creative soul who loves good coffee, weekend hikes, and discovering hidden gems around the city.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {['Design', 'Photography', 'Hiking', 'Coffee', '+2 more'].map((interest, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* How the Agent Date Went */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-4">How the Agent Date Went</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your agents had a delightful virtual coffee date, discovering strong compatibility and shared values
          </p>
        </motion.div>

        {/* Compatibility Highlights */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 border border-green-100 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Compatibility Highlights</span>
          </div>
          
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
              <span>Both value authenticity and meaningful conversations</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
              <span>Shared passion for creative pursuits and exploration</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
              <span>Similar life goals and relationship values</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
              <span>Compatible communication styles and humor</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
              <span>Both prioritize work-life balance</span>
            </div>
          </div>
        </motion.div>

        {/* Points to Consider */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-50 border border-yellow-100 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Points to Consider</span>
          </div>
          
          <div className="space-y-2 text-sm text-yellow-700">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
              <span>Elena is more of a night owl, you prefer early mornings</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
              <span>Different preferences for social vs. quiet weekends</span>
            </div>
          </div>
        </motion.div>

        {/* Agent Recommendation */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Agent Recommendation</span>
          </div>
          <p className="text-sm text-blue-700">
            Your agents both believe you would connect well over coffee and shared creative interests
          </p>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-gray-500 text-center"
        >
          <strong>Privacy Note:</strong> This summary is based on your agents' virtual date conversation. No personal conversation data is stored - only compatibility insights.
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={onPlanDate}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Plan a Date with Elena</span>
          </button>
          
          <button
            onClick={onPass}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Pass & Find Next Match</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
