'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, ChevronLeft, Search, Check, AlertCircle } from 'lucide-react'
import { MiniKit, User } from '@worldcoin/minikit-js'

interface EnsClaimScreenProps {
  onComplete: (ensName: string) => void
  registeredEnsName?: string
  agentId?: string
  onBack?: () => void
}

export function EnsClaimScreen({ onComplete, registeredEnsName, agentId, onBack }: EnsClaimScreenProps) {
  const [ensName, setEnsName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cost, setCost] = useState<string>('12.50')
  const [walletAddress, setWalletAddress] = useState<string>('')
  
  // If ENS name was already registered during agent creation, show confirmation
  const isConfirmed = !!registeredEnsName

  const fullEnsName = `${ensName}${lastName ? `.${lastName}` : ''}.onlyagents.eth`

  useEffect(() => {
    // Get wallet address from MiniKit
    const getWalletAddress = async () => {
      if (MiniKit.isInstalled()) {
        try {
          const user: User = await MiniKit.user
          setWalletAddress(user.walletAddress || '')
          
          // Generate default name based on wallet address if available
          if (user.walletAddress && !ensName) {
            const defaultName = `agent-${user.walletAddress.substring(2, 8)}`
            setEnsName(defaultName)
          }
        } catch (error) {
          console.warn('Could not get wallet address from MiniKit:', error)
        }
      }
    }
    
    getWalletAddress()
  }, [ensName])

  const checkAvailability = async () => {
    if (!ensName.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate availability check for development
      console.log('🔍 Checking ENS availability for:', fullEnsName)
      
      // Mock API call - in production this would check actual ENS
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate available for development
      setIsAvailable(true)
      setCost('12.50')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability')
      setIsAvailable(null)
    } finally {
      setIsLoading(false)
    }
  }

  const registerEns = async () => {
    if (!walletAddress || !isAvailable) return

    setIsRegistering(true)
    setError(null)
    
    try {
      // Simulate ENS registration for development
      console.log('📝 Registering ENS:', fullEnsName, 'for:', walletAddress)
      
      // Mock registration process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store the registered ENS name in localStorage
      localStorage.setItem('agentEnsName', fullEnsName)
      
      console.log('✅ ENS registration complete:', fullEnsName)
      
      // Success! Pass the ENS name to parent
      onComplete(fullEnsName)
      
    } catch (err) {
      console.error('Error registering ENS:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsRegistering(false)
    }
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
          <span>Claim ENS Domain</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Globe className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isConfirmed ? 'Agent Identity Confirmed' : 'Claim Your Agent\'s Identity'}
          </h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            {isConfirmed 
              ? 'Your AI agent has been successfully registered with its ENS identity.'
              : 'Your AI agent needs a unique ENS name for authentication and matching'
            }
          </p>
        </div>

        {/* Confirmation Screen */}
        {isConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center space-y-6"
          >
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-green-800 mb-2">ENS Name Registered</h3>
              <p className="text-green-700 text-sm mb-4">Your agent's identity is now secured on the blockchain.</p>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="font-mono text-gray-800 font-semibold">{registeredEnsName}</div>
              </div>
            </div>

            <button
              onClick={() => onComplete(registeredEnsName!)}
              className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
            >
              Continue to Agent Ready
            </button>
          </motion.div>
        )}

        {/* Registration Screen (only show if not confirmed) */}
        {!isConfirmed && (
          <>
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </motion.div>
            )}

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
                    onChange={(e) => setEnsName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="flex-1 px-3 py-2 bg-gray-100 border-0 rounded-lg text-gray-800 font-medium"
                    placeholder="viman"
                    disabled={isRegistering}
                  />
                  <span className="text-gray-500">.</span>
                  <input
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="flex-1 px-3 py-2 bg-gray-200 border-0 rounded-lg text-gray-600"
                    placeholder="lastname"
                    disabled={isRegistering}
                  />
                </div>
                
                <div className="text-sm text-gray-500 mb-4">.onlyagents.eth</div>
                
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <div className="font-mono text-gray-800 font-semibold">{fullEnsName}</div>
                </div>
              </div>

              {/* Check Availability Button */}
              <button
                onClick={checkAvailability}
                disabled={isLoading || isRegistering || !ensName.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <span className="ml-auto text-sm text-green-600 font-medium">Available</span>
                    )}
                  </div>
                  
                  {isAvailable && (
                    <>
                      <div className="text-sm text-green-700 mb-2">
                        <div>Registration Cost: <span className="font-semibold">${cost}</span></div>
                        <div className="text-xs">Includes 1 year registration + gas fees</div>
                      </div>
                      
                      <button
                        onClick={registerEns}
                        disabled={isRegistering}
                        className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegistering ? (
                          <span className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Registering...</span>
                          </span>
                        ) : (
                          `Register ${fullEnsName} for $${cost}`
                        )}
                      </button>
                      
                      {/* Development Notice */}
                      <div className="text-xs text-gray-500 text-center mt-2">
                        MVP: ENS registration simulated for demo purposes
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Wallet Connection Notice */}
            {!walletAddress && (
              <div className="text-xs text-amber-600 text-center mt-auto">
                Please ensure your wallet is connected via World ID
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
