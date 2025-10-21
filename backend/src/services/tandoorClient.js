import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Tandoor API Client
 */
class TandoorClient {
  constructor() {
    this.baseURL = config.tandoor.url;
    this.apiToken = config.tandoor.apiToken;

    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Test connection to Tandoor
   */
  async testConnection() {
    try {
      const response = await this.client.get('/recipe/');
      logger.success('Tandoor connection successful');
      return true;
    } catch (error) {
      logger.error('Tandoor connection failed:', error.message);
      throw new Error(`Cannot connect to Tandoor: ${error.message}`);
    }
  }

  /**
   * Create a new recipe in Tandoor
   */
  async createRecipe(recipeData) {
    try {
      logger.info(`Creating recipe in Tandoor: ${recipeData.title}`);

      // Transform our recipe data to Tandoor's format
      const tandoorRecipe = this.transformToTandoorFormat(recipeData);

      const response = await this.client.post('/recipe/', tandoorRecipe);

      logger.success(`Recipe created in Tandoor with ID: ${response.data.id}`);

      return {
        id: response.data.id,
        url: `${this.baseURL}/view/recipe/${response.data.id}`,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to create recipe in Tandoor:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Invalid Tandoor API token. Please check your configuration.');
      }

      throw new Error(`Failed to create recipe: ${error.message}`);
    }
  }

  /**
   * Transform our recipe format to Tandoor's expected format
   */
  transformToTandoorFormat(recipeData) {
    const tandoorRecipe = {
      name: recipeData.title,
      description: recipeData.description || '',
      servings: recipeData.servings,
      working_time: recipeData.prepTime || 0,
      waiting_time: recipeData.cookTime || 0,
      steps: recipeData.instructions.map((instruction) => ({
        instruction: instruction.text,
        order: instruction.step,
      })),
    };

    // Add keywords/tags
    if (recipeData.tags && recipeData.tags.length > 0) {
      tandoorRecipe.keywords = recipeData.tags.map((tag) => ({ name: tag }));
    }

    // Add nutrition data if available
    if (recipeData.nutrition) {
      // Note: Tandoor's nutrition format may differ
      // This is a basic implementation that may need adjustment
      tandoorRecipe.nutrition = {
        calories: recipeData.nutrition.calories,
        // Add other nutrition fields as supported by Tandoor
      };
    }

    return tandoorRecipe;
  }

  /**
   * Upload image to a recipe
   * Note: This may require a different endpoint or approach
   */
  async uploadRecipeImage(recipeId, imagePath) {
    try {
      logger.info(`Uploading image for recipe ${recipeId}`);

      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));

      const response = await axios.post(
        `${this.baseURL}/api/recipe/${recipeId}/image/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      logger.success(`Image uploaded for recipe ${recipeId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to upload image:', error.message);
      // Don't throw - image upload is optional
      return null;
    }
  }
}

export const tandoorClient = new TandoorClient();
