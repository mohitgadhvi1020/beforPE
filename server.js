import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { logger } from './src/utils/logger.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { swaggerUi, specs } from './src/config/swagger.js';

// Import routes
import authRoutes from './src/routes/auth.js';
import propertyRoutes from './src/routes/property.js';

const app = express();
const PORT = process.env.PORT || 6000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    docs: '/api-docs'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/property', propertyRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Only try to initialize PostgreSQL database if not using Firebase
    if (process.env.DB_TYPE !== 'firebase') {
      try {
        const { initDatabase } = await import('./src/utils/initDb.js');
        await initDatabase();
        logger.info('Database initialized successfully');
      } catch (dbError) {
        logger.warn('Database initialization failed, but continuing to start server:', dbError.message);
        logger.warn('Some features may not work without database connection');
      }
    } else {
      logger.info('Using Firebase - skipping PostgreSQL database initialization');
    }
    
    // Start server regardless of database status
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Database type: ${process.env.DB_TYPE || 'postgres'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app; 