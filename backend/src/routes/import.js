import express from 'express';
import { tandoorClient } from '../services/tandoorClient.js';
import { cleanupTempFiles } from '../utils/tempFiles.js';
import { logger } from '../utils/logger.js';
import { sessions } from './upload.js';
import { recipeSchema } from '../models/recipe.schema.js';

const router = express.Router();

/**
 * POST /api/import/check-duplicate
 * Check if recipe already exists in Tandoor
 */
router.post('/check-duplicate', async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Missing title',
        message: 'title is required',
      });
    }

    logger.info(`Checking for duplicate recipe: ${title}`);

    const duplicateCheck = await tandoorClient.checkDuplicate(title);

    res.json({
      success: true,
      ...duplicateCheck,
    });
  } catch (error) {
    logger.error('Duplicate check error:', error);
    next(error);
  }
});

/**
 * POST /api/import
 * Import recipe to Tandoor
 */
router.post('/', async (req, res, next) => {
  try {
    const { sessionId, recipeData } = req.body;

    // Validate request
    if (!sessionId) {
      logger.error('Missing sessionId in request');
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
      logger.error('Recipe data validation failed:', error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid recipe data',
        details: error.errors,
      });
    }

    logger.info(`Importing recipe to Tandoor: ${dataToImport.title}`);

    // Create recipe in Tandoor
    const result = await tandoorClient.createRecipe(dataToImport);

    // Upload front card image as recipe image
    if (session.images.frontProcessed) {
      try {
        await tandoorClient.uploadRecipeImage(result.id, session.images.frontProcessed);
        logger.success(`Image uploaded for recipe ${result.id}`);
      } catch (error) {
        logger.warn(`Failed to upload image (non-fatal): ${error.message}`);
        // Don't fail the whole import if image upload fails
      }
    }

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
