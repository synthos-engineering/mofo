'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ChevronLeft, Search, Check } from 'lucide-react'

interface EnsClaimScreenProps {
  onComplete: () => void
}

export function EnsClaimScreen({ onComplete }: EnsClaimScreenProps) {
  const [ensName, setEnsName] = useState('viman')
  const [lastName, setLastName] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkAvailability = async () => {
    setIsLoading(true)
    // Simulate availability check
    setTimeout(() => {
      setIsAvailable(true)
      setIsLoading(false)
    }, 1500)
  }

  const registerEns = () => {
    // Simulate ENS registration
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  const fullEnsName = `${ensName}${lastName ? `.${lastName}` : ''}.mofo.eth`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Claim ENS Domain</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Globe className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Your Agent's Identity</h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Your AI agent needs a unique ENS name for authentication and matching
          </p>
        </div>

        {/* ENS Name Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Your ENS Name
            </label>
            
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={ensName}
                onChange={(e) => setEnsName(e.target.value)}
                className="px-3 py-2 bg-gray-100 border-0 rounded-lg text-gray-800 font-medium"
                placeholder="firstname"
              />
              <span className="text-gray-500">.</span>
              <input
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-3 py-2 bg-gray-200 border-0 rounded-lg text-gray-600"
                placeholder="lastname"
              />
            </div>
            
            <div className="text-sm text-gray-500 mb-4">.mofo.eth</div>
            
            <div className="bg-gray-100 rounded-lg p-3 text-center">
              <div className="font-mono text-gray-800">{fullEnsName}</div>
            </div>
          </div>

          {/* Check Availability Button */}
          <button
            onClick={checkAvailability}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Checking...' : 'Check Availability'}</span>
          </button>

          {/* Availability Result */}
          {isAvailable !== null && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                isAvailable 
                  ? 'bg-green-50 border-green-100' 
                  : 'bg-red-50 border-red-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Check className={`w-5 h-5 ${isAvailable ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${isAvailable ? 'text-green-800' : 'text-red-800'}`}>
                  {isAvailable ? 'Available!' : 'Not Available'}
                </span>
                {isAvailable && (
                  <span className="text-green-600 text-sm">Available</span>
                )}
              </div>
              
              {isAvailable && (
                <>
                  <div className="text-sm text-green-700 mb-2">
                    <div>Registration Cost: <span className="font-semibold">$12.50</span></div>
                    <div>Includes 1 year registration + gas fees</div>
                  </div>
                  
                  <button
                    onClick={registerEns}
                    className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold mt-4"
                  >
                    Register {fullEnsName} for $12.50
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* MVP Notice */}
        <div className="text-xs text-gray-500 text-center mt-auto">
          MVP: ENS registration simulated for demo purposes
        </div>
      </div>
    </div>
  )
}
