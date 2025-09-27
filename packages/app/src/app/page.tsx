'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { AgentDatingHub } from '@/components/hub/agent-dating-hub'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { AuthState, OnboardingStep } from '@/types'

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    walletAddress: null,
    user: null,
    currentStep: 'splash'
  })

  useEffect(() => {
    const checkAuthState = () => {
      try {
        if (MiniKit.isInstalled()) {
          // Check if user is already signed in
          const walletAddress = (MiniKit as any).walletAddress
          if (walletAddress) {
            console.log('User already signed in:', walletAddress)
            
            // Check if user has completed onboarding
            const savedStep = localStorage.getItem('onboarding-step')
            
            if (savedStep === 'dating-hub' || savedStep === 'completed') {
              // User has completed full onboarding, go directly to hub
              setAuthState({
                isAuthenticated: true,
                walletAddress,
                user: null,
                currentStep: 'dating-hub'
              })
            } else if (savedStep) {
              // User is mid-onboarding, resume where they left off
              setAuthState({
                isAuthenticated: true,
                walletAddress,
                user: null,
                currentStep: (savedStep as OnboardingStep)
              })
            } else {
              // User is signed in but hasn't started onboarding
              setAuthState({
                isAuthenticated: true,
                walletAddress,
                user: null,
                currentStep: 'verification-complete'
              })
            }
          }
        }
      } catch (error) {
        console.error('Failed to check auth state:', error)
      }
    }

    checkAuthState()
  }, [])

  const handleStepComplete = (nextStep: OnboardingStep, updatedState?: Partial<AuthState>) => {
    localStorage.setItem('onboarding-step', nextStep)
    setAuthState(prev => ({
      ...prev,
      ...updatedState,
      currentStep: nextStep
    }))
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
