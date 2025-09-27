'use client';

import { useState, useEffect } from 'react';
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Loader2, AlertCircle, Wallet, Key } from 'lucide-react';
import { WalletAuth } from '@/lib/wallet-auth';

interface WalletAuthCombinedProps {
  onSuccess: (userData: any) => void;
  isLoading: boolean;
}

export function WalletAuthCombined({ onSuccess, isLoading }: WalletAuthCombinedProps) {
  const [authState, setAuthState] = useState<'idle' | 'wallet-auth' | 'verifying' | 'success' | 'error'>('idle');
  const [authMethod, setAuthMethod] = useState<'wallet' | 'incognito' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const walletAuth = WalletAuth.getInstance();

  useEffect(() => {
    // Check if user already has a wallet session
    if (walletAuth.restoreSession() && walletAuth.isSignedIn()) {
      const existingUser = walletAuth.getUser();
      setUser(existingUser);
      setAuthState('success');
      console.log('✅ Restored wallet session:', existingUser);
    }
  }, []);

  // Wallet Authentication (SIWE) - Replaces deprecated Sign in with World ID
  const handleWalletAuth = async () => {
    try {
      setAuthState('wallet-auth');
      setAuthMethod('wallet');
      setErrorMessage('');

      if (!MiniKit.isInstalled()) {
        setAuthState('error');
        setErrorMessage('Please open this app in World App for wallet authentication.');
        return;
      }

      console.log('🔐 Starting wallet authentication...');
      
      const user = await walletAuth.signInWithWallet();
      
      // Persist session
      walletAuth.persistSession();
      
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

  // Incognito Action (for specific actions) - Keep existing functionality
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
          sessionPersistent: false,
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
            <p className="text-gray-700">
              {authMethod === 'wallet' 
                ? 'Successfully authenticated with your wallet'
                : 'Successfully verified with World ID'
              }
            </p>
            
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
                <span className="text-gray-600">Auth Method:</span>
                <span className="text-green-600 font-medium">
                  {authMethod === 'wallet' ? '🔐 Wallet Auth' : '🕵️ Incognito'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">✅ Verified Human</span>
              </div>
            </div>

            {authMethod === 'wallet' && (
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
            )}
          </div>
        </motion.div>
      );
    }

    if (authState === 'wallet-auth' || authState === 'verifying') {
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
              {authMethod === 'wallet' ? 'Authenticating Wallet...' : 'Verifying...'}
            </h3>
            <p className="text-gray-700">
              {authMethod === 'wallet' 
                ? 'Please sign the message in World App' 
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
              onClick={() => {
                setAuthState('idle');
                setAuthMethod(null);
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
          <h2 className="text-3xl font-bold text-black">Choose Authentication</h2>
          <p className="text-gray-700 text-lg">Connect your wallet or verify specific actions</p>
        </div>

        <div className="space-y-4">
          {/* Wallet Authentication (SIWE) - Recommended */}
          <button
            onClick={handleWalletAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-3"
          >
            <Wallet className="w-5 h-5" />
            <div className="text-left">
              <div>Connect Wallet</div>
              <div className="text-sm text-blue-200">Recommended • Persistent session</div>
            </div>
          </button>

          {/* Incognito Action */}
          <button
            onClick={() => handleIncognitoAction('login')}
            disabled={isLoading}
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-3"
          >
            <Key className="w-5 h-5" />
            <div className="text-left">
              <div>Verify with Action</div>
              <div className="text-sm text-gray-300">Privacy-first • No persistent session</div>
            </div>
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          <h4 className="font-semibold text-black">What's the difference?</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Wallet Auth:</strong> Sign with your wallet, get persistent session + user profile</p>
            <p><strong>Incognito:</strong> Zero-knowledge proof, maximum privacy, single-use verification</p>
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
