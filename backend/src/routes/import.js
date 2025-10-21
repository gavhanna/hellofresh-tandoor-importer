import express from 'express';
import { tandoorClient } from '../services/tandoorClient.js';
import { cleanupTempFiles } from '../utils/tempFiles.js';
import { logger } from '../utils/logger.js';
import { sessions } from './upload.js';
import { recipeSchema } from '../models/recipe.schema.js';

const router = express.Router();

/**
 * POST /api/import
 * Import recipe to Tandoor
 */
router.post('/', async (req, res, next) => {
  try {
    const { sessionId, recipeData } = req.body;

    // Validate request
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
        message: 'sessionId is required',
      });
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: 'Session expired or does not exist',
      });
    }

    // Use provided recipe data or session data
    const dataToImport = recipeData || session.recipeData;

    // Validate recipe data
    try {
      recipeSchema.parse(dataToImport);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipe data',
        details: error.errors,
      });
    }

    logger.info(`Importing recipe to Tandoor: ${dataToImport.title}`);

    // Create recipe in Tandoor
    const result = await tandoorClient.createRecipe(dataToImport);

    // Optionally upload images
    // Note: This depends on Tandoor's image upload API
    // Uncomment if you want to try uploading the front image
    // if (session.images.front) {
    //   await tandoorClient.uploadRecipeImage(result.id, session.images.front);
    // }

    // Cleanup temp files
    const filesToClean = [
      session.images.front,
      session.images.back,
      session.images.frontProcessed,
      session.images.backProcessed,
    ].filter(Boolean);

    await cleanupTempFiles(filesToClean);

    // Remove session
    sessions.delete(sessionId);

    logger.success(`Recipe imported successfully: ${result.id}`);

    res.json({
      success: true,
      tandoorRecipeId: result.id,
      url: result.url,
      message: 'Recipe imported successfully',
    });
  } catch (error) {
    logger.error('Import error:', error);
    next(error);
  }
});

export default router;
