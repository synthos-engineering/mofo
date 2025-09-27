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
  const [scanResult, setScanResult] = useState<QRCodeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        
        // Start QR code scanning
        startQRScanning()
      }

      // Send haptic feedback
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'impact',
          style: 'light',
        })
      }
    } catch (err) {
      console.error('Camera access failed:', err)
      setError('Unable to access camera. Please check permissions.')
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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setIsScanning(false)
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
            <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
              {isScanning ? (
                <>
                  {/* Live Camera Feed */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-blue-500 rounded-lg bg-blue-500/10 animate-pulse">
                      <div className="absolute inset-0 border-2 border-white rounded-lg m-2"></div>
                    </div>
                  </div>
                  
                  {/* Scanning Instructions */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                      Point camera at QR code
                    </div>
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
                  <div className="text-sm text-red-600 text-center max-w-xs mb-4">
                    {error}
                  </div>
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                /* Placeholder State */
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-6xl text-gray-400 font-mono mb-4">📱</div>
                  <div className="text-sm text-gray-500 text-center">
                    <div>QR Code displayed on</div>
                    <div>EEG Station screen</div>
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
          <div className="space-y-3">
            {!isScanning && !scanResult && (
              <button
                onClick={startCamera}
                className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Scan QR Code with Camera</span>
              </button>
            )}

            {scanResult && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="text-sm text-green-700">
                    <div className="font-medium mb-2">Connection Details:</div>
                    <div>• Station ID: {scanResult.station_id}</div>
                    <div>• Hardware: {scanResult.hardware_type}</div>
                    <div>• Channels: {scanResult.channels}</div>
                  </div>
                </div>
                
                <button
                  onClick={onComplete}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
                >
                  Continue to EEG Capture
                </button>
              </div>
            )}

            {/* Skip for Demo Button */}
            <button
              onClick={() => {
                // For demo purposes, allow skipping
                setScanResult({
                  station_id: 'demo_station',
                  websocket_url: 'ws://demo.mofo.eth:8765',
                  hardware_type: 'Demo_EEG',
                  channels: 8
                })
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 text-sm"
            >
              Skip QR Scan (Demo Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
