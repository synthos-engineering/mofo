import React, { useEffect, useRef, useState } from 'react';
import './EEGVisualization.css';

interface EEGChannel {
  id: number;
  name: string;
  color: string;
  data: number[];
  voltage: number;
  rmsValue: number;
  notRailed: boolean;
}

interface EEGData {
  type: string;
  timestamp: number;
  packet_num: number;
  channels: number[];
  status: string;
}

interface EEGVisualizationProps {
  websocket: WebSocket | null;
  isConnected: boolean;
}

const CHANNEL_COLORS = [
  '#8B8B8B', // Channel 1 - Gray
  '#9370DB', // Channel 2 - Purple  
  '#4169E1', // Channel 3 - Blue
  '#228B22', // Channel 4 - Green
  '#FFD700', // Channel 5 - Yellow
  '#FF6347', // Channel 6 - Orange/Red
  '#DC143C', // Channel 7 - Red
  '#8B4513'  // Channel 8 - Brown
];

const CHANNEL_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8'];

const EEGVisualization: React.FC<EEGVisualizationProps> = ({ websocket, isConnected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channels, setChannels] = useState<EEGChannel[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [packetCount, setPacketCount] = useState(0);
  const [timeWindow] = useState(5); // 5 seconds of data
  const [samplingRate] = useState(250); // 250 Hz
  const maxDataPoints = timeWindow * samplingRate; // 1250 points

  // Initialize channels
  useEffect(() => {
    const initialChannels: EEGChannel[] = CHANNEL_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      color: CHANNEL_COLORS[index],
      data: new Array(maxDataPoints).fill(0),
      voltage: 0,
      rmsValue: 0,
      notRailed: true
    }));
    setChannels(initialChannels);
  }, [maxDataPoints]);

  // WebSocket data handling
  useEffect(() => {
    if (!websocket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data: EEGData = JSON.parse(event.data);
        
        if (data.type === 'eeg' && data.channels && data.channels.length === 8) {
          setIsStreaming(true);
          setPacketCount(data.packet_num);
          
          setChannels(prevChannels => {
            return prevChannels.map((channel, index) => {
              const newValue = data.channels[index];
              const newData = [...channel.data.slice(1), newValue];
              
              // Calculate RMS over last 250 samples (1 second)
              const recentSamples = newData.slice(-250);
              const rms = Math.sqrt(recentSamples.reduce((sum, val) => sum + val * val, 0) / recentSamples.length);
              
              // Check if not railed (values varying and in reasonable range)
              const recentVariance = Math.max(...recentSamples) - Math.min(...recentSamples);
              const notRailed = recentVariance > 1 && Math.abs(newValue) < 200;
              
              return {
                ...channel,
                data: newData,
                voltage: newValue,
                rmsValue: rms,
                notRailed
              };
            });
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.addEventListener('message', handleMessage);
    return () => websocket.removeEventListener('message', handleMessage);
  }, [websocket]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || channels.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const channelHeight = height / 8;
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      
      // Horizontal lines (channel separators)
      for (let i = 0; i <= 8; i++) {
        const y = i * channelHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Vertical grid lines (time markers)
      const gridSpacing = width / 10;
      for (let i = 0; i <= 10; i++) {
        const x = i * gridSpacing;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Draw EEG traces
      channels.forEach((channel, channelIndex) => {
        const centerY = channelIndex * channelHeight + channelHeight / 2;
        const scale = channelHeight / 400; // Scale for μV range
        
        ctx.strokeStyle = channel.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        channel.data.forEach((value, dataIndex) => {
          const x = (dataIndex / channel.data.length) * width;
          const y = centerY - (value * scale);
          
          if (dataIndex === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
      });
    };

    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [channels]);

  return (
    <div className="eeg-visualization">
      <div className="eeg-header">
        <div className="eeg-title">
          <span className="eeg-icon">🧠</span>
          <h2>EEG Time Series Analysis</h2>
        </div>
        <div className="eeg-controls">
          <div className="time-scale">
            <label>Vert Scale</label>
            <select defaultValue="Auto">
              <option>Auto</option>
              <option>50μV</option>
              <option>100μV</option>
              <option>200μV</option>
            </select>
          </div>
          <div className="window-size">
            <label>Window</label>
            <select defaultValue="5 sec">
              <option>1 sec</option>
              <option>2 sec</option>
              <option>5 sec</option>
              <option>10 sec</option>
            </select>
          </div>
        </div>
      </div>

      <div className="eeg-content">
        <div className="channel-labels">
          <div className="channels-header">
            <span>Channels</span>
            <span className="hardware-settings">Hardware Settings</span>
          </div>
          {channels.map((channel) => (
            <div key={channel.id} className="channel-info">
              <div 
                className="channel-number"
                style={{ backgroundColor: channel.color }}
              >
                {channel.name}
              </div>
              <div className="channel-stats">
                <div className="voltage-range">
                  <div className="voltage-max">+{Math.max(...channel.data.slice(-250)).toFixed(0)}μV</div>
                  <div className="voltage-min">-{Math.abs(Math.min(...channel.data.slice(-250))).toFixed(0)}μV</div>
                </div>
                <div className="channel-status">
                  <span className={`rail-status ${channel.notRailed ? 'not-railed' : 'railed'}`}>
                    {channel.notRailed ? 'Not Railed' : 'Railed'}
                  </span>
                  <span className="rms-value">
                    {channel.rmsValue.toFixed(1)} μVrms
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="eeg-graph">
          <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            className="eeg-canvas"
          />
          <div className="time-axis">
            <div className="time-label">-5</div>
            <div className="time-label">-4</div>
            <div className="time-label">-3</div>
            <div className="time-label">-2</div>
            <div className="time-label">-1</div>
            <div className="time-label">0</div>
            <div className="time-scale-label">Time (s)</div>
          </div>
        </div>
      </div>

      <div className="eeg-footer">
        <div className="stream-status">
          <div className={`status-indicator ${isStreaming ? 'streaming' : 'stopped'}`}>
            <div className="status-dot"></div>
            <span>{isStreaming ? 'Streaming' : 'Not Streaming'}</span>
          </div>
          <div className="packet-count">
            Packets: {packetCount.toLocaleString()}
          </div>
        </div>
        <div className="timestamp">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default EEGVisualization;