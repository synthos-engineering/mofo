import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generateENSName(userId: string): string {
  // Generate a unique ENS name based on user ID
  const cleanId = userId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${cleanId}.agent.eth`;
}

export function calculateCompatibility(
  userProfile: any,
  targetProfile: any
): number {
  // Simple compatibility algorithm based on shared interests
  if (!userProfile?.interests || !targetProfile?.interests) {
    return Math.random() * 40 + 60; // Random between 60-100
  }

  const userInterests = new Set(userProfile.interests);
  const targetInterests = new Set(targetProfile.interests);
  
  const intersection = new Set(
    Array.from(userInterests).filter(x => targetInterests.has(x))
  );
  
  const union = new Set([...Array.from(userInterests), ...Array.from(targetInterests)]);
  
  const jaccardSimilarity = intersection.size / union.size;
  
  // Convert to percentage and add some randomness
  return Math.min(100, Math.max(0, jaccardSimilarity * 100 + (Math.random() * 20 - 10)));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function validateQRData(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    return (
      parsed.type === 'eeg-hub' &&
      typeof parsed.hubId === 'string' &&
      typeof parsed.endpoint === 'string'
    );
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateAgentPersonality(brainData: any): any {
  // Generate personality traits based on brain data
  const traits = [];
  
  if (brainData?.emotionalProfile?.openness > 0.7) {
    traits.push('adventurous', 'creative');
  }
  if (brainData?.emotionalProfile?.extraversion > 0.6) {
    traits.push('outgoing', 'social');
  }
  if (brainData?.emotionalProfile?.agreeableness > 0.7) {
    traits.push('empathetic', 'kind');
  }
  if (brainData?.emotionalProfile?.conscientiousness > 0.6) {
    traits.push('organized', 'reliable');
  }
  
  // Add some default traits if none were generated
  if (traits.length === 0) {
    traits.push('thoughtful', 'genuine');
  }

  return {
    traits,
    communicationStyle: brainData?.socialPreferences?.communication_style || 'balanced',
    interests: generateInterests(brainData),
  };
}

function generateInterests(brainData: any): string[] {
  const baseInterests = ['coffee', 'movies', 'music', 'travel'];
  const additionalInterests = [];

  if (brainData?.cognitivePatterns?.processing_speed > 0.7) {
    additionalInterests.push('technology', 'gaming');
  }
  if (brainData?.emotionalProfile?.openness > 0.8) {
    additionalInterests.push('art', 'philosophy', 'reading');
  }
  if (brainData?.emotionalProfile?.extraversion > 0.7) {
    additionalInterests.push('parties', 'networking', 'social events');
  }

  return [...baseInterests, ...additionalInterests].slice(0, 6);
}
