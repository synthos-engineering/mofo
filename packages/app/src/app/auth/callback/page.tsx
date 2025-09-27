'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing sign-in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authentication parameters');
          return;
        }

        // Exchange code for tokens
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store tokens securely (you might want to use httpOnly cookies)
          localStorage.setItem('world_access_token', data.access_token);
          localStorage.setItem('world_user', JSON.stringify(data.user));
          
          setStatus('success');
          setMessage('Successfully signed in with World ID!');
          
          // Redirect to main app after 2 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Authentication failed');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Failed to process authentication');
      }
    };

    handleCallback();
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'processing':
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
              <h3 className="text-2xl font-semibold text-black">Processing Sign-in</h3>
              <p className="text-gray-700">{message}</p>
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
              <h3 className="text-2xl font-semibold text-black">Welcome!</h3>
              <p className="text-gray-700">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to app...</p>
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
              <h3 className="text-2xl font-semibold text-black">Sign-in Failed</h3>
              <p className="text-gray-700">{message}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95"
              >
                Return to App
              </button>
            </div>
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
