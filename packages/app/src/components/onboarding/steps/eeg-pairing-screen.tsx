'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Camera, Shield, CheckCircle, AlertTriangle, ExternalLink, Type, Wifi, WifiOff } from 'lucide-react'
import { MiniKit } from '@worldcoin/minikit-js'
import { Html5Qrcode } from 'html5-qrcode'

interface EegPairingScreenProps {
  onComplete: () => void
}

interface EegBoothData {
  booth_id: string
  relayer_url: string
}

export function EegPairingScreen({ onComplete }: EegPairingScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null)
  const [boothData, setBoothData] = useState<EegBoothData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const websocketRef = useRef<WebSocket | null>(null)

  // WebSocket connection to EEG booth (based on mock-scanner-frontend)
  const connectToBoothRelay = useCallback(async (data: EegBoothData) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.close()
    }

    setConnectionStatus('connecting')
    setError(null)

    try {
      console.log('🔌 Connecting to EEG booth:', data.booth_id, 'at', data.relayer_url)
      
      const ws = new WebSocket(data.relayer_url)
      websocketRef.current = ws

      ws.onopen = () => {
        console.log('✅ Connected to EEG booth relayer')
        
        // Send scanner connection request
        const connectMessage = {
          type: 'connect_scanner',
          booth_id: data.booth_id
        }
        
        ws.send(JSON.stringify(connectMessage))
        console.log('📤 Sent connection request to booth:', data.booth_id)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📥 Received from booth relayer:', message)
          
          if (message.type === 'connection_success') {
            setConnectionStatus('connected')
            console.log('🎉 Successfully connected to EEG booth!')
            
            // Send haptic feedback for success
            if (MiniKit.isInstalled()) {
              MiniKit.commands.sendHapticFeedback({
                hapticsType: 'notification',
                style: 'success',
              })
            }

            // Auto-proceed to EEG capture after successful connection
            setTimeout(() => {
              onComplete()
            }, 2000)
            
          } else if (message.type === 'error') {
            setConnectionStatus('error')
            setError(`Booth connection failed: ${message.message}`)
            
          } else if (message.type === 'booth_disconnected') {
            setConnectionStatus('disconnected')
            setError('EEG booth disconnected unexpectedly')
          }
        } catch (parseError) {
          console.error('Error parsing booth message:', parseError)
        }
      }

      ws.onclose = () => {
        console.log('🔌 Disconnected from booth relayer')
        if (connectionStatus === 'connecting' || connectionStatus === 'connected') {
          setConnectionStatus('disconnected')
        }
      }

      ws.onerror = (wsError) => {
        console.error('❌ WebSocket connection error:', wsError)
        setConnectionStatus('error')
        setError('Failed to connect to EEG booth. Please check the URL and try again.')
        
        if (MiniKit.isInstalled()) {
          MiniKit.commands.sendHapticFeedback({
            hapticsType: 'notification',
            style: 'error',
          })
        }
      }

    } catch (err) {
      console.error('🚨 Connection setup failed:', err)
      setConnectionStatus('error')
      setError('Failed to establish connection to EEG booth')
    }
  }, [connectionStatus, onComplete])

  const processImage = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      console.log('🖼️ Processing image:', file.name, file.size, 'bytes', file.type)
      
      // Create image preview
      const imageUrl = URL.createObjectURL(file)
      setCapturedImage(imageUrl)

      // Use Html5Qrcode for better detection
      console.log('🔍 Starting QR detection with Html5Qrcode...')
      
      const html5QrCode = new Html5Qrcode("dummy-id")
      
      try {
        const result = await html5QrCode.scanFile(file, true)
        
        console.log('✅ QR Code detected:', result)
        setExtractedUrl(result)
        
        // Try to parse as booth JSON data
        try {
          const parsed = JSON.parse(result) as EegBoothData
          if (parsed.booth_id && parsed.relayer_url) {
            setBoothData(parsed)
            console.log('🏢 Booth data parsed:', parsed)
            
            // Auto-connect to booth
            connectToBoothRelay(parsed)
          } else {
            // Treat as plain URL
            setBoothData({
              booth_id: `booth_${Date.now()}`,
              relayer_url: result
            })
          }
        } catch (jsonError) {
          // Not JSON, treat as URL
          setBoothData({
            booth_id: `booth_${Date.now()}`,
            relayer_url: result
          })
        }
        
        if (MiniKit.isInstalled()) {
          MiniKit.commands.sendHapticFeedback({
            hapticsType: 'notification',
            style: 'success',
          })
        }
        
      } catch (qrError) {
        console.error('❌ QR detection failed:', qrError)
        setError('No QR code found in this image. Please try taking a clearer photo or enter the URL manually.')
        
        if (MiniKit.isInstalled()) {
          MiniKit.commands.sendHapticFeedback({
            hapticsType: 'notification',
            style: 'error',
          })
        }
      }
      
      setIsProcessing(false)
      URL.revokeObjectURL(imageUrl)

    } catch (err) {
      console.error('🚨 Image processing failed:', err)
      setError('Failed to process the image. Please try again or enter URL manually.')
      setIsProcessing(false)
    }
  }

  const handleManualSubmit = () => {
    if (manualUrl.trim()) {
      console.log('📝 Manual URL entered:', manualUrl)
      setExtractedUrl(manualUrl.trim())
      
      // Create booth data from manual URL
      const data: EegBoothData = {
        booth_id: `manual_booth_${Date.now()}`,
        relayer_url: manualUrl.trim()
      }
      
      setBoothData(data)
      setShowManualInput(false)
      
      // Connect to booth
      connectToBoothRelay(data)
      
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'impact',
          style: 'light',
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('📷 Image captured:', file.name, file.size, 'bytes')
      processImage(file)
    }
  }

  const handleContinue = () => {
    if (MiniKit.isInstalled()) {
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'impact',
        style: 'medium',
      })
    }
    onComplete()
  }

  const resetScan = () => {
    setExtractedUrl(null)
    setError(null)
    setCapturedImage(null)
    setShowManualInput(false)
    setManualUrl('')
    setBoothData(null)
    setConnectionStatus('disconnected')
    
    // Close any open WebSocket connections
    if (websocketRef.current) {
      websocketRef.current.close()
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [])

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-5 h-5 text-green-600" />
      case 'connecting': return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'error': return <WifiOff className="w-5 h-5 text-red-600" />
      default: return <WifiOff className="w-5 h-5 text-gray-400" />
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to EEG Booth'
      case 'connecting': return 'Connecting to Booth...'
      case 'error': return 'Connection Failed'
      default: return 'Not Connected'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}
      <div className="px-6 pt-8">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Pair EEG Device</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Brain className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your EEG Device</h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Take a clear photo of the QR code on your EEG station to establish a secure connection
          </p>
        </div>

        {/* Connection Status */}
        {boothData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 mb-6 ${
              connectionStatus === 'connected' ? 'bg-green-50 border border-green-100' :
              connectionStatus === 'connecting' ? 'bg-blue-50 border border-blue-100' :
              connectionStatus === 'error' ? 'bg-red-50 border border-red-100' :
              'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              {getConnectionStatusIcon()}
              <div className="flex-1">
                <div className={`font-medium ${
                  connectionStatus === 'connected' ? 'text-green-800' :
                  connectionStatus === 'connecting' ? 'text-blue-800' :
                  connectionStatus === 'error' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  {getConnectionStatusText()}
                </div>
                <div className="text-sm text-gray-600">
                  Booth ID: {boothData.booth_id}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Photo Tips */}
        {!extractedUrl && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-2">📸 Photo Tips for Best Results:</div>
              <div className="space-y-1 text-yellow-700">
                <div>• Hold phone steady and get close to QR code</div>
                <div>• Ensure bright, even lighting</div>
                <div>• Fill the frame with the QR code</div>
                <div>• Avoid shadows, glare, or blurry photos</div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800 mb-1">Privacy Protected</div>
              <div className="text-sm text-blue-700">
                Your brain data is processed securely and only anonymized patterns are stored.
              </div>
            </div>
          </div>
        </div>

        {/* Photo/QR Display Section */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">
                {extractedUrl ? 'QR Code Detected ✅' : 'EEG Station QR Code'}
              </span>
            </div>

            {/* Image/QR Display */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ height: '300px' }}>
              {capturedImage ? (
                /* Captured Image */
                <div className="relative w-full h-full">
                  <img
                    src={capturedImage}
                    alt="Captured QR Code"
                    className="w-full h-full object-contain bg-gray-900"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-6 text-center max-w-xs">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <div className="font-medium mb-2">Scanning QR Code...</div>
                        <div className="text-sm text-gray-600">Using advanced detection algorithms</div>
                      </div>
                    </div>
                  )}
                  {extractedUrl && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        ✓ QR Detected
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Placeholder */
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50">
                  <Camera className="w-16 h-16 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-500 text-center">
                    <div className="font-medium mb-1">Ready to capture QR code</div>
                    <div>Tap button below to take photo</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Extracted URL Display */}
          {extractedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-green-800 mb-2">🔗 EEG Booth URL Extracted:</div>
                  <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm font-mono text-blue-800 break-all">
                        {extractedUrl}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-green-700">
                    ✅ Establishing WebSocket connection to EEG station...
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manual URL Input */}
          {showManualInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Type className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">Enter EEG Station URL</span>
              </div>
              
              <div className="space-y-3">
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="wss://192.168.1.100:8765 or ws://eeg-station.local"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                />
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualUrl.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false)
                      setManualUrl('')
                    }}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800 mb-1">❌ Connection Failed</div>
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {!extractedUrl && !showManualInput && (
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Scanning QR Code...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>📸 Take Photo of QR Code</span>
                    </>
                  )}
                </button>

                {/* Manual Input Option */}
                <button
                  onClick={() => setShowManualInput(true)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  <Type className="w-4 h-4" />
                  <span>⌨️ Enter URL Manually</span>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* Connection established - proceed button */}
            {connectionStatus === 'connected' && (
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors"
              >
                ✅ Proceed to EEG Capture
              </button>
            )}

            {/* Retry/Reset Options */}
            {(error || capturedImage || extractedUrl) && connectionStatus !== 'connected' && (
              <button
                onClick={resetScan}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                🔄 Try Different Connection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
