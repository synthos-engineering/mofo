'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Heart,
  MapPin,
  Calendar,
  Briefcase,
  Camera,
  Edit3,
  LogOut
} from 'lucide-react'
import { AuthState } from '@/types'
import { MiniKit } from '@worldcoin/minikit-js'

interface ProfileScreenProps {
  authState: AuthState
}

// Mock user profile data
const mockProfile = {
  name: 'Alex Thompson',
  age: 30,
  bio: 'AI enthusiast, world traveler, and coffee connoisseur. Looking for genuine connections and meaningful conversations.',
  location: 'San Francisco, CA',
  profession: 'Senior AI Engineer at TechCorp',
  images: [
    'https://avatar.vercel.sh/alex?text=AT&size=400',
    'https://avatar.vercel.sh/alex2?text=A2&size=400',
  ],
  interests: ['AI & Tech', 'Travel', 'Coffee', 'Photography', 'Hiking', 'Reading'],
  stats: {
    likes: 127,
    matches: 23,
    conversations: 15,
  },
  settings: {
    notifications: true,
    showAge: true,
    showLocation: true,
    discoverable: true,
  }
}

export function ProfileScreen({ authState }: ProfileScreenProps) {
  const [profile, setProfile] = useState(mockProfile)
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile')

  const handleLogout = async () => {
    // Send haptic feedback
    if (MiniKit.isInstalled()) {
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'impact',
        style: 'medium',
      })
    }

    // In a real app, you would handle logout logic here
    console.log('Logging out...')
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl overflow-hidden">
          <img
            src={profile.images[0]}
            alt={profile.name}
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}, {profile.age}</h1>
              <div className="flex items-center mt-1 text-sm opacity-90">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </div>
            </div>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Likes', value: profile.stats.likes, icon: Heart },
          { label: 'Matches', value: profile.stats.matches, icon: User },
          { label: 'Chats', value: profile.stats.conversations, icon: Bell },
        ].map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
          >
            <Icon className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Bio */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <User className="w-4 h-4 mr-2 text-primary-500" />
          About Me
        </h3>
        <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-primary-500" />
          Details
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Profession</span>
            <span className="font-medium text-gray-800">{profile.profession}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium text-gray-800">January 2024</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Verification</span>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-600">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Heart className="w-4 h-4 mr-2 text-primary-500" />
          Interests
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.interests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Camera className="w-4 h-4 mr-2 text-primary-500" />
          Photos
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {profile.images.map((image, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`Profile ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50">
            <div className="text-center">
              <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-gray-500">Add Photo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Account Settings</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-gray-700">World ID Verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-sm font-medium">Verified</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-gray-700">Wallet Address</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {authState.walletAddress?.slice(0, 6)}...{authState.walletAddress?.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Privacy & Discovery</h3>
        </div>
        <div className="p-4 space-y-4">
          {[
            { key: 'notifications', label: 'Push Notifications', icon: Bell },
            { key: 'showAge', label: 'Show My Age', icon: Calendar },
            { key: 'showLocation', label: 'Show My Location', icon: MapPin },
            { key: 'discoverable', label: 'Make Me Discoverable', icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-gray-700">{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.settings[key as keyof typeof profile.settings]}
                  onChange={(e) => {
                    setProfile(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        [key]: e.target.checked
                      }
                    }))
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left flex items-center justify-between hover:bg-gray-50">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-gray-600 mr-3" />
            <span className="text-gray-700">Advanced Settings</span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-red-50 hover:bg-red-100 rounded-xl p-4 border border-red-200 text-left flex items-center text-red-600"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-6">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'profile' | 'settings')}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' ? renderProfileTab() : renderSettingsTab()}
        </motion.div>
      </div>
    </div>
  )
}
