'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { AgentDatingHub } from '@/components/hub/agent-dating-hub'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { AuthState, OnboardingStep } from '@/types'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    walletAddress: null,
    user: null,
    currentStep: 'splash'
  })

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('MiniKit installed:', MiniKit.isInstalled())
        
        if (MiniKit.isInstalled()) {
          console.log('Running in World App')
          
          // Check if user is already authenticated
          const walletAddress = (MiniKit as any).walletAddress
          if (walletAddress) {
            // Check if user has completed onboarding
            const savedStep = localStorage.getItem('onboarding-step')
            setAuthState({
              isAuthenticated: true,
              walletAddress,
              user: null,
              currentStep: (savedStep as OnboardingStep) || 'worldid-verification'
            })
          }
        } else {
          console.log('Running in browser - World App not detected')
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleStepComplete = (nextStep: OnboardingStep, updatedState?: Partial<AuthState>) => {
    localStorage.setItem('onboarding-step', nextStep)
    setAuthState(prev => ({
      ...prev,
      ...updatedState,
      currentStep: nextStep
    }))
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (authState.currentStep === 'dating-hub' || authState.currentStep === 'completed') {
    return <AgentDatingHub authState={authState} />
  }

  return (
    <OnboardingFlow 
      authState={authState} 
      onStepComplete={handleStepComplete}
    />
  )
}
