// World ID Types
export interface WorldIDUser {
  worldId: string;
  nullifierHash: string;
  merkleRoot: string;
  proof: string;
  credentialType: 'orb' | 'device';
  verificationLevel: 'orb' | 'device';
}

// EEG and Brain Data Types
export interface BrainWaveData {
  personalityVector: number[];
  emotionalProfile: {
    openness: number;
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
    neuroticism: number;
  };
  cognitivePatterns: {
    processing_speed: number;
    working_memory: number;
    attention_span: number;
  };
  socialPreferences: {
    communication_style: string;
    interaction_preference: string;
    conflict_resolution: string;
  };
  timestamp: string;
}

export interface EEGHubData {
  type: 'eeg-hub';
  hubId: string;
  endpoint: string;
  apiKey?: string;
}

// Agent Types
export interface AgentPersonality {
  traits: string[];
  communicationStyle: string;
  interests: string[];
}

export interface Agent {
  id: string;
  name: string;
  ensName: string;
  personality: AgentPersonality;
  avatar: string;
  status: 'creating' | 'training' | 'active' | 'inactive';
  deployedAt: string;
  ownerId: string;
}

// Dating Profile Types
export interface DatingProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  avatar: string;
  compatibility?: number;
  agentName: string;
  agentId: string;
  location?: string;
  preferences?: {
    ageRange: [number, number];
    distance: number;
    interests: string[];
  };
}

// Matching Types
export interface Match {
  id: string;
  userProfile: DatingProfile;
  matchedProfile: DatingProfile;
  compatibility: number;
  matchedAt: string;
  status: 'pending' | 'chatting' | 'date_proposed' | 'date_accepted' | 'date_completed';
  chatLog?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: 'user-agent' | 'matched-agent';
  message: string;
  timestamp: Date;
  type: 'text' | 'date_proposal' | 'system';
  metadata?: any;
}

// Date Types
export interface DateProposal {
  id: string;
  matchId: string;
  proposedBy: 'user-agent' | 'matched-agent';
  date: string;
  time: string;
  location: string;
  activity: string;
  status: 'proposed' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

// Staking Types
export interface StakeInfo {
  amount: string;
  token: string;
  contractAddress: string;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'released';
}

export interface DateStake {
  id: string;
  dateProposalId: string;
  userStake: StakeInfo;
  matchStake: StakeInfo;
  totalStaked: string;
  releaseConditions: {
    bothConfirmAttendance: boolean;
    minimumDuration: number; // in minutes
    mutualRating: boolean;
  };
  status: 'pending' | 'active' | 'completed' | 'disputed' | 'released';
}

// App State Types
export type AppState = 
  | 'welcome'
  | 'auth'
  | 'qr-scan'
  | 'brain-session'
  | 'agent-deployment'
  | 'matching'
  | 'chat'
  | 'date-proposal'
  | 'staking'
  | 'success';

export type SessionState = 
  | 'preparing'
  | 'recording'
  | 'processing'
  | 'complete';

export type MatchingState = 
  | 'searching'
  | 'swiping'
  | 'matched'
  | 'chatting'
  | 'date-proposed';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'match' | 'message' | 'date_proposal' | 'stake' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: any;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  isLoading: boolean;
  message?: string;
}

export interface ErrorProps {
  error: string | null;
  onRetry?: () => void;
}

