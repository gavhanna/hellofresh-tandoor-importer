import express from 'express';
import { tandoorClient } from '../services/tandoorClient.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hellofresh-importer-backend',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Check Tandoor connection
 */
router.get('/tandoor', async (req, res, next) => {
  try {
    await tandoorClient.testConnection();
    res.json({
      status: 'ok',
      message: 'Tandoor connection successful',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
