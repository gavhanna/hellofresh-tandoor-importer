import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../middleware/upload.js';
import { processImage } from '../services/imageProcessor.js';
import { extractRecipeData } from '../services/mistralService.js';
import { cleanupTempFiles } from '../utils/tempFiles.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Store sessions temporarily (in production, use Redis or similar)
const sessions = new Map();

/**
 * POST /api/upload
 * Upload recipe card images and extract data
 */
router.post('/', upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
]), async (req, res, next) => {
  const tempFiles = [];

  try {
    // Validate files
    if (!req.files?.frontImage || !req.files?.backImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing images',
        message: 'Both frontImage and backImage are required',
      });
    }

    const frontImage = req.files.frontImage[0];
    const backImage = req.files.backImage[0];

    logger.info(`Processing upload: front=${frontImage.filename}, back=${backImage.filename}`);

    tempFiles.push(frontImage.path, backImage.path);

    // Process images
    const frontProcessed = await processImage(frontImage.path);
    const backProcessed = await processImage(backImage.path);

    tempFiles.push(frontProcessed, backProcessed);

    // Extract recipe data using Mistral
    const recipeData = await extractRecipeData(frontProcessed, backProcessed);

    // Create session
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      recipeData,
      images: {
        front: frontImage.path,
        back: backImage.path,
        frontProcessed,
        backProcessed,
      },
      createdAt: Date.now(),
    });

    // Clean up old sessions (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, session] of sessions.entries()) {
      if (session.createdAt < oneHourAgo) {
        sessions.delete(id);
      }
    }

    logger.success(`Recipe data extracted, session created: ${sessionId}`);

    res.json({
      success: true,
      data: recipeData,
      sessionId,
      message: 'Recipe data extracted successfully',
    });

    // Note: We keep the files for the import step
  } catch (error) {
    logger.error('Upload error:', error);

    // Cleanup on error
    await cleanupTempFiles(tempFiles);

    next(error);
  }
});

/**
 * GET /api/upload/session/:sessionId
 * Get session data
 */
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      message: 'Session expired or does not exist',
    });
  }

  res.json({
    success: true,
    data: session.recipeData,
    sessionId,
  });
});

export { sessions };
export default router;
