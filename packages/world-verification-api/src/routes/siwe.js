import express from 'express';
import { verifySiweMessage } from '@worldcoin/minikit-js';
import { validateNonce } from './nonce.js';

const router = express.Router();

/**
 * Complete SIWE (Sign-In with Ethereum) authentication
 * Based on: https://docs.world.org/mini-apps/commands/wallet-auth
 */
router.post('/complete-siwe', async (req, res) => {
  try {
    const { payload, nonce } = req.body;

    // Validate request
    if (!payload || !nonce) {
      return res.status(400).json({
        status: 'error',
        isValid: false,
        message: 'Missing payload or nonce'
      });
    }

    // Validate payload structure
    if (payload.status !== 'success' || !payload.message || !payload.signature || !payload.address) {
      return res.status(400).json({
        status: 'error',
        isValid: false,
        message: 'Invalid payload structure'
      });
    }

    console.log('🔍 Verifying SIWE message for address:', payload.address);

    // Validate nonce
    const nonceValidation = validateNonce(nonce, req);
    if (!nonceValidation.valid) {
      return res.status(400).json({
        status: 'error',
        isValid: false,
        message: nonceValidation.error
      });
    }

    // Verify the SIWE message using World's verification function
    try {
      const validMessage = await verifySiweMessage(payload, nonce);
      
      if (!validMessage.isValid) {
        return res.status(400).json({
          status: 'error',
          isValid: false,
          message: 'Invalid SIWE signature'
        });
      }

      console.log('✅ SIWE verification successful for:', payload.address);

      // TODO: Create user session in your database
      // TODO: Generate session token if needed
      // TODO: Store wallet address and user data

      // Success response
      res.json({
        status: 'success',
        isValid: true,
        user: {
          walletAddress: payload.address,
          message: payload.message,
          signature: payload.signature,
          version: payload.version,
          verifiedAt: new Date().toISOString(),
        }
      });

    } catch (verificationError) {
      console.error('❌ SIWE verification failed:', verificationError);
      
      return res.status(400).json({
        status: 'error',
        isValid: false,
        message: 'SIWE signature verification failed',
        details: verificationError.message
      });
    }

  } catch (error) {
    console.error('💥 SIWE completion error:', error);
    res.status(500).json({
      status: 'error',
      isValid: false,
      message: 'Internal server error during SIWE verification',
      details: error.message
    });
  }
});

/**
 * Refresh wallet session (if needed)
 */
router.post('/refresh', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing wallet address'
      });
    }

    // TODO: Validate existing session
    // TODO: Generate new session token if needed

    res.json({
      status: 'success',
      message: 'Session refreshed',
      user: {
        walletAddress,
        refreshedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('💥 Session refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh session'
    });
  }
});

export default router;
