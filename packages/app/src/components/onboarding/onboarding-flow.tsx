'use client'

import { AuthState, OnboardingStep } from '@/types'
import { SplashScreen } from './steps/splash-screen'
import { WorldIdVerificationScreen } from './steps/worldid-verification-screen'
import { VerificationCompleteScreen } from './steps/verification-complete-screen'
import { EegPairingScreen } from './steps/eeg-pairing-screen'
import { EegCaptureScreen } from './steps/eeg-capture-screen'
import { AgentConfigurationScreen } from './steps/agent-configuration-screen'
import { EnsClaimScreen } from './steps/ens-claim-screen'
import { AgentReadyScreen } from './steps/agent-ready-screen'

interface OnboardingFlowProps {
  authState: AuthState
  onStepComplete: (nextStep: OnboardingStep, updatedState?: Partial<AuthState>) => void
}

export function OnboardingFlow({ authState, onStepComplete }: OnboardingFlowProps) {
  const renderStep = () => {
    switch (authState.currentStep) {
      case 'splash':
        return <SplashScreen onComplete={() => onStepComplete('worldid-verification')} />
      
      case 'worldid-verification':
        return (
          <WorldIdVerificationScreen 
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
            onComplete={() => onStepComplete('agent-configuration')} 
          />
        )
      
      case 'agent-configuration':
        return (
          <AgentConfigurationScreen 
            onComplete={() => onStepComplete('ens-claim')} 
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
        return <SplashScreen onComplete={() => onStepComplete('worldid-verification')} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  )
}
