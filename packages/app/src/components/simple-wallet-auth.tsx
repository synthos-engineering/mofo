'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { SimpleWalletAuth } from '@/lib/wallet-auth-simple';

interface SimpleWalletAuthProps {
  onSuccess: (userData: any) => void;
  isLoading: boolean;
}

export function SimpleWalletAuthComponent({ onSuccess, isLoading }: SimpleWalletAuthProps) {
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const walletAuth = SimpleWalletAuth.getInstance();

  useEffect(() => {
    // Check if user already has a session
    if (walletAuth.restoreSession() && walletAuth.isSignedIn()) {
      const existingUser = walletAuth.getUser();
      setUser(existingUser);
      setAuthState('success');
      console.log('✅ Restored wallet session:', existingUser);
    }
  }, []);

  // Wallet Authentication (SIWE) - Primary auth flow as per World docs
  const handleWalletAuth = async () => {
    try {
      setAuthState('authenticating');
      setErrorMessage('');

      console.log('🔐 Starting wallet authentication...');
      
      const user = await walletAuth.signInWithWallet();
      
      setUser(user);
      setAuthState('success');
      
      onSuccess({
        authMethod: 'wallet',
        user,
        walletAddress: user.walletAddress,
        username: user.username,
        signature: user.signature,
        message: user.message,
        signedAt: user.signedAt,
        sessionPersistent: true,
      });

    } catch (error: any) {
      console.error('💥 Wallet authentication error:', error);
      setAuthState('error');
      
      let userMessage = 'Wallet authentication failed. Please try again.';
      if (error.message?.includes('World App')) {
        userMessage = 'Please open this app in World App to continue.';
      } else if (error.message?.includes('nonce')) {
        userMessage = 'Authentication expired. Please try again.';
      } else if (error.message?.includes('signature')) {
        userMessage = 'Signature verification failed. Please try again.';
      }
      
      setErrorMessage(userMessage);
    }
  };

  const renderContent = () => {
    if (authState === 'success' && user) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-black">Welcome to Mofo!</h3>
            <p className="text-gray-700">Successfully authenticated with your wallet</p>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {user.walletAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet:</span>
                  <span className="text-black font-mono text-sm">
                    {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(-4)}
                  </span>
                </div>
              )}
              {user.username && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="text-black font-medium">{user.username}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">✅ Verified Human</span>
              </div>
            </div>

            <button
              onClick={() => {
                walletAuth.signOut();
                setAuthState('idle');
                setUser(null);
              }}
              className="w-full bg-gray-200 text-black font-semibold py-2 px-4 rounded-xl transition-all duration-200 active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      );
    }

    if (authState === 'authenticating') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-black">Authenticating...</h3>
            <p className="text-gray-700">Please sign the message in World App</p>
          </div>
        </motion.div>
      );
    }

    if (authState === 'error') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-black">Authentication Failed</h3>
            <p className="text-gray-700">{errorMessage}</p>
            <button
              onClick={() => {
                setAuthState('idle');
                setErrorMessage('');
              }}
              className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-black">Connect Your Wallet</h2>
          <p className="text-gray-700 text-lg">Sign in with your World App wallet</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          <h4 className="font-semibold text-black text-lg">Why Wallet Authentication?</h4>
          <ul className="space-y-2 text-left text-gray-700">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Secure identity verification</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Access to your World ID profile</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Persistent session across visits</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>No personal data stored</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleWalletAuth}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        {renderContent()}
      </div>
    </div>
  );
}
