'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Globe, CheckCircle, Loader2, User, Heart, Zap } from 'lucide-react';

interface AgentDashboardProps {
  user: any;
  onAgentReady: (agentData: any) => void;
  isLoading: boolean;
}

type DeploymentState = 'creating' | 'assigning-ens' | 'training' | 'ready';

export function AgentDashboard({ user, onAgentReady, isLoading }: AgentDashboardProps) {
  const [deploymentState, setDeploymentState] = useState<DeploymentState>('creating');
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [agentData, setAgentData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    simulateAgentDeployment();
  }, []);

  const simulateAgentDeployment = () => {
    const steps = [
      { state: 'creating', name: 'Creating AI agent architecture', duration: 3000 },
      { state: 'assigning-ens', name: 'Assigning ENS domain', duration: 2000 },
      { state: 'training', name: 'Training on your neural patterns', duration: 4000 },
      { state: 'ready', name: 'Agent ready for deployment', duration: 1000 },
    ];

    let currentStepIndex = 0;
    let progress = 0;
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    const updateProgress = () => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setDeploymentState(step.state as DeploymentState);
        setCurrentStep(step.name);
        
        const stepProgress = (progress / totalDuration) * 100;
        setDeploymentProgress(stepProgress);

        progress += 100;
        
        if (progress >= step.duration) {
          currentStepIndex++;
          progress = 0;
        }

        if (currentStepIndex < steps.length) {
          setTimeout(updateProgress, 100);
        } else {
          // Create mock agent data
          const mockAgentData = {
            id: `agent_${Date.now()}`,
            name: `${user?.worldId || 'User'}.agent.eth`,
            ensName: `${user?.worldId || 'user'}.agent.eth`,
            personality: {
              traits: ['charming', 'witty', 'empathetic', 'adventurous'],
              communicationStyle: 'warm and engaging',
              interests: ['technology', 'travel', 'art', 'music'],
            },
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.worldId || 'default'}`,
            status: 'active',
            deployedAt: new Date().toISOString(),
          };
          
          setAgentData(mockAgentData);
          
          setTimeout(() => {
            onAgentReady(mockAgentData);
          }, 2000);
        }
      }
    };

    updateProgress();
  };

  const renderContent = () => {
    switch (deploymentState) {
      case 'creating':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Bot className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Creating Your AI Agent
              </h3>
              <p className="text-gray-300 mb-4">
                {currentStep}
              </p>
              
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(deploymentProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${deploymentProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'assigning-ens':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Globe className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Assigning ENS Domain
              </h3>
              <p className="text-gray-300 mb-4">
                {currentStep}
              </p>
              
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-2">Your agent's domain:</div>
                <div className="text-lg font-mono text-blue-400">
                  {user?.worldId || 'user'}.agent.eth
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'training':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-white animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Training Your Agent
              </h3>
              <p className="text-gray-300 mb-4">
                {currentStep}
              </p>
              
              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <div className="text-sm text-gray-300">Training on:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>• Neural patterns</div>
                  <div>• Personality traits</div>
                  <div>• Communication style</div>
                  <div>• Dating preferences</div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'ready':
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
                Agent Successfully Deployed!
              </h3>
              <p className="text-gray-300 mb-6">
                Your AI dating agent is ready to find your perfect match
              </p>
              
              {agentData && (
                <div className="bg-white/10 rounded-lg p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-white">{agentData.name}</h4>
                      <p className="text-sm text-gray-300">{agentData.ensName}</p>
                    </div>
                  </div>
                  
                  <div className="text-left space-y-2">
                    <div>
                      <span className="text-sm text-gray-300">Personality Traits:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {agentData.personality.traits.map((trait: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-300">Communication Style:</span>
                      <p className="text-sm text-white mt-1">{agentData.personality.communicationStyle}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center space-x-2 text-green-300">
                <Heart className="w-4 h-4" />
                <span className="text-sm">Starting to search for matches...</span>
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

