// API configuration and utilities for the Agentic Hookups Mini App

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mofoworld-verification.up.railway.app';
const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:3002';

// World ID API endpoints
export const worldIdApi = {
  verify: async (proof: any) => {
    const response = await fetch(`${API_BASE_URL}/api/world-id/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proof),
    });
    return response.json();
  },
};

// EEG Hub API
export const eegHubApi = {
  connect: async (hubData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/eeg/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubData),
    });
    return response.json();
  },
  
  startSession: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/eeg/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });
    return response.json();
  },
  
  getBrainData: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/eeg/session/${sessionId}/data`);
    return response.json();
  },
};

// Agent API
export const agentApi = {
  create: async (userData: any, brainData: any) => {
    const response = await fetch(`${AGENT_API_URL}/api/agents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData, brainData }),
    });
    return response.json();
  },
  
  deploy: async (agentId: string) => {
    const response = await fetch(`${AGENT_API_URL}/api/agents/${agentId}/deploy`, {
      method: 'POST',
    });
    return response.json();
  },
  
  getStatus: async (agentId: string) => {
    const response = await fetch(`${AGENT_API_URL}/api/agents/${agentId}/status`);
    return response.json();
  },
  
  startMatching: async (agentId: string) => {
    const response = await fetch(`${AGENT_API_URL}/api/agents/${agentId}/match/start`, {
      method: 'POST',
    });
    return response.json();
  },
  
  getMatches: async (agentId: string) => {
    const response = await fetch(`${AGENT_API_URL}/api/agents/${agentId}/matches`);
    return response.json();
  },
  
  sendMessage: async (agentId: string, matchId: string, message: string) => {
    const response = await fetch(`${AGENT_API_URL}/api/agents/${agentId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matchId, message }),
    });
    return response.json();
  },
};

// Dating API
export const datingApi = {
  getProfiles: async (filters?: any) => {
    const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
    const response = await fetch(`${API_BASE_URL}/api/profiles${queryParams}`);
    return response.json();
  },
  
  proposeDate: async (matchId: string, dateProposal: any) => {
    const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/propose-date`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dateProposal),
    });
    return response.json();
  },
  
  acceptDate: async (proposalId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/date-proposals/${proposalId}/accept`, {
      method: 'POST',
    });
    return response.json();
  },
  
  declineDate: async (proposalId: string, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/date-proposals/${proposalId}/decline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },
};

// Staking API
export const stakingApi = {
  createStake: async (dateProposalId: string, amount: string) => {
    const response = await fetch(`${API_BASE_URL}/api/stakes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dateProposalId, amount }),
    });
    return response.json();
  },
  
  getStakeStatus: async (stakeId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/stakes/${stakeId}/status`);
    return response.json();
  },
  
  confirmAttendance: async (stakeId: string, attended: boolean) => {
    const response = await fetch(`${API_BASE_URL}/api/stakes/${stakeId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attended }),
    });
    return response.json();
  },
  
  releaseStake: async (stakeId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/stakes/${stakeId}/release`, {
      method: 'POST',
    });
    return response.json();
  },
};

// ENS API
export const ensApi = {
  registerAgent: async (agentId: string, ensName: string) => {
    const response = await fetch(`${API_BASE_URL}/api/ens/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentId, ensName }),
    });
    return response.json();
  },
  
  resolveENS: async (ensName: string) => {
    const response = await fetch(`${API_BASE_URL}/api/ens/resolve/${ensName}`);
    return response.json();
  },
};

// Error handling utility
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

// Request interceptor for authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  // Add authentication headers if needed
  const headers = {
    ...options.headers,
    // Add World ID token or other auth headers here
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

