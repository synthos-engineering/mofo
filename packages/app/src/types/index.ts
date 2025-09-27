export interface User {
  id: string
  name: string
  age: number
  bio: string
  images: string[]
  walletAddress?: string
  isVerified: boolean
  interests: string[]
  location: string
  ensName?: string
  personalityTraits?: PersonalityTraits
}

export interface PersonalityTraits {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export interface Agent {
  id: string
  name: string
  ensName: string
  personalityTraits: PersonalityTraits
  isActive: boolean
  userId: string
  createdAt: Date
}

export interface AgentDate {
  id: string
  agentId: string
  matchedAgentId: string
  compatibilityScore: number
  status: 'proposed' | 'coordinating' | 'agreed' | 'completed'
  proposedDate?: Date
  proposedVenue?: string
  stakeAmount?: number
  createdAt: Date
}

export interface AuthState {
  isAuthenticated: boolean
  walletAddress: string | null
  user: User | null
  currentStep: OnboardingStep
}

export type OnboardingStep = 
  | 'splash'
  | 'verification-complete'
  | 'eeg-pairing'
  | 'eeg-capture'
  | 'agent-configuration'
  | 'ens-claim'
  | 'agent-ready'
  | 'dating-hub'
  | 'completed'
