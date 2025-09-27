import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import './App.css';

interface BoothStatus {
  booth_id: string;
  is_connected: boolean;
  scanner_connected: boolean;
  connection_status: string;
  timestamp: string;
}

interface BoothInfo {
  booth_id: string;
  qr_data: {
    booth_id: string;
    relayer_url: string;
  };
  status: string;
}

function App() {
  const [boothStatus, setBoothStatus] = useState<BoothStatus | null>(null);
  const [boothInfo, setBoothInfo] = useState<BoothInfo | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      const qrDataUrl = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const fetchBoothInfo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3004/booth-info');
      if (response.ok) {
        const data: BoothInfo = await response.json();
        setBoothInfo(data);
        
        // Generate QR code with booth connection data
        const qrData = JSON.stringify({
          booth_id: data.booth_id,
          relayer_url: 'wss://172.24.244.146:8765'
        });
        
        const qrDataUrl = await generateQRCode(qrData);
        setQrCodeDataUrl(qrDataUrl);
      }
    } catch (error) {
      console.error('Error fetching booth info:', error);
    }
  }, []);

    const fetchBoothStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3004/status');
      if (response.ok) {
        const data: BoothStatus = await response.json();
        setBoothStatus(data);
      }
    } catch (error) {
      console.error('Error fetching booth status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoothInfo();
    fetchBoothStatus();

    // Poll for status updates every 2 seconds
    const statusInterval = setInterval(fetchBoothStatus, 2000);

    return () => clearInterval(statusInterval);
  }, [fetchBoothInfo, fetchBoothStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'user_connected':
        return '#10B981'; // Green
      case 'registered':
      case 'connected':
        return '#3B82F6'; // Blue
      case 'disconnected':
      case 'connection_failed':
        return '#EF4444'; // Red
      case 'error':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'user_connected':
        return 'User Connected';
      case 'registered':
        return 'Ready for Connection';
      case 'connected':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'connection_failed':
        return 'Connection Failed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown Status';
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Connecting to EEG Booth...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="booth-header">
        <div className="brain-icon">🧠</div>
        <h1>EEG Booth Station</h1>
        <div className="booth-id">
          Booth ID: {boothInfo?.booth_id || 'Unknown'}
        </div>
      </header>

      <main className="booth-main">
        <div className="status-section">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(boothStatus?.connection_status || '') }}
          >
            <div className="status-dot"></div>
            <span>{getStatusText(boothStatus?.connection_status || '')}</span>
          </div>
        </div>

        {boothStatus?.connection_status === 'user_connected' ? (
          <div className="connected-state">
            <div className="connected-icon">✅</div>
            <h2>Scanner Connected</h2>
            <p>EEG session is ready to begin</p>
            <div className="session-info">
              <p>Connected at: {new Date(boothStatus.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          <div className="qr-section">
            <div className="privacy-notice">
              <div className="privacy-icon">🔒</div>
              <div className="privacy-content">
                <h3>Privacy Protected</h3>
                <p>Your brain data is processed securely and only anonymized patterns are stored.</p>
              </div>
            </div>

            <div className="qr-container">
              <h2>EEG Station QR Code</h2>
              {qrCodeDataUrl ? (
                <div className="qr-display">
                  <img src={qrCodeDataUrl} alt="Booth QR Code" className="qr-code" />
                  <div className="qr-instructions">
                    <p>Scan this QR code with the EEG Scanner app to connect</p>
                    <p className="qr-subtitle">The QR code contains your booth connection details</p>
                  </div>
                </div>
              ) : (
                <div className="qr-loading">
                  <p>Generating QR Code...</p>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="booth-footer">
          <div className="connection-details">
            <p>Status: {boothStatus?.is_connected ? 'Connected to Relayer' : 'Disconnected'}</p>
            <p>Last Update: {boothStatus ? new Date(boothStatus.timestamp).toLocaleTimeString() : 'Never'}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
