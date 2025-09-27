# EEG Booth Integration Guide

This system integrates real-time EEG data streaming from OpenBCI hardware into the booth system. When a scanner connects to a booth, the EEG hardware automatically starts and streams brain data to the frontend for visualization.

## Architecture Overview

```
Scanner App ←→ Relayer Server ←→ Booth Backend ←→ OpenBCI Hardware
                                      ↓
                               EEG WebSocket Server (port 8765)
                                      ↓  
                               Booth Frontend (displays EEG data)
```

## Components

### 1. Booth Backend (`booth-backend/booth_server.py`)
- **Flask Server** (port 3004): Serves booth status and info to frontend
- **Relayer WebSocket Client**: Connects to relayer server for scanner communication
- **EEG WebSocket Server** (port 8765): Streams real-time EEG data to frontend
- **OpenBCI Hardware Interface**: Connects to `/dev/cu.usbserial-DM01MV82`
- **Scientific EEG Processor**: Analyzes brain signals for emotion detection

### 2. Booth Frontend (`booth-frontend/`)
- **React App** (port 3003): Main booth interface
- **QR Code Display**: Shows connection QR for scanner app
- **EEG Visualization Component**: Real-time brain wave display (8 channels)
- **WebSocket Client**: Connects to booth backend's EEG server

### 3. EEG Processor (`booth-backend/eeg_processor.py`)
- **Scientific Analysis**: Based on peer-reviewed neuroscience research
- **Frontal Alpha Asymmetry**: Measures approach motivation
- **Arousal Detection**: Beta/gamma frequency analysis  
- **P300 Component**: Attention and emotional significance

## EEG Data Flow

1. **Scanner Connection**: Scanner app connects to booth via relayer
2. **Hardware Activation**: Booth backend automatically connects to OpenBCI
3. **Data Streaming**: Real EEG data streams at 250Hz (8 channels)
4. **Frontend Display**: Live visualization of brain waves (like attached image)
5. **Analysis Ready**: Scientific processing available for emotion detection

## Starting the System

### 1. Start Relayer Server
```bash
cd relayer-server
python3 server.py
```

### 2. Start Booth with EEG
```bash
./start-eeg.sh
```

This single script now:
- Installs Python dependencies (websockets, numpy, scipy, pyserial)
- Starts the integrated booth server with EEG capabilities
- Makes EEG WebSocket available at `ws://localhost:8765`
- Connects to OpenBCI hardware when user connects

### 3. Start Frontend
```bash
cd booth-frontend
npm install
npm start
```

Frontend will be available at `http://localhost:3003`

## EEG Hardware Requirements

- **OpenBCI Cyton Board**: 8-channel EEG acquisition
- **USB Connection**: `/dev/cu.usbserial-DM01MV82` (update path as needed)
- **Electrodes**: Standard 10-20 placement recommended
- **Sampling Rate**: 250 Hz
- **Data Format**: 24-bit resolution, ±187.5mV range

## Frontend EEG Display Features

- **8 Channel Display**: Real-time waveforms with individual colors
- **Time Window**: 5-second scrolling display  
- **Amplitude Scaling**: Auto-scaling with manual override
- **Channel Info**: Voltage ranges, RMS values, rail detection
- **Status Indicators**: Streaming status, packet count, timestamps

## Scientific Analysis Capabilities

The system includes research-grade EEG analysis:

- **Frontal Alpha Asymmetry (FAA)**: Measures left vs right frontal activation
- **Arousal Index**: Beta (13-30Hz) + Gamma (30-45Hz) power
- **P300 Detection**: Event-related potential for attention/significance
- **Multi-component Love Score**: Weighted combination of neural markers

## Connection Sequence

1. User scans QR code with scanner app
2. Scanner connects to relayer server
3. Relayer notifies booth of connection
4. Booth backend starts OpenBCI hardware
5. EEG data begins streaming to frontend
6. Frontend displays real-time brain waves
7. Scientific analysis available on demand

## Configuration

### OpenBCI Port
Update in `booth_server.py`:
```python
self.openbci_port = "/dev/cu.usbserial-DM01MV82"  # Your device path
```

### EEG WebSocket Port
Change in `booth_server.py`:
```python
self.eeg_server_port = 8765  # WebSocket port for EEG data
```

### Frontend Connection
Update in `App.tsx`:
```javascript
const ws = new WebSocket('ws://localhost:8765');  // Connect to booth backend
```

## Troubleshooting

### OpenBCI Connection Issues
- Check USB connection and device path
- Verify OpenBCI board is powered on
- Blue and red LEDs should be on when connected
- Install pyserial: `pip3 install pyserial`

### WebSocket Connection Issues  
- Ensure booth backend is running on port 8765
- Check frontend connects after scanner connection established
- Verify no firewall blocking local connections

### No EEG Data Display
- Check OpenBCI hardware initialization in logs
- Verify 8 channels configured correctly
- Ensure proper electrode contact (check impedance)
- Look for "REAL DATA" log messages with μV values

### Analysis Not Available
- Install required dependencies: `pip3 install numpy scipy`
- Check EEG_AVAILABLE flag in logs
- Verify eeg_processor.py is in same directory

## Data Format

EEG WebSocket messages:
```json
{
  "type": "eeg",
  "timestamp": 1640995200.123,
  "packet_num": 1250,
  "channels": [12.34, -5.67, 8.91, ...],  // 8 channels in μV
  "status": "streaming"
}
```

Analysis requests/responses support scientific processing of collected EEG segments for emotion detection research.

## Security Notes

- EEG data stays local (not sent to relayer)
- Only booth status communicated externally  
- All brain data processed on-device
- No personal EEG data stored permanently