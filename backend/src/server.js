import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { cleanupOldUploads } from './utils/tempFiles.js';
import { logger } from './utils/logger.js';

// Routes
import healthRouter from './routes/health.js';
import uploadRouter from './routes/upload.js';
import importRouter from './routes/import.js';

// Validate configuration
validateConfig();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/import', importRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Cleanup old uploads every hour
setInterval(() => {
  cleanupOldUploads(config.upload.uploadDir);
}, 3600000);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.success(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Tandoor URL: ${config.tandoor.url}`);
  logger.info(`📁 Upload directory: ${config.upload.uploadDir}`);

  if (config.nodeEnv === 'development') {
    logger.info(`\n📖 API Endpoints:`);
    logger.info(`   GET  http://localhost:${PORT}/api/health`);
    logger.info(`   GET  http://localhost:${PORT}/api/health/tandoor`);
    logger.info(`   POST http://localhost:${PORT}/api/upload`);
    logger.info(`   POST http://localhost:${PORT}/api/import`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
