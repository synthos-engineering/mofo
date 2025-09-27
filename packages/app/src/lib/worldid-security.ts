// World ID Security Utilities
// Enhanced security measures based on World documentation

interface WorldIDVerificationPayload {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: string;
  action: string;
  signal: string;
  app_id?: string;
  timestamp: number;
}

interface WorldIDVerificationResponse {
  success: boolean;
  error?: string;
  user?: {
    nullifier_hash: string;
    verification_level: string;
    verified_at: string;
  };
}

// Rate limiting for verification attempts
class VerificationRateLimit {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    this.attempts.set(identifier, recentAttempts);
    
    return recentAttempts.length < this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(Date.now());
    this.attempts.set(identifier, attempts);
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
}

const rateLimiter = new VerificationRateLimit();

// Security validators
export const SecurityValidators = {
  validateNullifierHash(hash: string): boolean {
    // World ID nullifier hashes are 32-byte hex strings
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  },

  validateProof(proof: string): boolean {
    // Basic validation - proof should be a non-empty string
    return typeof proof === 'string' && proof.length > 0;
  },

  validateMerkleRoot(root: string): boolean {
    // Merkle root should be a 32-byte hex string
    return /^0x[a-fA-F0-9]{64}$/.test(root);
  },

  validateTimestamp(timestamp: number): boolean {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    // Timestamp should be within 5 minutes of current time
    return Math.abs(now - timestamp) <= fiveMinutes;
  }
};

export async function secureWorldIDVerification(
  payload: WorldIDVerificationPayload
): Promise<WorldIDVerificationResponse> {
  // Security: Rate limiting by nullifier hash
  const identifier = payload.nullifier_hash;
  
  if (!rateLimiter.canAttempt(identifier)) {
    const remaining = rateLimiter.getRemainingAttempts(identifier);
    throw new Error(`Rate limit exceeded. ${remaining} attempts remaining. Please wait before trying again.`);
  }

  // Security: Input validation
  if (!payload.proof || !payload.merkle_root || !payload.nullifier_hash) {
    throw new Error('Missing required verification data');
  }

  if (!SecurityValidators.validateNullifierHash(payload.nullifier_hash)) {
    throw new Error('Invalid nullifier hash format');
  }

  if (!SecurityValidators.validateProof(payload.proof)) {
    throw new Error('Invalid proof format');
  }

  if (!SecurityValidators.validateMerkleRoot(payload.merkle_root)) {
    throw new Error('Invalid merkle root format');
  }

  if (!SecurityValidators.validateTimestamp(payload.timestamp)) {
    throw new Error('Invalid timestamp - verification request too old');
  }

  rateLimiter.recordAttempt(identifier);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mofoworld-verification.up.railway.app';
    
    const response = await fetch(`${apiUrl}/api/worldid/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': '1.0.0',
        'X-Timestamp': Date.now().toString(),
        'X-App-ID': process.env.NEXT_PUBLIC_WLD_APP_ID || '',
      },
      signal: controller.signal,
      body: JSON.stringify({
        ...payload,
        // Add additional security metadata
        client_timestamp: Date.now(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        origin: typeof window !== 'undefined' ? window.location.origin : '',
      })
    });

    clearTimeout(timeoutId);

    // Security: Validate response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Verification failed: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from verification server');
    }

    const result = await response.json();
    
    // Security: Validate response structure
    if (typeof result !== 'object' || result === null) {
      throw new Error('Invalid response from verification server');
    }

    // Security: Verify nullifier hash consistency
    if (result.success && result.user?.nullifier_hash !== payload.nullifier_hash) {
      throw new Error('Nullifier hash mismatch - possible tampering detected');
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Security: Don't expose internal errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Verification timed out. Please try again.');
      }
      if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
    }
    
    throw error;
  }
}

// Session management for verified users
export class VerifiedUserSession {
  private static instance: VerifiedUserSession;
  private sessions: Map<string, any> = new Map();

  static getInstance(): VerifiedUserSession {
    if (!VerifiedUserSession.instance) {
      VerifiedUserSession.instance = new VerifiedUserSession();
    }
    return VerifiedUserSession.instance;
  }

  createSession(userData: any): string {
    const sessionId = `mofo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, {
      ...userData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });
    return sessionId;
  }

  getSession(sessionId: string): any | null {
    return this.sessions.get(sessionId) || null;
  }

  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      this.sessions.set(sessionId, session);
    }
  }

  invalidateSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // Clean up old sessions (older than 24 hours)
  cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date(session.lastActivity) < oneDayAgo) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export default {
  secureWorldIDVerification,
  SecurityValidators,
  VerifiedUserSession,
};
