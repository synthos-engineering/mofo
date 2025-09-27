'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Activity, CheckCircle, Loader2, Users } from 'lucide-react';

interface BrainWaveSessionProps {
  user: any;
  onSessionComplete: (brainData: any) => void;
  isLoading: boolean;
}

type SessionState = 'preparing' | 'recording' | 'processing' | 'complete';

export function BrainWaveSession({ user, onSessionComplete, isLoading }: BrainWaveSessionProps) {
  const [sessionState, setSessionState] = useState<SessionState>('preparing');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [brainwaveData, setBrainwaveData] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState('');

  useEffect(() => {
    // Simulate the brain wave recording session
    if (sessionState === 'recording') {
      simulateRecordingSession();
    } else if (sessionState === 'processing') {
      simulateProcessing();
    }
  }, [sessionState]);

  const simulateRecordingSession = () => {
    const phases = [
      { name: 'Calibration', duration: 3000 },
      { name: 'Emotional Response', duration: 5000 },
      { name: 'Cognitive Patterns', duration: 4000 },
      { name: 'Personality Traits', duration: 4000 },
      { name: 'Social Preferences', duration: 4000 },
    ];

    let currentPhaseIndex = 0;
    let progress = 0;
    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);

    const updateProgress = () => {
      if (currentPhaseIndex < phases.length) {
        const phase = phases[currentPhaseIndex];
        setCurrentPhase(phase.name);
        
        const phaseProgress = (progress / totalDuration) * 100;
        setSessionProgress(phaseProgress);

        progress += 100;
        
        if (progress >= phase.duration) {
          currentPhaseIndex++;
          progress = 0;
        }

        if (currentPhaseIndex < phases.length) {
          setTimeout(updateProgress, 100);
        } else {
          setSessionState('processing');
        }
      }
    };

    updateProgress();
  };

  const simulateProcessing = () => {
    let progress = 0;
    setCurrentPhase('Analyzing neural patterns...');
    
    const updateProgress = () => {
      progress += 2;
      setSessionProgress(progress);
      
      if (progress < 100) {
        setTimeout(updateProgress, 100);
      } else {
        const mockBrainData = {
          personalityVector: [0.7, 0.3, 0.8, 0.5, 0.6],
          emotionalProfile: {
            openness: 0.75,
            extraversion: 0.6,
            agreeableness: 0.8,
            conscientiousness: 0.7,
            neuroticism: 0.3,
          },
          cognitivePatterns: {
            processing_speed: 0.8,
            working_memory: 0.7,
            attention_span: 0.6,
          },
          socialPreferences: {
            communication_style: 'expressive',
            interaction_preference: 'balanced',
            conflict_resolution: 'collaborative',
          },
          timestamp: new Date().toISOString(),
        };
        
        setBrainwaveData(mockBrainData);
        setSessionState('complete');
        
        setTimeout(() => {
          onSessionComplete(mockBrainData);
        }, 2000);
      }
    };

    updateProgress();
  };

  const startSession = () => {
    setSessionState('recording');
    setSessionProgress(0);
  };

  const renderContent = () => {
    switch (sessionState) {
      case 'preparing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Brain Wave Analysis
              </h2>
              <p className="text-gray-300 mb-6">
                We'll analyze your unique neural patterns to create your AI agent
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-white">What we'll measure:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>Emotional patterns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Cognitive style</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>Personality traits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span>Social preferences</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-left">
                    <p className="text-blue-300 font-medium mb-1">Privacy Protected</p>
                    <p className="text-gray-300">Your brain data is processed locally and never stored permanently.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={startSession}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Start Brain Scan</span>
                </>
              )}
            </button>
          </motion.div>
        );

      case 'recording':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse-glow">
              <Activity className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Recording Brain Waves
              </h3>
              <p className="text-gray-300 mb-4">
                Phase: {currentPhase}
              </p>
              
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(sessionProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="brain-wave h-2 rounded-full"
                    style={{ width: `${sessionProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <p>Stay relaxed and keep your eyes open</p>
              <p>The EEG headset is measuring your neural activity</p>
            </div>
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Processing Neural Data
              </h3>
              <p className="text-gray-300 mb-4">
                {currentPhase}
              </p>
              
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Analysis Progress</span>
                  <span>{Math.round(sessionProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${sessionProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Brain Analysis Complete!
              </h3>
              <p className="text-gray-300 mb-6">
                Your neural patterns have been captured and processed
              </p>
              
              {brainwaveData && (
                <div className="bg-white/10 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-white">Your Neural Profile:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-left">
                      <span className="text-gray-300">Openness:</span>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-400 h-1 rounded-full"
                          style={{ width: `${brainwaveData.emotionalProfile.openness * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-300">Extraversion:</span>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div
                          className="bg-green-400 h-1 rounded-full"
                          style={{ width: `${brainwaveData.emotionalProfile.extraversion * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-300">Agreeableness:</span>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div
                          className="bg-purple-400 h-1 rounded-full"
                          style={{ width: `${brainwaveData.emotionalProfile.agreeableness * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-300">Conscientiousness:</span>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div
                          className="bg-yellow-400 h-1 rounded-full"
                          style={{ width: `${brainwaveData.emotionalProfile.conscientiousness * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center space-x-2 text-green-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Creating your AI agent...</span>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
}

