import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Store nonces temporarily (in production, use Redis or database)
const nonceStore = new Map();

// Clean up old nonces every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [nonce, timestamp] of nonceStore.entries()) {
    if (timestamp < oneHourAgo) {
      nonceStore.delete(nonce);
    }
  }
}, 60 * 60 * 1000);

/**
 * Generate nonce for SIWE authentication
 * Based on: https://docs.world.org/mini-apps/commands/wallet-auth
 */
router.get('/', (req, res) => {
  try {
    // Generate secure nonce (at least 8 alphanumeric characters)
    const nonce = crypto.randomUUID().replace(/-/g, '');
    
    // Store nonce with timestamp for validation
    nonceStore.set(nonce, Date.now());
    
    console.log('🔑 Generated nonce for wallet auth:', nonce.substring(0, 8) + '...');
    
    // Set secure cookie with nonce (alternative to storing in memory)
    res.cookie('siwe_nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({ 
      nonce,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('💥 Nonce generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate nonce'
    });
  }
});

/**
 * Validate nonce (helper function for other routes)
 */
export const validateNonce = (nonce, req) => {
  // Check if nonce exists in store
  if (!nonceStore.has(nonce)) {
    return { valid: false, error: 'Nonce not found or expired' };
  }

  // Check if nonce is not too old (1 hour max)
  const timestamp = nonceStore.get(nonce);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  if (timestamp < oneHourAgo) {
    nonceStore.delete(nonce);
    return { valid: false, error: 'Nonce expired' };
  }

  // Check cookie nonce matches (if using cookies)
  const cookieNonce = req.cookies?.siwe_nonce;
  if (cookieNonce && cookieNonce !== nonce) {
    return { valid: false, error: 'Nonce mismatch' };
  }

  // Remove nonce after validation (single use)
  nonceStore.delete(nonce);
  
  return { valid: true };
};

export default router;
