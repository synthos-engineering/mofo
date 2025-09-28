'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, RotateCcw, Info } from 'lucide-react'

interface AgentConfigurationScreenProps {
  onComplete: (agentData: {
    agentId: string
    personalityTraits: {
      openness: number
      conscientiousness: number
      extraversion: number
      agreeableness: number
      neuroticism: number
      communication_style: string
    }
  }) => void  // Enhanced to return agent creation data
  userId?: string  // Required for agent creation
  eegData?: {      // EEG data from previous step
    loveScore: number
    sessionId: string
  }
  onBack?: () => void
}

export function AgentConfigurationScreen({ onComplete, userId, eegData, onBack }: AgentConfigurationScreenProps) {
  // 🚧 HARDCODED: EEG-derived traits for consistent demo (based on wireframes)
  const [traits, setTraits] = useState({
    openness: 72,      // "Curious 72%" from wireframe W-09
    conscientiousness: 85, // "Organized 85%" from wireframe W-09  
    extraversion: 55,  // "Thoughtful 55%" from wireframe W-09
    agreeableness: 68  // "Caring 68%" from wireframe W-09
  })

  const [previewText, setPreviewText] = useState(
    "Your agent will be curious and adventurous, organized and reliable, introspective, and warm and cooperative."
  )

  const handleTraitChange = (trait: string, value: number) => {
    setTraits(prev => ({ ...prev, [trait]: value }))
    // Update preview based on traits
    updatePreview({ ...traits, [trait]: value })
  }

  const updatePreview = (newTraits: typeof traits) => {
    const descriptions = {
      openness: newTraits.openness > 50 ? 'curious and adventurous' : 'practical and traditional',
      conscientiousness: newTraits.conscientiousness > 50 ? 'organized and reliable' : 'flexible and spontaneous', 
      extraversion: newTraits.extraversion > 50 ? 'outgoing and energetic' : 'introspective and reserved',
      agreeableness: newTraits.agreeableness > 50 ? 'warm and cooperative' : 'direct and honest'
    }
    
    setPreviewText(
      `Your agent will be ${descriptions.openness}, ${descriptions.conscientiousness}, ${descriptions.extraversion}, and ${descriptions.agreeableness}.`
    )
  }

  const resetToEEGValues = () => {
    const eegTraits = {
      openness: eegData?.loveScore ? Math.min(eegData.loveScore + 20, 100) : 72,
      conscientiousness: eegData?.loveScore ? Math.min(eegData.loveScore + 30, 100) : 85,
      extraversion: eegData?.loveScore ? Math.max(eegData.loveScore - 10, 10) : 45,
      agreeableness: eegData?.loveScore ? Math.min(eegData.loveScore + 8, 100) : 68
    }
    setTraits(eegTraits)
    updatePreview(eegTraits)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}
      <div className="px-6 pt-4">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Your AI Agent</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 pb-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Dating Agent</h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            These traits were derived from your EEG. Adjust them to fine-tune your agent's personality.
          </p>
        </div>

        {/* EEG Data Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800 mb-1">EEG-Derived Traits</div>
              <div className="text-sm text-blue-700 mb-2">
                These personality dimensions were automatically calculated from your brainwave patterns. You can adjust them to better represent how you want your agent to behave.
              </div>
              {eegData && (
                <div className="bg-white border border-blue-200 rounded-lg p-3 mt-2">
                  <div className="text-xs text-blue-800">
                    <div>💖 Love Score: {eegData.loveScore}/100</div>
                    <div>🧠 Session: {eegData.sessionId}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trait Sliders */}
        <div className="space-y-6">
          {/* Openness */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Openness</h3>
              <span className="text-sm text-gray-500">{traits.openness}%</span>
            </div>
            <p className="text-sm text-gray-600">Curiosity and willingness to try new experiences</p>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Prefers routine</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.openness}
                  onChange={(e) => handleTraitChange('openness', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${traits.openness}%, #e5e5e5 ${traits.openness}%, #e5e5e5 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">Loves adventure</span>
            </div>
          </div>

          {/* Conscientiousness */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Conscientiousness</h3>
              <span className="text-sm text-gray-500">{traits.conscientiousness}%</span>
            </div>
            <p className="text-sm text-gray-600">Organization and attention to detail</p>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Spontaneous</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.conscientiousness}
                  onChange={(e) => handleTraitChange('conscientiousness', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${traits.conscientiousness}%, #e5e5e5 ${traits.conscientiousness}%, #e5e5e5 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">Very organized</span>
            </div>
          </div>

          {/* Extraversion */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Extraversion</h3>
              <span className="text-sm text-gray-500">{traits.extraversion}%</span>
            </div>
            <p className="text-sm text-gray-600">Energy gained from social interaction</p>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Enjoys solitude</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.extraversion}
                  onChange={(e) => handleTraitChange('extraversion', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${traits.extraversion}%, #e5e5e5 ${traits.extraversion}%, #e5e5e5 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">Life of the party</span>
            </div>
          </div>

          {/* Agreeableness */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Agreeableness</h3>
              <span className="text-sm text-gray-500">{traits.agreeableness}%</span>
            </div>
            <p className="text-sm text-gray-600">Tendency to be cooperative and trusting</p>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Direct & honest</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.agreeableness}
                  onChange={(e) => handleTraitChange('agreeableness', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${traits.agreeableness}%, #e5e5e5 ${traits.agreeableness}%, #e5e5e5 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">Warm & caring</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button 
          onClick={resetToEEGValues}
          className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-800 mx-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to EEG Values</span>
        </button>

        {/* Preview */}
        <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Agent Personality Preview</h3>
          <p className="text-sm text-gray-700">{previewText}</p>
        </div>

        {/* Create Agent Button */}
        <button
          onClick={() => {
            // Enhanced agent creation with EEG data (frontend-only)
            const agentData = {
              agentId: `agent_${userId || 'demo'}_${Date.now()}`,
              personalityTraits: {
                openness: traits.openness / 100,
                conscientiousness: traits.conscientiousness / 100,
                extraversion: traits.extraversion / 100,
                agreeableness: traits.agreeableness / 100,
                neuroticism: 0.3, // Default neuroticism
                communication_style: traits.extraversion > 50 ? 'casual' : 'analytical'
              }
            }
            
            console.log('🤖 Creating agent with data:', agentData)
            console.log('🧠 Using EEG session:', eegData?.sessionId)
            onComplete(agentData)
          }}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
        >
          Create My Agent
        </button>
      </div>
    </div>
  )
}
