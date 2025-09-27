// Simple Wallet Authentication using SIWE
// Based on: https://docs.world.org/mini-apps/commands/wallet-auth

export class SimpleWalletAuth {
  private static instance: SimpleWalletAuth;
  private user: any = null;

  static getInstance(): SimpleWalletAuth {
    if (!SimpleWalletAuth.instance) {
      SimpleWalletAuth.instance = new SimpleWalletAuth();
    }
    return SimpleWalletAuth.instance;
  }

  // Sign in with wallet authentication (SIWE) - Primary auth flow
  async signInWithWallet(): Promise<any> {
    const { MiniKit } = await import('@worldcoin/minikit-js');
    
    if (!MiniKit.isInstalled()) {
      throw new Error('Please open this app in World App to continue');
    }

    try {
      console.log('🔐 Starting wallet authentication...');

      // Get nonce from our Next.js API route
      const res = await fetch(`/api/nonce`);
      const { nonce } = await res.json();

      // Create wallet auth payload
      const walletAuthPayload = {
        nonce: nonce,
        requestId: `mofo-${Date.now()}`,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: 'Sign in to Mofo - Your On-chain Flirt Operator. Connect your World ID verified identity with your wallet.',
      };

      console.log('🚀 Executing wallet auth command...');

      // Execute wallet auth command as per World docs
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthPayload);

      if (finalPayload.status === 'error') {
        throw new Error(`Wallet authentication failed: ${finalPayload.error_code || 'Unknown error'}`);
      }

      console.log('✅ Wallet auth successful, verifying signature...');

      // Complete SIWE verification on backend
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.isValid) {
        throw new Error(result.message || 'SIWE verification failed');
      }

      // Store user data
      this.user = {
        walletAddress: finalPayload.address,
        signature: finalPayload.signature,
        message: finalPayload.message,
        version: finalPayload.version,
        authMethod: 'wallet',
        signedAt: new Date().toISOString(),
      };

      // Get additional user info from MiniKit
      try {
        const additionalUser = await MiniKit.getUserByAddress(finalPayload.address);
        this.user = {
          ...this.user,
          username: additionalUser.username,
          profilePictureUrl: additionalUser.profilePictureUrl,
          permissions: (additionalUser as any).permissions,
        };
      } catch (error) {
        console.log('Could not fetch additional user info:', error);
      }

      // Persist session
      this.persistSession();

      console.log('🎉 Wallet authentication complete!', this.user);
      return this.user;

    } catch (error: any) {
      console.error('💥 Wallet authentication error:', error);
      throw error;
    }
  }

  // Access wallet address directly from MiniKit
  getWalletAddress(): string | null {
    if (typeof window !== 'undefined') {
      const { MiniKit } = require('@worldcoin/minikit-js');
      return MiniKit.walletAddress || (window as any).MiniKit?.walletAddress || null;
    }
    return null;
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return !!this.user;
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Sign out
  signOut() {
    this.user = null;
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wallet_auth_user');
    }
  }

  // Persist session to localStorage
  persistSession() {
    if (typeof window !== 'undefined' && this.user) {
      localStorage.setItem('wallet_auth_user', JSON.stringify(this.user));
    }
  }

  // Restore session from localStorage
  restoreSession(): boolean {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('wallet_auth_user');
        
        if (storedUser) {
          this.user = JSON.parse(storedUser);
          return true;
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
    return false;
  }
}
