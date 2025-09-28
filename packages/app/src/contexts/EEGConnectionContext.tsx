'use client'

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'

// EEG Connection Types
interface EegBoothData {
  booth_id: string
  relayer_url: string
}

interface EegConnectionState {
  isConnected: boolean
  boothData: EegBoothData | null
  websocket: WebSocket | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  lastActivity: Date | null
  error: string | null
}

interface EegConnectionContextType {
  // Connection state
  connection: EegConnectionState
  
  // Connection management
  connectToBooth: (boothData: EegBoothData, walletAddress?: string) => Promise<boolean>
  disconnectFromBooth: () => void
  sendMessage: (message: any) => boolean
  
  // Event handlers
  onMessage: (handler: (data: any) => void) => void
  onDisconnect: (handler: () => void) => void
  onError: (handler: (error: string) => void) => void
}

const EegConnectionContext = createContext<EegConnectionContextType | null>(null)

export function EegConnectionProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<EegConnectionState>({
    isConnected: false,
    boothData: null,
    websocket: null,
    connectionStatus: 'disconnected',
    lastActivity: null,
    error: null
  })

  const websocketRef = useRef<WebSocket | null>(null)
  const messageHandlersRef = useRef<Set<(data: any) => void>>(new Set())
  const disconnectHandlersRef = useRef<Set<() => void>>(new Set())
  const errorHandlersRef = useRef<Set<(error: string) => void>>(new Set())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Connect to EEG booth
  const connectToBooth = useCallback(async (boothData: EegBoothData, walletAddress?: string): Promise<boolean> => {
    console.log('🔌 Connecting to EEG booth:', boothData, 'with wallet:', walletAddress)
    
    // Close existing connection
    if (websocketRef.current) {
      websocketRef.current.close()
    }

    setConnection(prev => ({
      ...prev,
      connectionStatus: 'connecting',
      boothData,
      error: null
    }))

    try {
      const ws = new WebSocket(boothData.relayer_url)
      websocketRef.current = ws

      return new Promise((resolve, reject) => {
        const connectTimeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000) // 10 second timeout

        ws.onopen = () => {
          clearTimeout(connectTimeout)
          console.log('✅ Connected to EEG booth WebSocket')
          
          setConnection(prev => ({
            ...prev,
            isConnected: true,
            websocket: ws,
            connectionStatus: 'connected',
            lastActivity: new Date(),
            error: null
          }))

          // Send initial connection message with wallet address
          const connectMessage = {
            type: 'booth_connect',
            booth_id: boothData.booth_id,
            wallet_address: walletAddress, // Include wallet address from MiniKit
            timestamp: Date.now()
          }
          
          ws.send(JSON.stringify(connectMessage))
          resolve(true)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📥 EEG message received:', data)
            
            setConnection(prev => ({
              ...prev,
              lastActivity: new Date()
            }))

            // Notify all message handlers
            messageHandlersRef.current.forEach(handler => {
              try {
                handler(data)
              } catch (error) {
                console.error('Error in message handler:', error)
              }
            })
          } catch (parseError) {
            console.error('Error parsing EEG message:', parseError)
          }
        }

        ws.onerror = (error) => {
          clearTimeout(connectTimeout)
          console.error('❌ EEG WebSocket error:', error)
          
          const errorMsg = 'Failed to connect to EEG device'
          setConnection(prev => ({
            ...prev,
            connectionStatus: 'error',
            error: errorMsg,
            isConnected: false
          }))

          // Notify error handlers
          errorHandlersRef.current.forEach(handler => {
            try {
              handler(errorMsg)
            } catch (handlerError) {
              console.error('Error in error handler:', handlerError)
            }
          })

          reject(new Error(errorMsg))
        }

        ws.onclose = (event) => {
          console.log('🔌 EEG WebSocket disconnected:', event.code, event.reason)
          
          setConnection(prev => ({
            ...prev,
            isConnected: false,
            websocket: null,
            connectionStatus: 'disconnected'
          }))

          // Notify disconnect handlers
          disconnectHandlersRef.current.forEach(handler => {
            try {
              handler()
            } catch (handlerError) {
              console.error('Error in disconnect handler:', handlerError)
            }
          })

          // Auto-reconnect if it wasn't intentional
          if (event.code !== 1000 && event.code !== 1001) {
            console.log('🔄 Attempting to reconnect...')
            reconnectTimeoutRef.current = setTimeout(() => {
              connectToBooth(boothData)
            }, 3000)
          }
        }
      })
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
      setConnection(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: 'Failed to connect to EEG device',
        isConnected: false
      }))
      return false
    }
  }, [])

  // Disconnect from booth
  const disconnectFromBooth = useCallback(() => {
    console.log('🔌 Disconnecting from EEG booth')
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (websocketRef.current) {
      websocketRef.current.close(1000, 'User disconnected')
      websocketRef.current = null
    }

    setConnection(prev => ({
      ...prev,
      isConnected: false,
      websocket: null,
      connectionStatus: 'disconnected',
      boothData: null,
      error: null
    }))
  }, [])

  // Send message to booth
  const sendMessage = useCallback((message: any): boolean => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ Cannot send message: WebSocket not connected')
      return false
    }

    try {
      websocketRef.current.send(JSON.stringify(message))
      console.log('📤 Message sent to EEG booth:', message)
      return true
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      return false
    }
  }, [])

  // Event handler registration
  const onMessage = useCallback((handler: (data: any) => void) => {
    messageHandlersRef.current.add(handler)
    return () => messageHandlersRef.current.delete(handler)
  }, [])

  const onDisconnect = useCallback((handler: () => void) => {
    disconnectHandlersRef.current.add(handler)
    return () => disconnectHandlersRef.current.delete(handler)
  }, [])

  const onError = useCallback((handler: (error: string) => void) => {
    errorHandlersRef.current.add(handler)
    return () => errorHandlersRef.current.delete(handler)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromBooth()
    }
  }, [disconnectFromBooth])

  const contextValue: EegConnectionContextType = {
    connection,
    connectToBooth,
    disconnectFromBooth,
    sendMessage,
    onMessage,
    onDisconnect,
    onError
  }

  return (
    <EegConnectionContext.Provider value={contextValue}>
      {children}
    </EegConnectionContext.Provider>
  )
}

// Hook for using the EEG connection context
export function useEegConnection() {
  const context = useContext(EegConnectionContext)
  if (!context) {
    throw new Error('useEegConnection must be used within an EegConnectionProvider')
  }
  return context
}

// Hook specifically for EEG connection status
export function useEegConnectionStatus() {
  const { connection } = useEegConnection()
  return {
    isConnected: connection.isConnected,
    status: connection.connectionStatus,
    boothData: connection.boothData,
    error: connection.error,
    lastActivity: connection.lastActivity
  }
}
