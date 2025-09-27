import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { worldIdRoutes } from './routes/worldid.js';
// Removed deprecated OAuth auth routes - using SIWE wallet auth instead
import nonceRoutes from './routes/nonce.js';
import siweRoutes from './routes/siwe.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://worldapp.org'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'mofo-api',
    worldId: {
      configured: !!process.env.WLD_APP_ID,
      appId: process.env.WLD_APP_ID?.substring(0, 8) + '...'
    }
  });
});

// Routes
app.use('/api/worldid', worldIdRoutes);  // Incognito actions verification
app.use('/api/nonce', nonceRoutes);      // SIWE nonce generation
app.use('/api', siweRoutes);             // SIWE wallet authentication

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mofo API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 World ID App: ${process.env.WLD_APP_ID || 'NOT_CONFIGURED'}`);
});
