
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config, isDevelopment } from './config/env.config';
import logger, { morganStream } from './utils/logger';
import { sequelize } from './models';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import userRoutes from './routes/user.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: morganStream }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server start
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models (in development)
    if (isDevelopment) {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }

    // Start server
    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
});

startServer();

export default app;
