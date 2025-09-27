'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Heart, X, Info, MapPin, Briefcase } from 'lucide-react'
import { AuthState, User } from '@/types'
import { MiniKit } from '@worldcoin/minikit-js'

interface SwipeScreenProps {
  authState: AuthState
}

// Mock users data - in a real app this would come from an API
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    age: 28,
    bio: 'AI researcher by day, photographer by night. Looking for someone who appreciates both logic and art.',
    images: ['https://avatar.vercel.sh/sarah?text=SC'],
    isVerified: true,
    interests: ['Photography', 'AI', 'Hiking', 'Coffee'],
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    age: 32,
    bio: 'Full-stack developer who loves building things that matter. Crypto enthusiast and rock climber.',
    images: ['https://avatar.vercel.sh/marcus?text=MR'],
    isVerified: true,
    interests: ['Coding', 'Crypto', 'Rock Climbing', 'Travel'],
    location: 'Austin, TX'
  },
  {
    id: '3',
    name: 'Luna Park',
    age: 26,
    bio: 'UX designer with a passion for creating beautiful, accessible experiences. Dog mom to two golden retrievers.',
    images: ['https://avatar.vercel.sh/luna?text=LP'],
    isVerified: false,
    interests: ['Design', 'Dogs', 'Yoga', 'Sustainability'],
    location: 'Seattle, WA'
  },
]

export function SwipeScreen({ authState }: SwipeScreenProps) {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const controls = useAnimation()

  const currentUser = users[currentIndex]

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (isAnimating || !currentUser) return

    setIsAnimating(true)

    // Send haptic feedback
    if (MiniKit.isInstalled()) {
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'impact',
        style: direction === 'right' ? 'medium' : 'light',
      })
    }

    // Animate the swipe
    await controls.start({
      x: direction === 'right' ? 300 : -300,
      rotate: direction === 'right' ? 30 : -30,
      opacity: 0,
      transition: { duration: 0.3 }
    })

    // Update state
    setCurrentIndex(prev => prev + 1)
    
    // Reset animation state
    controls.set({ x: 0, rotate: 0, opacity: 1 })
    setIsAnimating(false)

    // In a real app, you'd send the swipe action to your backend
    console.log(`${direction === 'right' ? 'Liked' : 'Passed'} user:`, currentUser.name)

    // Check for match (simulated)
    if (direction === 'right' && Math.random() > 0.5) {
      // Send notification about match
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'success',
        })
      }
      
      // In a real app, you might show a match popup here
      console.log('It\'s a match!')
    }
  }, [currentUser, isAnimating, controls])

  const handlePanEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const velocity = Math.abs(info.velocity.x)

    if (Math.abs(info.offset.x) > threshold || velocity > 500) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      handleSwipe(direction)
    } else {
      // Snap back to center
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      })
    }
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-600">No more profiles</h2>
          <p className="text-gray-500">Check back later for new matches!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      {/* Card Stack */}
      <div className="flex-1 relative">
        {/* Current Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onPanEnd={handlePanEnd}
          animate={controls}
          whileDrag={{
            scale: 1.05,
          }}
          className="absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ zIndex: 2 }}
        >
          {/* Profile Image */}
          <div className="h-2/3 relative">
            <img
              src={currentUser.images[0]}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
            
            {/* Verification Badge */}
            {currentUser.isVerified && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <span>✓</span>
                <span>Verified</span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Basic Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <span className="text-xl opacity-90">{currentUser.age}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm opacity-90">
                <MapPin className="w-4 h-4" />
                <span>{currentUser.location}</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="h-1/3 p-4 space-y-3">
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentUser.bio}
            </p>
            
            {/* Interests */}
            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Next Card (Preview) */}
        {users[currentIndex + 1] && (
          <div 
            className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden"
            style={{ zIndex: 1, transform: 'scale(0.95) translateY(10px)' }}
          >
            <img
              src={users[currentIndex + 1].images[0]}
              alt={users[currentIndex + 1].name}
              className="w-full h-2/3 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{users[currentIndex + 1].name}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-6 py-4">
        <motion.button
          onClick={() => handleSwipe('left')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isAnimating}
          className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <X className="w-6 h-6 text-gray-600" />
        </motion.button>

        <motion.button
          onClick={() => {/* Handle info/details */}}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-200"
        >
          <Info className="w-5 h-5 text-blue-600" />
        </motion.button>

        <motion.button
          onClick={() => handleSwipe('right')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isAnimating}
          className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
        >
          <Heart className="w-6 h-6 text-white fill-current" />
        </motion.button>
      </div>
    </div>
  )
}
