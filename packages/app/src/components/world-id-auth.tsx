'use client';

import { useState, useEffect } from 'react';
import { MiniKit, WalletAuthInput, MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface WorldIDAuthProps {
  onSuccess: (userData: any) => void;
  isLoading: boolean;
}

export function WorldIDAuth({ onSuccess, isLoading }: WorldIDAuthProps) {
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // No need for event subscriptions with the async method
    console.log('🔍 MiniKit available:', typeof window !== 'undefined' && MiniKit.isInstalled());
  }, []);

  const handleVerify = async () => {
    try {
      setVerificationState('verifying');
      setErrorMessage('');

      // Check if MiniKit is available
      if (!MiniKit.isInstalled()) {
        console.log('❌ MiniKit not installed');
        setVerificationState('error');
        setErrorMessage('Please open this app in World App to sign in.');
        return;
      }

      console.log('🔐 Starting wallet authentication...');

      // Get nonce from our API
      const nonceRes = await fetch('/api/nonce');
      if (!nonceRes.ok) {
        throw new Error('Failed to generate nonce');
      }
      const { nonce } = await nonceRes.json();

      // Create wallet auth payload as per World docs
      const walletAuthPayload: WalletAuthInput = {
        nonce: nonce,
        requestId: `mofo-${Date.now()}`,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: 'Sign in to Mofo - Your On-chain Flirt Operator. Connect your World ID verified identity with your wallet.',
      };

      console.log('🚀 Executing wallet auth command...');

      // Use walletAuth command (NOT verify command)
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthPayload);
      
      if (finalPayload.status === 'error') {
        console.log('❌ Wallet authentication failed:', finalPayload);
        setVerificationState('error');
        
        const errorCode = String(finalPayload.error_code || 'unknown');
        let errorMsg = 'Wallet authentication failed';
        
        if (errorCode === 'user_cancelled') {
          errorMsg = 'Sign-in cancelled by user';
        } else {
          errorMsg = `Error: ${errorCode}`;
        }
        
        setErrorMessage(errorMsg);
        return;
      }

      console.log('✅ Wallet auth successful, verifying SIWE signature...');

      // Complete SIWE verification on backend
      const siweResponse = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (!siweResponse.ok) {
        throw new Error(`SIWE verification failed: ${siweResponse.status}`);
      }

      const siweResult = await siweResponse.json();
      
      if (!siweResult.isValid) {
        throw new Error(siweResult.message || 'Invalid signature');
      }

      console.log('✅ Authentication successful!');
      setVerificationState('success');
      
      // Get additional user info from MiniKit
      let userData: any = {
        walletAddress: finalPayload.address,
        signature: finalPayload.signature,
        message: finalPayload.message,
        version: finalPayload.version,
        authMethod: 'wallet',
        verifiedAt: new Date().toISOString(),
        sessionId: `mofo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      try {
        const additionalUser = await MiniKit.getUserByAddress(finalPayload.address);
        userData = {
          ...userData,
          username: additionalUser.username,
          profilePictureUrl: additionalUser.profilePictureUrl,
          permissions: (additionalUser as any).permissions,
        };
      } catch (error) {
        console.log('Could not fetch additional user info:', error);
      }
      
      onSuccess(userData);
      
    } catch (error: any) {
      console.error('💥 Authentication error:', error);
      setVerificationState('error');
      
      if (error?.message?.includes('MiniKit')) {
        setErrorMessage('Please open this app in World App to continue.');
      } else if (error?.message?.includes('nonce')) {
        setErrorMessage('Authentication setup failed. Please try again.');
      } else if (error?.message?.includes('SIWE')) {
        setErrorMessage('Signature verification failed. Please try again.');
      } else {
        setErrorMessage(`Authentication failed: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'verifying':
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
                Signing You In
              </h3>
              <p className="text-gray-700 text-lg">
                Please confirm the sign-in request in World App
              </p>
            </div>
          </motion.div>
        );

      case 'success':
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
              <h3 className="text-2xl font-semibold text-black">
                Sign-in Successful!
              </h3>
              <p className="text-gray-700 text-lg">
                Welcome to Mofo. Proceeding to next step...
              </p>
            </div>
          </motion.div>
        );

      case 'error':
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
              <h3 className="text-2xl font-semibold text-black">
                Sign-in Failed
              </h3>
              <p className="text-gray-700 text-lg mb-6">
                {errorMessage || 'Unable to sign you in'}
              </p>
              <button
                onClick={handleVerify}
                className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 text-lg"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        );

      default:
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
              <h2 className="text-3xl font-bold text-black">
                Sign In to Mofo
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Connect your World App wallet to access your on-chain flirt operator
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <h4 className="font-semibold text-black text-lg">Why World App?</h4>
                <ul className="space-y-2 text-left text-gray-700">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Secure wallet authentication</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>World ID verified identity</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Privacy-preserving sign-in</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Prevents bots and fake profiles</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Sign In with World App</span>
                </>
              )}
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        {renderContent()}
      </div>
    </div>
  );
}
