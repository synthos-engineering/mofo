'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronLeft, Camera, Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { MiniKit } from '@worldcoin/minikit-js'
import jsQR from 'jsqr'

interface EegPairingScreenProps {
  onComplete: () => void
}

export function EegPairingScreen({ onComplete }: EegPairingScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const processImage = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Create image preview
      const imageUrl = URL.createObjectURL(file)
      setCapturedImage(imageUrl)

      // Create image element for processing
      const img = new Image()
      img.onload = () => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (!context) return

        console.log('Processing image - Original dimensions:', img.width, 'x', img.height)

        // Set canvas dimensions to image dimensions
        canvas.width = img.width
        canvas.height = img.height

        // Draw image to canvas
        context.drawImage(img, 0, 0)

        // Get image data for QR processing
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        console.log('Canvas image data ready:', imageData.width, 'x', imageData.height, 'pixels')
        
        // Try multiple QR detection methods
        let qrCode = null
        
        console.log('🔍 Attempting QR detection method 1: Standard scan...')
        qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        })
        
        if (!qrCode) {
          console.log('🔍 Attempting QR detection method 2: Inverted colors...')
          qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'onlyInvert'
          })
        }

        if (!qrCode) {
          console.log('🔍 Attempting QR detection method 3: Both inversion attempts...')
          qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          })
        }

        // Try with scaled down image if original is too large
        if (!qrCode && Math.max(img.width, img.height) > 1200) {
          console.log('🔍 Attempting QR detection method 4: Scaled down image...')
          const scale = 800 / Math.max(img.width, img.height)
          const scaledWidth = Math.floor(img.width * scale)
          const scaledHeight = Math.floor(img.height * scale)
          
          canvas.width = scaledWidth
          canvas.height = scaledHeight
          context.drawImage(img, 0, 0, scaledWidth, scaledHeight)
          
          const scaledImageData = context.getImageData(0, 0, scaledWidth, scaledHeight)
          console.log('Scaled image data:', scaledWidth, 'x', scaledHeight)
          qrCode = jsQR(scaledImageData.data, scaledImageData.width, scaledImageData.height, {
            inversionAttempts: 'attemptBoth'
          })
        }

        if (qrCode) {
          console.log('✅ QR Code successfully detected!')
          console.log('📄 QR Code data:', qrCode.data)
          console.log('📍 QR Code location:', qrCode.location)
          setExtractedUrl(qrCode.data)
          
          // Send success haptic
          if (MiniKit.isInstalled()) {
            MiniKit.commands.sendHapticFeedback({
              hapticsType: 'notification',
              style: 'success',
            })
          }
        } else {
          console.log('❌ No QR code detected with any method')
          console.log('📊 Image stats - Width:', img.width, 'Height:', img.height, 'Type:', file.type)
          setError('No QR code found. Please ensure the QR code is clearly visible, well-lit, and takes up a good portion of the photo.')
          
          // Send error haptic
          if (MiniKit.isInstalled()) {
            MiniKit.commands.sendHapticFeedback({
              hapticsType: 'notification',
              style: 'error',
            })
          }
        }
        
        setIsProcessing(false)
        
        // Cleanup
        URL.revokeObjectURL(imageUrl)
      }

      img.onerror = () => {
        setError('Failed to process the image. Please try again.')
        setIsProcessing(false)
        URL.revokeObjectURL(imageUrl)
      }

      img.src = imageUrl
    } catch (err) {
      console.error('Image processing failed:', err)
      setError('Failed to process the image. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Image captured:', file.name, file.size, 'bytes')
      processImage(file)
    }
  }

  const handleContinue = () => {
    // Send haptic feedback
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

        {/* Photo Tips */}
        {!extractedUrl && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-2">📸 Photo Tips for Best Results:</div>
              <div className="space-y-1 text-yellow-700">
                <div>• Hold phone steady and close to QR code</div>
                <div>• Ensure good lighting without glare</div>
                <div>• Make QR code fill most of the frame</div>
                <div>• Avoid shadows or reflections</div>
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
                {extractedUrl ? 'QR Code Processed' : 'EEG Station QR Code'}
              </span>
            </div>

            {/* Image/QR Display */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ height: '320px' }}>
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
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <div className="text-sm font-medium">Processing QR Code...</div>
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

            {/* Hidden canvas for QR processing */}
            <canvas ref={canvasRef} className="hidden" />
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
                  <div className="font-medium text-green-800 mb-2">QR Code URL Extracted:</div>
                  <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm font-mono text-blue-800 break-all">
                        {extractedUrl}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-green-700">
                    This URL will be used to connect to your EEG station.
                  </div>
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
                  <div className="font-medium text-red-800 mb-1">Scan Failed</div>
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {!extractedUrl && (
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

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {(error || capturedImage) && (
                  <button
                    onClick={resetScan}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Take New Photo
                  </button>
                )}
              </div>
            )}

            {extractedUrl && (
              <div className="space-y-3">
                <button
                  onClick={handleContinue}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors"
                >
                  ✅ Connect to EEG Station
                </button>
                
                <button
                  onClick={resetScan}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Scan Different QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
