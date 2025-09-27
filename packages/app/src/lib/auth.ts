// Combined World ID Authentication
// Sign in with World ID (OIDC) + Incognito Actions

export class WorldAuth {
  private static instance: WorldAuth;
  private user: any = null;
  private accessToken: string | null = null;

  static getInstance(): WorldAuth {
    if (!WorldAuth.instance) {
      WorldAuth.instance = new WorldAuth();
    }
    return WorldAuth.instance;
  }

  // SIGN IN WITH WORLD ID (OIDC) - For authentication
  initiateSignIn() {
    const clientId = process.env.NEXT_PUBLIC_WLD_APP_ID;
    const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`);
    const state = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // Store state and nonce for validation
    sessionStorage.setItem('auth_state', state);
    sessionStorage.setItem('auth_nonce', nonce);

    const authUrl = `https://id.worldcoin.org/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid%20profile&state=${state}&nonce=${nonce}`;
    
    window.location.href = authUrl;
  }

  // Handle auth callback
  async handleCallback(code: string, state: string) {
    const storedState = sessionStorage.getItem('auth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for tokens on your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` 
      }),
    });

    const data = await response.json();
    
    if (data.access_token) {
      this.accessToken = data.access_token;
      this.user = data.user;
      return data.user;
    }
    
    throw new Error('Authentication failed');
  }

  // Get user info from access token
  async getUserInfo() {
    if (!this.accessToken) return null;

    const response = await fetch('https://id.worldcoin.org/userinfo', {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });

    return await response.json();
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return !!this.accessToken && !!this.user;
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Sign out
  signOut() {
    this.user = null;
    this.accessToken = null;
    sessionStorage.removeItem('auth_state');
    sessionStorage.removeItem('auth_nonce');
  }
}
