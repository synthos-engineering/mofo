import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';

// Configuration
const DEFAULT_RELAYER_URL = 'wss://172.24.244.146:8765';

// QR Scanner types (since @types/qr-scanner doesn't exist)
declare global {
  interface Window {
    QrScanner: any;
  }
}

interface QRData {
  booth_id: string;
  relayer_url: string;
}

interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  booth_id?: string;
  error?: string;
  messages: Array<{
    type: 'sent' | 'received';
    message: string;
    timestamp: string;
  }>;
}

function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    messages: []
  });
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [manualBoothId, setManualBoothId] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<any>(null);

  const addMessage = (type: 'sent' | 'received', message: string) => {
    setConnectionState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      }]
    }));
  };

  const connectToRelay = useCallback(async (boothData: QRData) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
    }

    setConnectionState(prev => ({
      ...prev,
      status: 'connecting',
      booth_id: boothData.booth_id,
      error: undefined
    }));

    try {
      const ws = new WebSocket(boothData.relayer_url);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to relayer');
        
        // Send scanner connection request
        const connectMessage = {
          type: 'connect_scanner',
          booth_id: boothData.booth_id
        };
        
        ws.send(JSON.stringify(connectMessage));
        addMessage('sent', `Connecting to booth ${boothData.booth_id}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from relayer:', data);
          
          if (data.type === 'connection_success') {
            setConnectionState(prev => ({
              ...prev,
              status: 'connected'
            }));
            addMessage('received', 'Successfully connected to booth!');
            
            // Send connection established message
            const establishedMessage = {
              type: 'relay_message',
              data: {
                action: 'connection_established',
                message: 'Scanner connected and ready'
              }
            };
            
            ws.send(JSON.stringify(establishedMessage));
            addMessage('sent', 'Connection established');
            
          } else if (data.type === 'message_from_booth') {
            addMessage('received', `Booth: ${JSON.stringify(data.data)}`);
            
          } else if (data.type === 'booth_disconnected') {
            setConnectionState(prev => ({
              ...prev,
              status: 'disconnected'
            }));
            addMessage('received', 'Booth disconnected');
            
          } else if (data.type === 'error') {
            setConnectionState(prev => ({
              ...prev,
              status: 'error',
              error: data.message
            }));
            addMessage('received', `Error: ${data.message}`);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from relayer');
        setConnectionState(prev => ({
          ...prev,
          status: 'disconnected'
        }));
        addMessage('received', 'Disconnected from relayer');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState(prev => ({
          ...prev,
          status: 'error',
          error: 'Connection failed'
        }));
        addMessage('received', 'Connection error occurred');
      };

    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to connect'
      }));
      addMessage('received', 'Failed to establish connection');
    }
  }, []);

  const startQRScanning = async () => {
    try {
      setIsScanning(true);
      
      // Import QR Scanner dynamically
      const QrScanner = (await import('qr-scanner')).default;
      
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result: any) => {
            try {
              const qrData = JSON.parse(result.data);
              console.log('QR Code scanned:', qrData);
              
              if (qrData.booth_id && qrData.relayer_url) {
                setScannedData(qrData);
                qrScannerRef.current?.stop();
                setIsScanning(false);
                connectToRelay(qrData);
              } else {
                alert('Invalid QR code format. Expected booth connection data.');
              }
            } catch (error) {
              alert('Invalid QR code. Please scan a valid booth QR code.');
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        await qrScannerRef.current.start();
      }
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setIsScanning(false);
      alert('Camera access required for QR scanning');
    }
  };

  const stopQRScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const connectManually = () => {
    if (manualBoothId.trim()) {
      const manualData: QRData = {
        booth_id: manualBoothId.trim(),
        relayer_url: DEFAULT_RELAYER_URL
      };
      setScannedData(manualData);
      connectToRelay(manualData);
      setShowManualEntry(false);
      setManualBoothId('');
    }
  };

  const sendTestMessage = () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      const testMessage = {
        type: 'relay_message',
        data: {
          action: 'start_session',
          message: 'Starting EEG session from scanner'
        }
      };
      
      websocketRef.current.send(JSON.stringify(testMessage));
      addMessage('sent', 'Start EEG Session');
    }
  };

  const disconnect = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    setConnectionState({
      status: 'disconnected',
      messages: []
    });
    setScannedData(null);
  };

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionState.status) {
      case 'connected': return '#10B981';
      case 'connecting': return '#3B82F6';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (connectionState.status) {
      case 'connected': return 'Connected to Booth';
      case 'connecting': return 'Connecting...';
      case 'error': return `Error: ${connectionState.error}`;
      default: return 'Not Connected';
    }
  };

  return (
    <div className="scanner-app">
      <header className="scanner-header">
        <div className="scanner-icon">📱</div>
        <h1>EEG Scanner</h1>
        <div 
          className="status-badge"
          style={{ backgroundColor: getStatusColor() }}
        >
          {getStatusText()}
        </div>
      </header>

      <main className="scanner-main">
        {connectionState.status === 'disconnected' && !isScanning && (
          <div className="connection-section">
            <div className="scan-instructions">
              <h2>Connect to EEG Booth</h2>
              <p>Scan the QR code on your EEG station to establish a secure connection</p>
            </div>

            <div className="privacy-notice">
              <div className="privacy-icon">🔒</div>
              <div className="privacy-content">
                <h3>Privacy Protected</h3>
                <p>Your brain data is processed securely and only anonymized patterns are stored.</p>
              </div>
            </div>

            <div className="connection-options">
              <button className="scan-button" onClick={startQRScanning}>
                <span className="camera-icon">📷</span>
                Scan QR Code with Camera
              </button>

              <div className="manual-entry">
                <button 
                  className="manual-button"
                  onClick={() => setShowManualEntry(!showManualEntry)}
                >
                  Enter Booth ID Manually
                </button>
                
                {showManualEntry && (
                  <div className="manual-form">
                    <input
                      type="text"
                      placeholder="Enter Booth ID (e.g., booth_123)"
                      value={manualBoothId}
                      onChange={(e) => setManualBoothId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && connectManually()}
                    />
                    <button onClick={connectManually}>Connect</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="scanning-section">
            <h2>Scanning for QR Code</h2>
            <div className="camera-container">
              <video ref={videoRef} className="camera-video"></video>
            </div>
            <p>Point your camera at the booth's QR code</p>
            <button className="stop-scan-button" onClick={stopQRScanning}>
              Stop Scanning
            </button>
          </div>
        )}

        {connectionState.status === 'connecting' && (
          <div className="connecting-section">
            <div className="loading-spinner"></div>
            <h2>Connecting to Booth</h2>
            <p>Booth ID: {connectionState.booth_id}</p>
          </div>
        )}

        {connectionState.status === 'connected' && (
          <div className="connected-section">
            <div className="connection-info">
              <h2>Connected to Booth</h2>
              <p>Booth ID: {connectionState.booth_id}</p>
              {scannedData && (
                <div className="scanned-data">
                  <p>Relayer: {scannedData.relayer_url}</p>
                </div>
              )}
            </div>

            <div className="controls">
              <button className="test-button" onClick={sendTestMessage}>
                Start EEG Session
              </button>
              <button className="disconnect-button" onClick={disconnect}>
                Disconnect
              </button>
            </div>

            <div className="message-log">
              <h3>Communication Log</h3>
              <div className="messages">
                {connectionState.messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.type}`}>
                    <span className="timestamp">{msg.timestamp}</span>
                    <span className="message-text">{msg.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {connectionState.status === 'error' && (
          <div className="error-section">
            <div className="error-icon">❌</div>
            <h2>Connection Failed</h2>
            <p>{connectionState.error}</p>
            <button onClick={() => setConnectionState({ status: 'disconnected', messages: [] })}>
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
