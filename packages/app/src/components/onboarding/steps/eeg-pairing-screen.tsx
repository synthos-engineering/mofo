'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Camera, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { MiniKit, Permission, ResponseEvent } from '@worldcoin/minikit-js'

interface EegPairingScreenProps {
  onComplete: () => void
}

export function EegPairingScreen({ onComplete }: EegPairingScreenProps) {
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending' | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const requestCameraPermission = useCallback(async () => {
    try {
      // If in World App and camera is already granted at app level, just access it directly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera for QR scanning
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      setCameraPermission('granted')
      return stream
    } catch (error) {
      console.error('Camera access failed:', error)
      setCameraPermission('denied')
      
      // Send haptic feedback for error
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'error',
        })
      }
      return null
    }
  }, [])

  const startQRScanning = async () => {
    setIsScanning(true)
    
    const stream = await requestCameraPermission()
    if (!stream) {
      setIsScanning(false)
      return
    }

    streamRef.current = stream
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play()
    }

    // Simulate QR code detection (in a real app, you'd use a QR scanning library like jsqr)
    setTimeout(() => {
      setScanResult('EEG_STATION_QR_12345')
      stopCamera()
      
      // Send haptic feedback
      if (MiniKit.isInstalled()) {
        MiniKit.commands.sendHapticFeedback({
          hapticsType: 'notification',
          style: 'success',
        })
      }

      // Complete the pairing
      setTimeout(() => {
        onComplete()
      }, 1500)
    }, 3000)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  useEffect(() => {
    // Cleanup camera stream on unmount
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Pair EEG Device</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-8">
        {/* EEG Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center mb-8"
        >
          <Brain className="w-16 h-16 text-gray-800" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl font-bold text-gray-900 mb-4 text-center"
        >
          Connect Your EEG Device
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-gray-600 text-center mb-8"
        >
          Scan the QR code on your EEG station to establish a secure connection
        </motion.p>

        {/* Privacy Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800 mb-1">Privacy Protected</div>
              <div className="text-sm text-blue-700">
                Your brain data is processed securely and only anonymized patterns are stored.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Camera/QR Code Section */}
        <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex-1 flex flex-col items-center"
        >
        {/* Camera View or QR Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 w-full max-w-sm">
        <div className="flex items-center space-x-2 mb-4">
        <Camera className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">
                  {isScanning ? 'Scanning QR Code' : 'EEG Station QR Code'}
          </span>
        </div>

        {/* Camera View or QR Placeholder */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          {isScanning ? (
              <div className="relative">
                    <video
                  ref={videoRef}
                className="w-full h-48 object-cover"
                playsInline
                  muted
                  />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-lg animate-pulse">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-20 h-20 border-2 border-blue-500 rounded-lg bg-blue-500/20"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  Scanning for QR code...
                </div>
              </div>
            ) : scanResult ? (
                <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <div className="text-sm text-green-600 font-medium">QR Code Detected!</div>
                  <div className="text-xs text-gray-500 mt-1">Connecting to EEG station...</div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-6xl text-gray-400 font-mono mb-2">QR</div>
                    <div className="text-sm text-gray-500 mb-2">QR Code displayed on</div>
                    <div className="text-sm text-gray-500">EEG Station screen</div>
                  </div>
                )}
              </div>
            </div>

            {!isScanning && !scanResult && (
              <div className="text-center mb-8">
                <div className="font-medium text-gray-800 mb-1">Look for this QR code on your EEG station</div>
                <div className="text-sm text-gray-500">The QR code should be visible on the station's display</div>
              </div>
            )}

            {/* Permission Status */}
            {cameraPermission === 'denied' && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 w-full max-w-sm">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">Camera Access Failed</div>
                    <div className="text-sm text-red-700">
                      Unable to access camera. Please check camera permissions or try again.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Scan Button */}
          {!isScanning && !scanResult && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              onClick={startQRScanning}
              disabled={cameraPermission === 'denied'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5" />
              <span>Scan QR Code with Camera</span>
            </motion.button>
          )}

          {/* Stop Scanning Button */}
          {isScanning && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={stopCamera}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2 mb-6"
            >
              <span>Stop Scanning</span>
            </motion.button>
          )}
      </div>
    </div>
  )
}
