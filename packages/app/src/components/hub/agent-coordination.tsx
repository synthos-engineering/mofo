'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Bot, MessageCircle, Check, Clock, Calendar, MapPin, Gift } from 'lucide-react'

interface AgentCoordinationProps {
  onComplete: () => void
}

const coordinationSteps = [
  { id: 1, text: 'Sending proposal to Elena\'s agent...', status: 'completed' },
  { id: 2, text: 'Agent reviewing your suggestion...', status: 'completed' },
  { id: 3, text: 'Checking Elena\'s calendar...', status: 'completed' },
  { id: 4, text: 'Negotiating optimal time...', status: 'in-progress' },
  { id: 5, text: 'Finalizing venue details...', status: 'pending' },
  { id: 6, text: 'Both agents have agreed!', status: 'pending' },
]

export function AgentCoordination({ onComplete }: AgentCoordinationProps) {
  const [currentStep, setCurrentStep] = useState(3)
  const [progress, setProgress] = useState(4)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < coordinationSteps.length) {
          const newStep = prev + 1
          setProgress(newStep)
          
          if (newStep === coordinationSteps.length) {
            setTimeout(() => {
              onComplete()
            }, 2000)
          }
          
          return newStep
        }
        return prev
      })
    }, 2000)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Agent Coordination</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 pb-6 space-y-6">
        {/* Agent Icons */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-2">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="text-sm font-medium">Your Agent</div>
          </motion.div>

          {/* Connection Animation */}
          <div className="flex items-center space-x-1">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          </div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="text-sm font-medium">Elena's Agent</div>
          </motion.div>
        </div>

        {/* Coordination Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Agents are Coordinating</span>
          </div>

          <div className="space-y-3">
            {coordinationSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: currentStep >= step.id ? 1 : 0.3,
                  x: 0 
                }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  currentStep > step.id 
                    ? 'bg-green-500' 
                    : currentStep === step.id 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : currentStep === step.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Clock className="w-3 h-3 text-gray-500" />
                  )}
                </div>
                <span className={`text-sm ${
                  currentStep >= step.id ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Your Proposal */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <h3 className="font-semibold text-blue-800 mb-3">Your Proposal</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>📅 Fri 8:00 PM</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>📍 Quiet Cafe (KL)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span>🎁 Gift card included</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Step {progress} of 6</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress / 6) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-blue-500 h-2 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
