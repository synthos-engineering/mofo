'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { AuthScreen } from '@/components/auth/auth-screen'
import { MainApp } from '@/components/main-app'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { AuthState } from '@/types'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    walletAddress: null,
    user: null
  })

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if running in World App
        if (MiniKit.isInstalled()) {
          console.log('Running in World App')
          
          // Check if user is already authenticated
          const walletAddress = (MiniKit as any).walletAddress
          if (walletAddress) {
            setAuthState({
              isAuthenticated: true,
              walletAddress,
              user: null // Will be loaded later
            })
          }
        } else {
          console.log('Running in browser - simulating World App environment')
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!authState.isAuthenticated) {
    return <AuthScreen onAuthSuccess={(authData) => setAuthState(authData)} />
  }

  return <MainApp authState={authState} />
}
