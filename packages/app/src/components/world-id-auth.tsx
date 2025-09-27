'use client';

import { useState, useEffect } from 'react';
import { MiniKit, ResponseEvent, MiniAppVerifyActionPayload } from '@worldcoin/minikit-js';
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
    // Don't check MiniKit.isInstalled() on mount - let it load naturally
    const handleVerifyResponse = async (response: MiniAppVerifyActionPayload) => {
      console.log('📨 Verification response received:', response);
      
      if (response.status === 'success') {
        console.log('✅ Frontend verification successful, now validating proof on backend...');
        
        try {
          // CRITICAL: Validate proof on backend according to World docs
          const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/worldid/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              proof: response.proof,
              merkle_root: response.merkle_root,
              nullifier_hash: response.nullifier_hash,
              verification_level: response.verification_level,
              action: process.env.NEXT_PUBLIC_WLD_ACTION || 'login',
              signal: 'mofo-verification'
            })
          });

          const backendResult = await backendResponse.json();
          console.log('📨 Backend verification result:', backendResult);

          if (backendResult.success) {
            console.log('✅ Backend verification successful!');
            setVerificationState('success');
            onSuccess({
              worldId: response.verification_level,
              nullifierHash: response.nullifier_hash,
              merkleRoot: response.merkle_root,
              proof: response.proof,
              verification_level: response.verification_level,
              backendVerified: true,
              user: backendResult.user
            });
          } else {
            console.log('❌ Backend verification failed:', backendResult);
            setVerificationState('error');
            setErrorMessage(`Backend verification failed: ${backendResult.error}`);
          }
        } catch (error) {
          console.error('💥 Backend verification error:', error);
          setVerificationState('error');
          setErrorMessage('Failed to verify proof on server. Please try again.');
        }
      } else {
        console.log('❌ Frontend verification failed:', response);
        setVerificationState('error');
        
        // More specific error messages based on World docs
        let errorMsg = 'Verification failed';
        if (response.error_code === 'action_not_found') {
          errorMsg = `Action "${process.env.NEXT_PUBLIC_WLD_ACTION}" not found in Developer Portal`;
        } else if (response.error_code === 'invalid_action') {
          errorMsg = 'Invalid action configuration';
        } else if (response.error_code === 'user_cancelled') {
          errorMsg = 'Verification cancelled by user';
        } else if (response.error_code) {
          errorMsg = `Error: ${response.error_code}`;
        }
        
        setErrorMessage(errorMsg);
      }
    };

    // Always subscribe to events - MiniKit will handle if it's available
    if (typeof window !== 'undefined') {
      MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, handleVerifyResponse);
    }

    return () => {
      if (typeof window !== 'undefined') {
        MiniKit.unsubscribe(ResponseEvent.MiniAppVerifyAction);
      }
    };
  }, [onSuccess]);

  const handleVerify = async () => {
    try {
      setVerificationState('verifying');
      setErrorMessage('');

      // Debug logging
      console.log('🔍 Environment check:', {
        appId: process.env.NEXT_PUBLIC_WLD_APP_ID,
        action: process.env.NEXT_PUBLIC_WLD_ACTION,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      });

      // Check if MiniKit is available only when trying to verify
      if (!MiniKit.isInstalled()) {
        console.log('❌ MiniKit not installed');
        setVerificationState('error');
        setErrorMessage('Please open this app in World App to verify your identity.');
        return;
      }

      console.log('✅ MiniKit detected, starting verification...');

      // Use MiniKit.commands.verify with proper error handling
      const verifyPayload = {
        action: process.env.NEXT_PUBLIC_WLD_ACTION || 'login',
        signal: 'mofo-verification',
        verification_level: 'device',
      };

      console.log('🚀 Verification payload:', verifyPayload);

      const result = MiniKit.commands.verify(verifyPayload as any);
      
      console.log('📤 Verification initiated:', result);
      
      // The response will be handled by the event listener
    } catch (error: any) {
      console.error('💥 Verification error:', error);
      setVerificationState('error');
      
      // Better error messages based on World documentation
      if (error?.message?.includes('action')) {
        setErrorMessage(`Action "${process.env.NEXT_PUBLIC_WLD_ACTION}" not found. Check Developer Portal.`);
      } else if (error?.message?.includes('signal')) {
        setErrorMessage('Invalid signal. Please contact support.');
      } else if (error?.message?.includes('MiniKit')) {
        setErrorMessage('Please open this app in World App to continue.');
      } else {
        setErrorMessage(`Verification failed: ${error?.message || 'Unknown error'}`);
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
                Verifying Your Identity
              </h3>
              <p className="text-gray-700 text-lg">
                Please complete the verification in World App
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
                Verification Successful!
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
                Verification Failed
              </h3>
              <p className="text-gray-700 text-lg mb-6">
                {errorMessage || 'Unable to verify your World ID'}
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
                Verify Your Identity
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Use World ID to verify you're a real human and protect our community
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <h4 className="font-semibold text-black text-lg">Why World ID?</h4>
                <ul className="space-y-2 text-left text-gray-700">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Proof of personhood - one account per human</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Privacy-preserving verification</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>No personal data stored</span>
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
                  <span>Verify with World ID</span>
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
