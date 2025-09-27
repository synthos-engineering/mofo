'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Scan, CheckCircle, AlertCircle, Loader2, Laptop } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanSuccess: (hubData: any) => void;
  isLoading: boolean;
}

export function QRScanner({ onScanSuccess, isLoading }: QRScannerProps) {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [scannedData, setScannedData] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setScanState('scanning');
      setErrorMessage('');

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('No camera available');
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera if available
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      setScanState('error');
      setErrorMessage('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setScanState('idle');
  };

  const handleScanResult = (data: string) => {
    try {
      // Parse QR code data (expecting JSON with hub connection info)
      const hubData = JSON.parse(data);
      
      // Validate hub data structure
      if (hubData.type === 'eeg-hub' && hubData.hubId && hubData.endpoint) {
        setScannedData(hubData);
        setScanState('success');
        stopScanning();
        
        // Simulate connection delay
        setTimeout(() => {
          onScanSuccess(hubData);
        }, 2000);
      } else {
        throw new Error('Invalid QR code format');
      }
    } catch (error) {
      console.error('Invalid QR code:', error);
      setErrorMessage('Invalid QR code. Please scan the EEG Hub QR code.');
      setScanState('error');
      stopScanning();
    }
  };

  const renderContent = () => {
    switch (scanState) {
      case 'scanning':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                Scan EEG Hub QR Code
              </h2>
              <p className="text-gray-300">
                Point your camera at the QR code displayed on the EEG Hub laptop
              </p>
            </div>

            <div className="relative mx-auto w-72 h-72 bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
              />
              <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>
              </div>
              <motion.div
                className="absolute inset-0 border-2 border-blue-400 rounded-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="text-center">
              <button
                onClick={stopScanning}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Cancel Scan
              </button>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Hub Connected!
              </h3>
              <p className="text-gray-300 mb-4">
                Successfully connected to EEG Hub: {scannedData?.hubId}
              </p>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Establishing connection...</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Scan Failed
              </h3>
              <p className="text-gray-300 mb-4">
                {errorMessage || 'Unable to scan QR code'}
              </p>
              <button
                onClick={() => setScanState('idle')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Connect to EEG Hub
              </h2>
              <p className="text-gray-300 mb-6">
                Scan the QR code displayed on the EEG Hub laptop to establish a connection
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Laptop className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Setup Instructions:</span>
                </div>
                <div className="text-sm text-gray-300 text-left space-y-2">
                  <p>1. Make sure the EEG Hub laptop is powered on</p>
                  <p>2. The QR code should be displayed on the screen</p>
                  <p>3. Position your phone camera to scan the QR code</p>
                  <p>4. Hold steady until the code is recognized</p>
                </div>
              </div>
            </div>

            <button
              onClick={startScanning}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  <span>Start Scanning</span>
                </>
              )}
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
}

