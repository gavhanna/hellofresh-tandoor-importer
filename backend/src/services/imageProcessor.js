import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Process and optimize image for OCR
 */
export async function processImage(inputPath) {
  try {
    logger.debug(`Processing image: ${inputPath}`);

    const outputPath = inputPath.replace(path.extname(inputPath), '_processed.jpg');

    await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .normalize() // Enhance contrast
      .sharpen() // Sharpen for better OCR
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toFile(outputPath);

    logger.debug(`Processed image saved: ${outputPath}`);
    return outputPath;
  } catch (error) {
    logger.error('Image processing error:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Convert image to base64 for API transmission
 */
export async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    logger.error('Error converting image to base64:', error);
    throw new Error(`Failed to read image: ${error.message}`);
  }
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    };
  } catch (error) {
    logger.error('Error getting image metadata:', error);
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
}
