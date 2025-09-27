# Mock Scanner Frontend - User Guide

A React-based scanner application for connecting to EEG booth stations via QR code scanning and WebSocket relayer.

## 🚀 Quick Start

### Start the Scanner
```bash
cd mock-scanner-frontend
PORT=3001 HOST=0.0.0.0 npm start
```

Access at: **http://localhost:3001**

## 📱 How to Use

1. **Scan QR Code**: Click "Scan QR Code with Camera" and point at booth's QR code
2. **Manual Entry**: Click "Enter Booth ID Manually" and type booth ID
3. **Connect**: Scanner automatically connects to booth via relayer
4. **Communicate**: Send messages and monitor real-time communication log

## 🔗 Connection Flow

Scanner → QR Code → Relayer Server (172.24.244.146:8765) → Booth Backend → Booth Frontend

**Note**: This scanner is configured to connect to the relayer server at **172.24.244.146:8765**

## 📊 Features

- Real-time QR code scanning
- Manual booth ID entry
- WebSocket communication
- Connection status monitoring  
- Message logging
- EEG session controls