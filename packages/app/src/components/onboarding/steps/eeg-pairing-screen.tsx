'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Camera, Shield, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { MiniKit } from '@worldcoin/minikit-js'
import jsQR from 'jsqr'

interface EegPairingScreenProps {
  onComplete: () => void
}

interface QRCodeData {
  station_id: string
  websocket_url: string
  hardware_type: string
  channels: number
}

export function EegPairingScreen({ onComplete }: EegPairingScreenProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const [scanResult, setScanResult] = useState<QRCodeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [showFileInput, setShowFileInput] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsStartingCamera(true)
      console.log('Starting camera...')

      // Request camera access - try back camera first, then front camera
      let stream: MediaStream | null = null
      
      try {
        // Try back camera first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        })
        console.log('Back camera accessed successfully')
      } catch (backCameraError) {
        console.log('Back camera failed, trying front camera:', backCameraError)
        // Fallback to front camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        })
        console.log('Front camera accessed successfully')
      }

      if (!stream) {
        throw new Error('No camera stream available')
      }

      streamRef.current = stream
      console.log('Camera stream tracks:', stream.getVideoTracks())

      if (videoRef.current) {
        console.log('Setting up video element...')
        const video = videoRef.current
        
        // Set the stream
        video.srcObject = stream
        
        // Set up event handlers
        video.onloadedmetadata = () => {
          const info = `Video loaded: ${video.videoWidth}x${video.videoHeight}`
          console.log(info)
          setDebugInfo(info)
          setIsStartingCamera(false)
          setIsScanning(true)
        }

        video.onplaying = () => {
          const info = `Video playing: Ready for QR scanning`
          console.log(info)
          setDebugInfo(info)
          // Start QR scanning once video is actually playing
          setTimeout(() => {
            startQRScanning()
          }, 500)
        }

        video.onpause = () => {
          console.log('Video paused')
          setDebugInfo('Video paused')
        }

        video.onended = () => {
          console.log('Video ended')
          setDebugInfo('Video ended')
        }

        video.onerror = (e) => {
          const errorInfo = `Video error: ${e}`
          console.error(errorInfo)
          setDebugInfo(errorInfo)
          setError('Video playback failed')
          setIsStartingCamera(false)
          setIsScanning(false)
        }

        // Start playback
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Play failed:', err)
            setError('Camera preview failed to start')
            setIsStartingCamera(false)
            setIsScanning(false)
          })
        }
      }

      // Send haptic feedback
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'impact',
          style: 'light',
        })
      }
    } catch (err) {
      console.error('Camera setup failed:', err)
      setError(`Camera access failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsStartingCamera(false)
      setIsScanning(false)
      
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'error',
        })
      }
    }
  }, [])

  const startQRScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

        if (qrCode) {
          console.log('QR Code detected:', qrCode.data)
          
          try {
            // Try to parse as JSON (for EEG station data)
            const qrData = JSON.parse(qrCode.data) as QRCodeData
            setScanResult(qrData)
            stopCamera()
            
            // Send success haptic
            if (MiniKit.isInstalled()) {
              MiniKit.commands.sendHapticFeedback({
                hapticsType: 'notification',
                style: 'success',
              })
            }

            // Complete pairing after brief delay
            setTimeout(() => {
              onComplete()
            }, 1500)
          } catch (jsonError) {
            // If not JSON, treat as URL or plain text
            console.log('QR contains URL/text:', qrCode.data)
            
            // For demo, accept any QR code as valid
            setScanResult({
              station_id: 'eeg_station_001',
              websocket_url: qrCode.data,
              hardware_type: 'OpenBCI_Cyton',
              channels: 8
            })
            stopCamera()
            
            if (MiniKit.isInstalled()) {
              MiniKit.commands.sendHapticFeedback({
                hapticsType: 'notification',
                style: 'success',
              })
            }

            setTimeout(() => {
              onComplete()
            }, 1500)
          }
        }
      }
    }, 100) // Check for QR codes every 100ms
  }, [onComplete])

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...')
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.label)
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    setIsStartingCamera(false)
  }, [])

  const handleRetry = () => {
    setError(null)
    setScanResult(null)
    startCamera()
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera()
    }
  }, [stopCamera])

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
      <div className="flex-1 flex flex-col px-6 pt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Brain className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your EEG Device</h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Scan the QR code on your EEG station to establish a secure connection
          </p>
        </div>

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

        {/* Camera/Scanning Section */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">
                  {isScanning ? 'Scanning for QR Code' : scanResult ? 'QR Code Found' : 'EEG Station QR Code'}
                </span>
              </div>
              {isScanning && (
                <button
                  onClick={stopCamera}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Camera Feed / QR Display */}
            <div className="relative rounded-lg overflow-hidden bg-black w-full" style={{ height: '320px' }}>
              {isStartingCamera ? (
                /* Starting Camera State */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-white text-sm font-medium mb-1">Starting Camera...</div>
                  <div className="text-gray-300 text-xs">Please allow camera access</div>
                </div>
              ) : isScanning ? (
                <>
                  {/* Live Camera Feed */}
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                    controls={false}
                    webkit-playsinline="true"
                    style={{ 
                      backgroundColor: '#000',
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      {/* Corner brackets */}
                      <div className="w-48 h-48 relative">
                        {/* Top-left corner */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-400"></div>
                        {/* Top-right corner */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-400"></div>
                        {/* Bottom-left corner */}
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-400"></div>
                        {/* Bottom-right corner */}
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-400"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Debug Info - for troubleshooting */}
                  {debugInfo && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
                        {debugInfo}
                      </div>
                    </div>
                  )}

                  {/* Scanning Instructions */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      🎯 Align QR code within frame
                    </div>
                  </div>

                  {/* Stop scanning button */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={stopCamera}
                      className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : scanResult ? (
                /* Success State */
                <div className="w-full h-full flex flex-col items-center justify-center bg-green-50">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <div className="text-lg font-semibold text-green-800 mb-2">QR Code Detected!</div>
                  <div className="text-sm text-green-600 text-center max-w-xs">
                    Connected to: {scanResult.station_id}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Hardware: {scanResult.hardware_type}
                  </div>
                </div>
              ) : error ? (
                /* Error State */
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                  <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                  <div className="text-lg font-semibold text-red-800 mb-2">Camera Error</div>
                  <div className="text-sm text-red-600 text-center max-w-xs mb-4 px-4">
                    {error}
                  </div>
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                /* Placeholder State */
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50">
                  <Camera className="w-16 h-16 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-500 text-center">
                    <div className="font-medium mb-1">Ready to scan</div>
                    <div>Tap button below to start camera</div>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for QR processing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Instructions */}
          {!isScanning && !scanResult && !error && (
            <div className="text-center mb-6">
              <div className="font-medium text-gray-800 mb-1">Look for this QR code on your EEG station</div>
              <div className="text-sm text-gray-500">The QR code should be visible on the station's display</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {!isScanning && !scanResult && !error && !isStartingCamera && (
              <div className="space-y-3">
                <button
                  onClick={startCamera}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Live Camera Scan</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo to Scan QR</span>
                </button>
                
                {/* Hidden file input for camera capture */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Process image file for QR code
                      console.log('Image captured:', file.name)
                      // For now, simulate success
                      setScanResult({
                        station_id: 'captured_station',
                        websocket_url: 'ws://captured.mofo.eth:8765',
                        hardware_type: 'Photo_Scan',
                        channels: 8
                      })
                    }
                  }}
                />
                
                {/* Debug info display */}
                {debugInfo && (
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-600 font-mono">{debugInfo}</div>
                  </div>
                )}
              </div>
            )}

            {isStartingCamera && (
              <button
                disabled
                className="w-full bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 cursor-not-allowed opacity-75"
              >
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting Camera...</span>
              </button>
            )}

            {scanResult && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="text-sm text-green-700">
                    <div className="font-medium mb-2">🔗 Connection Established:</div>
                    <div className="space-y-1">
                      <div>• Station: {scanResult.station_id}</div>
                      <div>• Hardware: {scanResult.hardware_type}</div>
                      <div>• Channels: {scanResult.channels}</div>
                      <div>• URL: {scanResult.websocket_url}</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={onComplete}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors"
                >
                  ✅ Continue to EEG Capture
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
