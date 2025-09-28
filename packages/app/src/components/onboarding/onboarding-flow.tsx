'use client'

import { AuthState, OnboardingStep } from '@/types'
import { SplashScreen } from './steps/splash-screen'
import { VerificationCompleteScreen } from './steps/verification-complete-screen'
import { EegPairingScreen } from './steps/eeg-pairing-screen'
import { EegCaptureScreen } from './steps/eeg-capture-screen'
import { AgentConfigurationScreen } from './steps/agent-configuration-screen'

import { AgentReadyScreen } from './steps/agent-ready-screen'
import { useState } from 'react'
import { EegConnectionProvider } from '@/contexts/EEGConnectionContext'

interface OnboardingFlowProps {
  authState: AuthState
  onStepComplete: (nextStep: OnboardingStep, updatedState?: Partial<AuthState>) => void
}

// Enhanced data passing between steps
interface EegData {
  loveScore: number
  sessionId: string
}

interface AgentData {
  agentId: string
  personalityTraits: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
    communication_style: string
  }
}

export function OnboardingFlow({ authState, onStepComplete }: OnboardingFlowProps) {
  // State to pass data between onboarding steps
  const [eegData, setEegData] = useState<EegData | null>(null)
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  
  // Helper function to get previous step
  const getPreviousStep = (currentStep: OnboardingStep): OnboardingStep | null => {
    const stepOrder: OnboardingStep[] = [
      'splash',
      'verification-complete', 
      'eeg-pairing',
      'eeg-capture',
      'agent-configuration',
      'agent-ready',
      'dating-hub'
    ]
    
    const currentIndex = stepOrder.indexOf(currentStep)
    return currentIndex > 0 ? stepOrder[currentIndex - 1] : null
  }
  
  // Back navigation handler
  const handleBackNavigation = () => {
    const previousStep = getPreviousStep(authState.currentStep)
    if (previousStep) {
      onStepComplete(previousStep)
    }
  }
  
  const renderStep = () => {
    switch (authState.currentStep) {
      case 'splash':
        return (
          <SplashScreen 
            onComplete={(walletAddress) => 
              onStepComplete('verification-complete', { 
                isAuthenticated: true, 
                walletAddress 
              })
            } 
          />
        )
      
      case 'verification-complete':
        return (
          <VerificationCompleteScreen 
            onComplete={() => onStepComplete('eeg-pairing')}
            onBack={handleBackNavigation}
          />
        )
      
      case 'eeg-pairing':
        return (
          <EegPairingScreen 
            onComplete={() => onStepComplete('eeg-capture')}
            onBack={handleBackNavigation}
          />
        )
      
      case 'eeg-capture':
        return (
          <EegCaptureScreen 
            userId={authState.user?.id || authState.walletAddress || undefined}
            onComplete={(loveScore, sessionId) => {
              // Store EEG data in user object (following app-reference pattern)
              onStepComplete('agent-configuration', {
                user: {
                  ...authState.user,
                  id: authState.user?.id || authState.walletAddress || `user_${Date.now()}`,
                  walletAddress: authState.walletAddress || undefined,
                  eegData: { loveScore, sessionId }
                }
              })
            }}
            onBack={handleBackNavigation}
          />
        )
      
      case 'agent-configuration':
        return (
          <AgentConfigurationScreen 
            userId={authState.user?.id || authState.walletAddress || undefined}
            eegData={authState.user?.eegData}
            onComplete={(agentCreationData) => {
              // Store agent data in user object and skip ENS - go directly to agent ready
              onStepComplete('agent-ready', {
                user: {
                  ...authState.user,
                  agentId: agentCreationData.agentId,
                  personalityTraits: agentCreationData.personalityTraits
                }
              })
            }}
            onBack={handleBackNavigation}
          />
        )
      
      case 'agent-ready':
        return (
          <AgentReadyScreen 
            onComplete={() => onStepComplete('dating-hub')}
            onBack={handleBackNavigation}
          />
        )
      
      default:
        return (
          <SplashScreen 
            onComplete={(walletAddress) => 
              onStepComplete('verification-complete', { 
                isAuthenticated: true, 
                walletAddress 
              })
            } 
          />
        )
    }
  }

  return (
    <EegConnectionProvider>
      <div className="min-h-screen bg-gray-50">
        {renderStep()}
      </div>
    </EegConnectionProvider>
  )
}
