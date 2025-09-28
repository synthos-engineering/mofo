'use client'

import { AuthState, OnboardingStep } from '@/types'
import { SplashScreen } from './steps/splash-screen'
import { VerificationCompleteScreen } from './steps/verification-complete-screen'
import { EegPairingScreen } from './steps/eeg-pairing-screen'
import { EegCaptureScreen } from './steps/eeg-capture-screen'
import { AgentConfigurationScreen } from './steps/agent-configuration-screen'
import { EnsClaimScreen } from './steps/ens-claim-screen'
import { AgentReadyScreen } from './steps/agent-ready-screen'
import { useState } from 'react'

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
          />
        )
      
      case 'eeg-pairing':
        return (
          <EegPairingScreen 
            onComplete={() => onStepComplete('eeg-capture')} 
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
          />
        )
      
      case 'agent-configuration':
        return (
          <AgentConfigurationScreen 
            userId={authState.user?.id || authState.walletAddress || undefined}
            eegData={authState.user?.eegData}
            onComplete={(agentCreationData) => {
              // Store agent data in user object (following app-reference pattern)
              onStepComplete('ens-claim', {
                user: {
                  ...authState.user,
                  agentId: agentCreationData.agentId,
                  personalityTraits: agentCreationData.personalityTraits
                }
              })
            }} 
          />
        )
      
      case 'ens-claim':
        return (
          <EnsClaimScreen 
            onComplete={() => onStepComplete('agent-ready')} 
          />
        )
      
      case 'agent-ready':
        return (
          <AgentReadyScreen 
            onComplete={() => onStepComplete('dating-hub')} 
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
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  )
}
