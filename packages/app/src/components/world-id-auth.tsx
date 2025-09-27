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
    const handleVerifyResponse = (response: MiniAppVerifyActionPayload) => {
      console.log('Verification response:', response);
      
      if (response.status === 'success') {
        setVerificationState('success');
        onSuccess({
          worldId: response.verification_level,
          nullifierHash: response.nullifier_hash,
          merkleRoot: response.merkle_root,
          proof: response.proof,
          verification_level: response.verification_level,
        });
      } else {
        setVerificationState('error');
        setErrorMessage(response.error_code || 'Verification failed');
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

      // Check if MiniKit is available only when trying to verify
      if (!MiniKit.isInstalled()) {
        setVerificationState('error');
        setErrorMessage('Please open this app in World App to verify your identity.');
        return;
      }

      // Use MiniKit.commands.verify with proper error handling
      const result = MiniKit.commands.verify({
        action: process.env.NEXT_PUBLIC_WLD_ACTION || 'login',
        signal: 'mofo-verification',
        verification_level: 'device',
      } as any);
      
      console.log('Verification initiated:', result);
      
      // The response will be handled by the event listener
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationState('error');
      
      // Better error messages based on World documentation
      if (error?.message?.includes('action')) {
        setErrorMessage('Action not configured. Please check Developer Portal.');
      } else if (error?.message?.includes('signal')) {
        setErrorMessage('Invalid signal. Please contact support.');
      } else if (error?.message?.includes('MiniKit')) {
        setErrorMessage('Please open this app in World App to continue.');
      } else {
        setErrorMessage('Verification failed. Please try again.');
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
