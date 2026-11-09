import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import { seedDatabase } from './utils/mockDataPopulator.js';
import { startPriceSimulator } from './services/priceSimulator.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date(), connections: io.engine.clientsCount })
);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

// Start server after DB connects
connectDB().then(async () => {
  await seedDatabase();
  // Start real-time price simulator AFTER DB is ready
  startPriceSimulator(io, 10000); // Update every 10 seconds
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`⚡ WebSocket server ready`);
  });
}).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
