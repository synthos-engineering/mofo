// Wallet Authentication with SIWE (Sign-In with Ethereum)
// Replaces deprecated "Sign in with World ID"

export class WalletAuth {
  private static instance: WalletAuth;
  private user: any = null;
  private walletAddress: string | null = null;

  static getInstance(): WalletAuth {
    if (!WalletAuth.instance) {
      WalletAuth.instance = new WalletAuth();
    }
    return WalletAuth.instance;
  }

  // Generate nonce from backend (required for security)
  private async generateNonce(): Promise<string> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nonce`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate nonce');
    }

    const data = await response.json();
    return data.nonce;
  }

  // Sign in with wallet authentication (SIWE)
  async signInWithWallet(): Promise<any> {
    const { MiniKit } = await import('@worldcoin/minikit-js');
    
    if (!MiniKit.isInstalled()) {
      throw new Error('Please open this app in World App to continue');
    }

    try {
      // Get nonce from backend
      const nonce = await this.generateNonce();

      // Prepare wallet auth payload
      const walletAuthPayload = {
        nonce: nonce,
        requestId: `mofo-auth-${Date.now()}`,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: 'Sign in to Mofo - Your On-chain Flirt Operator. Connect your World ID verified identity with your wallet.',
      };

      console.log('🔐 Starting wallet authentication...', walletAuthPayload);

      // Execute wallet auth command
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthPayload);

      if (finalPayload.status === 'error') {
        throw new Error(`Wallet authentication failed: ${finalPayload.error_code || 'Unknown error'}`);
      }

      console.log('✅ Wallet auth successful, verifying signature...');

      // Verify the signature on backend
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complete-siwe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce: nonce,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify wallet signature');
      }

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.isValid) {
        throw new Error('Invalid wallet signature');
      }

      // Store user data
      this.walletAddress = finalPayload.address;
      this.user = {
        walletAddress: finalPayload.address,
        signature: finalPayload.signature,
        message: finalPayload.message,
        version: finalPayload.version,
        authMethod: 'wallet',
        signedAt: new Date().toISOString(),
      };

      // Also get additional user info from MiniKit
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

      console.log('🎉 Wallet authentication complete!', this.user);
      return this.user;

    } catch (error: any) {
      console.error('💥 Wallet authentication error:', error);
      throw error;
    }
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return !!this.walletAddress && !!this.user;
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Get wallet address
  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  // Sign out
  signOut() {
    this.user = null;
    this.walletAddress = null;
    
    // Clear any stored session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wallet_auth_user');
      localStorage.removeItem('wallet_address');
    }
  }

  // Persist session to localStorage
  persistSession() {
    if (typeof window !== 'undefined' && this.user) {
      localStorage.setItem('wallet_auth_user', JSON.stringify(this.user));
      localStorage.setItem('wallet_address', this.walletAddress || '');
    }
  }

  // Restore session from localStorage
  restoreSession(): boolean {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('wallet_auth_user');
        const storedAddress = localStorage.getItem('wallet_address');
        
        if (storedUser && storedAddress) {
          this.user = JSON.parse(storedUser);
          this.walletAddress = storedAddress;
          return true;
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
    return false;
  }
}
