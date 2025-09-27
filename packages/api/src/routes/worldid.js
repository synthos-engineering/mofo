import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * Verify World ID Proof - CRITICAL SECURITY ENDPOINT
 * Based on: https://docs.world.org/api-reference/verify-proof
 * 
 * This endpoint MUST be called from your frontend after receiving the proof
 * to ensure the proof is valid and hasn't been tampered with.
 */
router.post('/verify', async (req, res) => {
  try {
    const { proof, merkle_root, nullifier_hash, verification_level, action, signal } = req.body;

    // Validate required fields
    if (!proof || !merkle_root || !nullifier_hash || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: proof, merkle_root, nullifier_hash, action'
      });
    }

    // Validate environment
    if (!process.env.WLD_APP_ID) {
      console.error('WLD_APP_ID not configured');
      return res.status(500).json({
        success: false,
        error: 'World ID not configured on server'
      });
    }

    console.log('🔍 Verifying World ID proof:', {
      appId: process.env.WLD_APP_ID,
      action,
      signal,
      verification_level
    });

    // Call World ID verification API
    // According to docs: POST /api/v2/verify/{app_id}
    const verifyUrl = `https://developer.worldcoin.org/api/v2/verify/${process.env.WLD_APP_ID}`;
    
    const verifyPayload = {
      proof,
      merkle_root,
      nullifier_hash,
      verification_level: verification_level || 'device',
      action,
      signal: signal || ''
    };

    console.log('📤 Sending verification request to World API...');

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mofo-App/1.0.0'
      },
      body: JSON.stringify(verifyPayload)
    });

    const result = await response.json();

    console.log('📨 World API response:', {
      status: response.status,
      success: result.success,
      code: result.code
    });

    if (!response.ok) {
      console.error('❌ World ID verification failed:', result);
      return res.status(400).json({
        success: false,
        error: 'Proof verification failed',
        details: result.detail || result.code || 'Unknown error',
        worldResponse: result
      });
    }

    if (result.success) {
      console.log('✅ World ID proof verified successfully!');
      
      // TODO: Store user verification in your database
      // TODO: Generate session token or JWT
      // TODO: Log the verification for audit purposes
      
      return res.json({
        success: true,
        message: 'Proof verified successfully',
        user: {
          nullifier_hash,
          verification_level,
          verified_at: new Date().toISOString()
        },
        worldResponse: result
      });
    } else {
      console.log('❌ World ID proof verification failed');
      return res.status(400).json({
        success: false,
        error: 'Invalid proof',
        worldResponse: result
      });
    }

  } catch (error) {
    console.error('💥 Proof verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during verification',
      message: error.message
    });
  }
});

/**
 * Get verification status for a nullifier hash
 */
router.get('/status/:nullifier_hash', async (req, res) => {
  try {
    const { nullifier_hash } = req.params;
    
    // TODO: Check your database for existing verification
    // For now, return a simple response
    
    res.json({
      success: true,
      nullifier_hash,
      status: 'unknown',
      message: 'Verification status check - implement database lookup'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export { router as worldIdRoutes };
