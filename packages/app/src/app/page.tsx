'use client';

import { useState, useEffect } from 'react';
import { MiniKit, ResponseEvent, MiniAppVerifyActionPayload } from '@worldcoin/minikit-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, ChevronRight } from 'lucide-react';
import { WorldIDAuth } from '@/components/world-id-auth';
// Removed complex components for simplified World App

type AppState = 
  | 'welcome'
  | 'auth'
  | 'success';

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      console.warn('MiniKit is not installed - app running in browser mode');
      return;
    }

    console.log('MiniKit detected - World App integration active');
    
    // Subscribe to MiniKit events
    MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, handleVerifyResponse);

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppVerifyAction);
    };
  }, []);

  const handleVerifyResponse = (response: MiniAppVerifyActionPayload) => {
    if (response.status === 'success') {
      console.log('World ID verification successful:', response);
      setUser(response);
      setAppState('success');
    } else {
      console.error('World ID verification failed:', response);
    }
  };

  const handleStateTransition = (newState: AppState) => {
    setIsLoading(true);
    setTimeout(() => {
      setAppState(newState);
      setIsLoading(false);
    }, 1000);
  };

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return (
          <WelcomeScreen 
            onStart={() => setAppState('auth')} 
            isLoading={isLoading}
          />
        );
      
      case 'auth':
        return (
          <WorldIDAuth 
            onSuccess={(userData) => {
              setUser(userData);
              handleStateTransition('success');
            }}
            isLoading={isLoading}
          />
        );
      
      case 'success':
        return (
          <SuccessScreen 
            user={user}
            onRestart={() => setAppState('welcome')}
          />
        );
      
      default:
        return <WelcomeScreen onStart={() => setAppState('auth')} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={appState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SuccessScreen({ user, onRestart }: { user: any; onRestart: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-sm mx-auto w-full px-6 py-12 flex flex-col justify-between">
        
        {/* Top spacing */}
        <div className="flex-1"></div>
        
        {/* Main content */}
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-black">
              Welcome! 🎉
            </h1>
            <p className="text-lg text-gray-700">
              You've successfully verified with World ID!
            </p>
          </motion.div>

          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-xl p-6 space-y-4"
            >
              <h3 className="text-xl font-semibold text-black">Verification Details</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Level:</span>
                  <span className="text-black font-medium">{user.verification_level || 'orb'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">✅ Verified Human</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <p className="text-center text-gray-700">
            🚀 Ready to start your AI-powered dating journey!
          </p>
          
          <button
            onClick={onRestart}
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 text-lg"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart, isLoading }: { onStart: () => void; isLoading: boolean }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* iPhone-style container */}
      <div className="flex-1 max-w-sm mx-auto w-full px-6 py-12 flex flex-col justify-between">
        
        {/* Top spacing */}
        <div className="flex-1"></div>
        
        {/* Main content */}
        <div className="space-y-8">
          {/* App title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-black mb-4">
              Mofo
            </h1>
            
            <div className="space-y-3 text-gray-700 text-lg">
              <p>AI-powered dating with personality matching</p>
            </div>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4 text-left"
          >
            <div className="flex items-center space-x-3 text-gray-800">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-lg">World ID verified profiles</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-800">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-lg">EEG-based personality matching</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-800">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-lg">AI agents handle the conversation</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-4"
        >
          {/* CTA Button */}
          <button
            onClick={onStart}
            disabled={isLoading}
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Continue with World ID</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Legal text */}
          <p className="text-center text-sm text-gray-500 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="underline">Terms</span> and{' '}
            <span className="underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
