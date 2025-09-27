import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * OAuth Token Exchange for Sign in with World ID
 * Exchanges authorization code for access token and user info
 */
router.post('/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;

    if (!code || !redirect_uri) {
      return res.status(400).json({
        success: false,
        error: 'Missing code or redirect_uri'
      });
    }

    const clientId = process.env.WLD_APP_ID;
    const clientSecret = process.env.WLD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        error: 'World ID not configured'
      });
    }

    console.log('🔄 Exchanging authorization code for tokens...');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://id.worldcoin.org/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorText);
      return res.status(400).json({
        success: false,
        error: 'Token exchange failed',
        details: errorText
      });
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Tokens received');

    // Get user info with access token
    const userResponse = await fetch('https://id.worldcoin.org/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ User info request failed:', errorText);
      return res.status(400).json({
        success: false,
        error: 'Failed to get user info',
        details: errorText
      });
    }

    const userInfo = await userResponse.json();
    console.log('✅ User info retrieved:', {
      sub: userInfo.sub,
      verification_level: userInfo['https://id.worldcoin.org/v1']?.verification_level
    });

    // TODO: Store user session in your database
    // TODO: Generate your own session token if needed

    res.json({
      success: true,
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      user: userInfo,
      expires_in: tokens.expires_in,
    });

  } catch (error) {
    console.error('💥 OAuth token exchange error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Missing refresh_token'
      });
    }

    const clientId = process.env.WLD_APP_ID;
    const clientSecret = process.env.WLD_CLIENT_SECRET;

    const tokenResponse = await fetch('https://id.worldcoin.org/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(400).json({
        success: false,
        error: 'Token refresh failed',
        details: tokens
      });
    }

    res.json({
      success: true,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    });

  } catch (error) {
    console.error('💥 Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as authRoutes };
