'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Camera, Shield, CheckCircle, AlertTriangle, ExternalLink, Type, Wifi, WifiOff } from 'lucide-react'
import { MiniKit } from '@worldcoin/minikit-js'

// QR Scanner types (following mock-scanner-frontend pattern)
declare global {
  interface Window {
    QrScanner: any;
  }
}

// Configuration (same as mock-scanner-frontend)
const DEFAULT_RELAYER_URL = 'wss://172.24.244.146:8765'

interface EegPairingScreenProps {
  onComplete: () => void
}

interface EegBoothData {
  booth_id: string
  relayer_url: string
}

export function EegPairingScreen({ onComplete }: EegPairingScreenProps) {
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null)
  const [boothData, setBoothData] = useState<EegBoothData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualBoothId, setManualBoothId] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const websocketRef = useRef<WebSocket | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<any>(null)

  // WebSocket connection to EEG booth (exact copy from mock-scanner-frontend)
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
        
        // Send scanner connection request (exact from mock-scanner-frontend)
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

  // QR Scanner implementation with iPhone/Safari fixes
  const startQRScanning = async () => {
    try {
      setIsScanning(true)
      setError(null)
      console.log('🎬 Starting QR scanning...')
      console.log('📱 User Agent:', navigator.userAgent)
      console.log('🌐 Platform:', navigator.platform)
      
      // Check camera availability first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available on this device')
      }
      
      // Import QR Scanner dynamically (same as mock-scanner-frontend)
      const QrScanner = (await import('qr-scanner')).default
      console.log('📦 QR Scanner loaded:', QrScanner)
      
      if (videoRef.current) {
        console.log('📹 Video element found, creating QR scanner...')
        
        // Add video event listeners for debugging
        const video = videoRef.current
        video.onloadstart = () => console.log('📹 Video load start')
        video.onloadedmetadata = () => console.log('📹 Video metadata loaded')
        video.oncanplay = () => console.log('📹 Video can play')
        video.onplay = () => console.log('📹 Video playing')
        video.onerror = (e) => console.error('📹 Video error:', e)
        
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result: any) => {
            try {
              console.log('QR Code scanned:', result.data)  // Exact log format from mock-scanner
              
              // Parse QR data (exact logic from mock-scanner-frontend)
              const qrData = JSON.parse(result.data)
              
              if (qrData.booth_id && qrData.relayer_url) {
                console.log('Valid booth data found:', qrData)
                setExtractedUrl(result.data)
                setBoothData(qrData)
                qrScannerRef.current?.stop()
                setIsScanning(false)
                
                // Connect to booth (same as mock-scanner-frontend)
                connectToBoothRelay(qrData)
                
                if (MiniKit.isInstalled()) {
                  MiniKit.commands.sendHapticFeedback({
                    hapticsType: 'notification',
                    style: 'success',
                  })
                }
              } else {
                console.error('Invalid QR code format. Expected booth connection data.')
                setError('Invalid QR code format. Expected booth connection data.')
                qrScannerRef.current?.stop()
                setIsScanning(false)
              }
            } catch (error) {
              console.error('Invalid QR code. Please scan a valid booth QR code.')
              setError('Invalid QR code. Please scan a valid booth QR code.')
              qrScannerRef.current?.stop()
              setIsScanning(false)
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )
        
        await qrScannerRef.current.start()
        console.log('✅ QR Scanner started successfully')
        console.log('📹 Video should now be visible')
        
        // Additional debugging for iPhone
        setTimeout(() => {
          if (videoRef.current) {
            console.log('📹 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
            console.log('📹 Video ready state:', videoRef.current.readyState)
            console.log('📹 Video paused:', videoRef.current.paused)
          }
        }, 2000)
        
      } else {
        console.error('❌ Video element not found')
        setError('Video element not available')
        setIsScanning(false)
      }
    } catch (error) {
      console.error('❌ Error starting QR scanner:', error)
      console.error('❌ Full error details:', error)
      setIsScanning(false)
      
      // More specific error message for iPhone users
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        setError('Camera access failed on iPhone. Please ensure camera permissions are enabled in World App settings.')
      } else {
        setError('Camera access required for QR scanning. Please allow camera permissions.')
      }
      
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'error',
        })
      }
    }
  }

  const stopQRScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      setIsScanning(false)
      console.log('🛑 QR Scanner stopped')
    }
  }

  const handleManualSubmit = () => {
    if (manualBoothId.trim()) {
      console.log('📝 Manual booth ID entered:', manualBoothId)
      
      // Create booth data from manual booth ID (same as mock-scanner-frontend)
      const data: EegBoothData = {
        booth_id: manualBoothId.trim(),
        relayer_url: DEFAULT_RELAYER_URL
      }
      
      setExtractedUrl(JSON.stringify(data))
      setBoothData(data)
      setShowManualInput(false)
      setManualBoothId('')
      
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
    setShowManualInput(false)
    setManualBoothId('')
    setBoothData(null)
    setConnectionStatus('disconnected')
    
    // Stop QR scanner and close WebSocket
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
    }
    if (websocketRef.current) {
      websocketRef.current.close()
    }
    setIsScanning(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy()
      }
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
            Scan the QR code on your EEG station to establish a secure connection
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
                <div className="text-xs text-gray-500 font-mono break-all">
                  {boothData.relayer_url}
                </div>
              </div>
            </div>
          </motion.div>
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

        {/* Camera/QR Display Section */}
        <div className="flex-1 flex flex-col">
          {/* Camera View for QR Scanning */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Scanning for QR Code</span>
                </div>
                <button
                  onClick={stopQRScanning}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Stop
                </button>
              </div>
              
              <div className="relative rounded-lg overflow-hidden bg-black" style={{ height: '300px' }}>
                <video 
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  controls={false}
                  webkit-playsinline="true"
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    backgroundColor: '#000',
                    display: 'block'
                  }}
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    📷 Point camera at QR code
                  </div>
                </div>
                
                {/* Debug overlay for iPhone */}
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  📱 Video Status: {isScanning ? 'Active' : 'Inactive'}
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
                <span className="font-medium text-gray-800">Enter Booth ID</span>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={manualBoothId}
                  onChange={(e) => setManualBoothId(e.target.value)}
                  placeholder="booth_123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                
                <div className="text-xs text-gray-500">
                  Will connect to: {DEFAULT_RELAYER_URL}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualBoothId.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false)
                      setManualBoothId('')
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
            {connectionStatus === 'disconnected' && !isScanning && !showManualInput && (
              <div className="space-y-3">
                <button
                  onClick={startQRScanning}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span>📷 Scan QR Code with Camera</span>
                </button>

                {/* iPhone-friendly photo capture as primary option */}
                <button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.capture = 'environment'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        console.log('📸 Photo captured via direct input:', file.name)
                        // For now just show success (you can add QR processing here)
                        setError('Photo captured! QR processing would happen here.')
                        
                        if (MiniKit.isInstalled()) {
                          MiniKit.commands.sendHapticFeedback({
                            hapticsType: 'notification',
                            style: 'success',
                          })
                        }
                      }
                    }
                    input.click()
                  }}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span>📸 Take Photo of QR Code (iPhone)</span>
                </button>

                <button
                  onClick={() => setShowManualInput(true)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  <Type className="w-4 h-4" />
                  <span>⌨️ Enter Booth ID Manually</span>
                </button>
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
            {(error || extractedUrl) && connectionStatus !== 'connected' && !isScanning && !showManualInput && (
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
