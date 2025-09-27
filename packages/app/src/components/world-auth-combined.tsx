'use client';

import { useState, useEffect } from 'react';
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Loader2, AlertCircle, User, Key } from 'lucide-react';
import { WorldAuth } from '@/lib/auth';

interface CombinedWorldAuthProps {
  onSuccess: (userData: any) => void;
  isLoading: boolean;
}

export function CombinedWorldAuth({ onSuccess, isLoading }: CombinedWorldAuthProps) {
  const [authState, setAuthState] = useState<'idle' | 'signin' | 'verifying' | 'success' | 'error'>('idle');
  const [authMethod, setAuthMethod] = useState<'signin' | 'incognito' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const worldAuth = WorldAuth.getInstance();

  useEffect(() => {
    // Check if user is already signed in
    if (worldAuth.isSignedIn()) {
      setUser(worldAuth.getUser());
      setAuthState('success');
    }

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setAuthState('signin');
      const user = await worldAuth.handleCallback(code, state);
      setUser(user);
      setAuthState('success');
      onSuccess({
        authMethod: 'signin',
        user,
        worldId: user.sub,
        verificationLevel: user['https://id.worldcoin.org/v1']?.verification_level,
        signedIn: true,
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setAuthState('error');
      setErrorMessage('Sign-in failed. Please try again.');
    }
  };

  // Sign in with World ID (OIDC)
  const handleSignIn = () => {
    try {
      setAuthMethod('signin');
      worldAuth.initiateSignIn();
    } catch (error: any) {
      setAuthState('error');
      setErrorMessage('Failed to initiate sign-in.');
    }
  };

  // Incognito Action (for specific actions)
  const handleIncognitoAction = async (action: string = 'login') => {
    try {
      setAuthState('verifying');
      setAuthMethod('incognito');
      setErrorMessage('');

      if (!MiniKit.isInstalled()) {
        setAuthState('error');
        setErrorMessage('Please open this app in World App for incognito verification.');
        return;
      }

      const verifyPayload: VerifyCommandInput = {
        action,
        signal: `mofo-${action}-${Date.now()}`,
        verification_level: VerificationLevel.Device,
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      
      if (finalPayload.status === 'error') {
        const errorCode = String(finalPayload.error_code || 'unknown');
        let errorMsg = 'Verification failed';
        
        if (errorCode === 'action_not_found') {
          errorMsg = `Action "${action}" not found in Developer Portal`;
        } else if (errorCode === 'user_cancelled') {
          errorMsg = 'Verification cancelled by user';
        }
        
        setAuthState('error');
        setErrorMessage(errorMsg);
        return;
      }

      // Verify proof on backend
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/worldid/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action,
          signal: verifyPayload.signal,
          proof: finalPayload.proof,
          merkle_root: finalPayload.merkle_root,
          nullifier_hash: finalPayload.nullifier_hash,
          verification_level: finalPayload.verification_level,
        }),
      });

      const result = await verifyResponse.json();

      if (result.success) {
        setAuthState('success');
        onSuccess({
          authMethod: 'incognito',
          action,
          worldId: finalPayload.verification_level,
          nullifierHash: finalPayload.nullifier_hash,
          merkleRoot: finalPayload.merkle_root,
          proof: finalPayload.proof,
          verification_level: finalPayload.verification_level,
          backendVerified: true,
        });
      } else {
        setAuthState('error');
        setErrorMessage('Backend verification failed.');
      }
    } catch (error: any) {
      setAuthState('error');
      setErrorMessage(error.message || 'Verification failed');
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
            <h3 className="text-2xl font-semibold text-black">Welcome!</h3>
            <p className="text-gray-700">You're successfully signed in with World ID</p>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Verification:</span>
                <span className="text-black font-medium">
                  {user['https://id.worldcoin.org/v1']?.verification_level || 'device'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">✅ Verified Human</span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (authState === 'signin' || authState === 'verifying') {
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
            <h3 className="text-2xl font-semibold text-black">
              {authMethod === 'signin' ? 'Signing In...' : 'Verifying...'}
            </h3>
            <p className="text-gray-700">
              {authMethod === 'signin' 
                ? 'Please complete sign-in with World ID' 
                : 'Please complete verification in World App'
              }
            </p>
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
              onClick={() => setAuthState('idle')}
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
          <h2 className="text-3xl font-bold text-black">Choose Authentication</h2>
          <p className="text-gray-700 text-lg">Sign in or verify specific actions with World ID</p>
        </div>

        <div className="space-y-4">
          {/* Sign in with World ID */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-3"
          >
            <User className="w-5 h-5" />
            <span>Sign in with World ID</span>
          </button>

          {/* Incognito Action */}
          <button
            onClick={() => handleIncognitoAction('login')}
            disabled={isLoading}
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-3"
          >
            <Key className="w-5 h-5" />
            <span>Verify with Incognito Action</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          <h4 className="font-semibold text-black">What's the difference?</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Sign in:</strong> Standard OAuth authentication, stores session</p>
            <p><strong>Incognito:</strong> Cryptographic proof, privacy-preserving verification</p>
          </div>
        </div>
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
