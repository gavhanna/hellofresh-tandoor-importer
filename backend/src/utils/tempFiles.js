import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(filePaths) {
  if (!filePaths || filePaths.length === 0) return;

  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];

  for (const filePath of paths) {
    try {
      await fs.unlink(filePath);
      logger.debug(`Deleted temp file: ${filePath}`);
    } catch (error) {
      logger.warn(`Failed to delete temp file ${filePath}:`, error.message);
    }
  }
}

/**
 * Clean up old upload files (older than 1 hour)
 */
export async function cleanupOldUploads(uploadDir, maxAgeMs = 3600000) {
  try {
    const files = await fs.readdir(uploadDir);
    const now = Date.now();

    for (const file of files) {
      if (file === '.gitkeep') continue;

      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath);
        logger.debug(`Deleted old upload file: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error cleaning up old uploads:', error);
  }
}
