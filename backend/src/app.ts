import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/api';
import catalogRouter from './routes/catalogRoutes';

// Initialize configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Direct short catalog endpoints (/api/doctors, /api/medicines, /api/lab-tests)
app.use('/api', catalogRouter);

// Root direct short catalog endpoints (/doctors, /medicines, /lab-tests)
app.use('/', catalogRouter);

// Primary API Router mount
app.use('/api/v1', apiRouter);

// Fallback for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global Error Handler middleware
app.use(errorHandler);

// Listen to port
app.listen(PORT, () => {
  console.log(`[Server] MedCare+ backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
