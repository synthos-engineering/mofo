'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, RotateCcw, Info } from 'lucide-react'

interface AgentConfigurationScreenProps {
  onComplete: () => void
}

export function AgentConfigurationScreen({ onComplete }: AgentConfigurationScreenProps) {
  const [traits, setTraits] = useState({
    openness: 72,
    conscientiousness: 85,
    extraversion: 45,
    agreeableness: 68
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
    setTraits({
      openness: 72,
      conscientiousness: 85, 
      extraversion: 45,
      agreeableness: 68
    })
    updatePreview({
      openness: 72,
      conscientiousness: 85,
      extraversion: 45, 
      agreeableness: 68
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500">
        <span>W-07: Agent Seed</span>
        <div className="flex space-x-2">
          <button className="p-1">←</button>
          <button className="p-1">→</button>
        </div>
      </div>

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
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

        {/* EEG Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800 mb-1">EEG-Derived Traits</div>
              <div className="text-sm text-blue-700">
                These personality dimensions were automatically calculated from your brainwave patterns. You can adjust them to better represent how you want your agent to behave.
              </div>
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
          onClick={onComplete}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
        >
          Create My Agent
        </button>
      </div>
    </div>
  )
}
