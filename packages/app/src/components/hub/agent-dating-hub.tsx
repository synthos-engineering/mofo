'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, ChevronLeft, DollarSign, Heart, MessageCircle, Calendar, Users, Settings as SettingsIcon } from 'lucide-react'
import { AuthState } from '@/types'
import { AgentDateSummary } from './agent-date-summary'
import { DateProposal } from './date-proposal'
import { AgentCoordination } from './agent-coordination'
// import { DateAgreed } from './date-agreed'

interface AgentDatingHubProps {
  authState: AuthState
}

type HubScreen = 'main' | 'date-summary' | 'propose-date' | 'coordination' | 'agreed' | 'stake' | 'review'

export function AgentDatingHub({ authState }: AgentDatingHubProps) {
  // ============================================================
  // 🔥 ENHANCED FOR ASI BACKEND: Real agent state management
  // ============================================================
  const [agentStatus, setAgentStatus] = useState<'offline' | 'dating'>('dating')
  const [currentScreen, setCurrentScreen] = useState<HubScreen>('main')
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  // TODO: INTEGRATION TEAM - Add real backend data loading
  // useEffect(() => {
  //   const loadAgentData = async () => {
  //     const agentProfile = await asiBackend.getAgentProfile(authState.user?.id)
  //     setAgentStatus(agentProfile.agent.isActive ? 'dating' : 'offline')
  //   }
  //   loadAgentData()
  // }, [authState.user?.id])

  // Render different screens based on currentScreen
  if (currentScreen === 'date-summary') {
    return (
      <AgentDateSummary
        onBack={() => setCurrentScreen('main')}
        onPlanDate={() => setCurrentScreen('propose-date')}
        onPass={() => setCurrentScreen('main')}
      />
    )
  }

  if (currentScreen === 'propose-date') {
    return (
      <DateProposal
        onBack={() => setCurrentScreen('date-summary')}
        onSendProposal={() => setCurrentScreen('coordination')}
      />
    )
  }

  if (currentScreen === 'coordination') {
    return (
      <AgentCoordination
        onComplete={() => setCurrentScreen('agreed')}
      />
    )
  }

  if (currentScreen === 'agreed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Date Agreed!</h1>
          <p className="text-gray-600">Placeholder for date agreed screen</p>
          <button 
            onClick={() => setCurrentScreen('main')}
            className="mt-4 bg-black text-white px-6 py-2 rounded-lg"
          >
            Back to Hub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Agent Dating Hub</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 pb-6 space-y-6">
        {/* Your Agent Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Your Agent</div>
                {/* TODO: INTEGRATION TEAM - Replace with real agent ENS name */}
                <div className="text-sm text-gray-500">{authState.user?.ensName || 'viman.mofo.eth'}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {agentStatus === 'dating' ? 'Dating' : 'Offline'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agentStatus === 'dating'}
                  onChange={(e) => setAgentStatus(e.target.checked ? 'dating' : 'offline')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Spending Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Spending Overview</span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Spent this month</span>
              <span className="font-semibold">$12.50 / $50.00</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-black h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div>• Auto-swipe operations: $8.50</div>
            <div>• Agent interactions: $4.00</div>
            <div>• Next billing: 27/10/2025</div>
          </div>
        </motion.div>

        {/* Agent Dating Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Agent Dating Activity</h3>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              {/* TODO: INTEGRATION TEAM - Replace with real data from asiBackend.getAgentStats() */}
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Agent Dates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>Compatible</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>Pending Review</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-600">Scheduled Dates</div>
            </div>
          </div>
        </motion.div>

        {/* Agent Preferences */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Agent Preferences</h3>
            <button className="p-2">
              <SettingsIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600">Age range, distance, compatibility threshold</p>
        </motion.div>

        {/* Safety & Consent */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <h3 className="font-semibold text-blue-800 mb-3">Safety & Consent</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Spending Cap</span>
              <span className="text-green-600 font-medium">✓ Protected</span>
            </div>
            <div className="text-xs text-blue-600">$50/month limit active</div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-blue-700">Privacy Mode</span>
              <span className="text-green-600 font-medium">✓ Private</span>
            </div>
            <div className="text-xs text-blue-600">All chats summarized only</div>
          </div>
        </motion.div>

        {/* Agent-to-Agent Dating Section */}
        {agentStatus === 'dating' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-green-50 border border-green-100 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Your Agent</span>
              <div className="flex items-center space-x-1 ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Dating</span>
              </div>
            </div>
            <div className="text-sm text-green-700 mb-4">viman.mofo.eth</div>
            
            <div className="bg-gray-600 rounded-lg h-2 mb-2">
              <div className="bg-green-500 h-2 rounded-lg" style={{ width: '60%' }}></div>
            </div>
            <div className="text-xs text-green-600">⚡ Agents are having their virtual date...</div>
          </motion.div>
        )}

        {/* Agent-to-Agent Dating */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-purple-50 border border-purple-100 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Agent-to-Agent Dating</span>
          </div>

          <div className="flex items-center justify-center space-x-8 mb-4">
            {/* Your Agent */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium">Your Agent</div>
              <div className="text-xs text-gray-600">viman.mofo.eth</div>
            </div>

            {/* Connection Animation */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* Elena's Agent */}
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mb-2">
                <Bot className="w-6 h-6 text-white" />
              </div>
              {/* TODO: INTEGRATION TEAM - Replace with real matched agent from asiBackend */}
              <div className="text-sm font-medium">Elena's Agent</div>
              <div className="text-xs text-gray-600">elena.mofo.eth</div>
            </div>
          </div>

          <div className="text-xs text-purple-700 text-center mb-4">
            Your agents are having a virtual coffee date to assess compatibility before introducing you two.
          </div>

          <button
            onClick={() => setCurrentScreen('date-summary')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            View Date Results
          </button>
        </motion.div>

        {/* Start Agent Dating Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => {
            // TODO: INTEGRATION TEAM - Replace with real ASI backend matching
            // Call: asiBackend.requestNewMatches(authState.user?.id)
            // Expected: Navigate to agent-chat page with new match
            // BACKEND: system_agent.py findCompatibleAgents()
            console.log('Starting agent dating with real ASI backend...')
            console.log('User agent data:', authState.user?.agentId, authState.user?.personalityTraits)
          }}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2"
        >
          <Users className="w-5 h-5" />
          <span>Start Agent Dating</span>
        </motion.button>
      </div>
    </div>
  )
}
