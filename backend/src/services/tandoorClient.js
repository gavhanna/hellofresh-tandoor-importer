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
   * Search for recipes by title
   */
  async searchRecipes(query) {
    try {
      logger.info(`Searching Tandoor for recipes matching: ${query}`);

      const response = await this.client.get('/recipe/', {
        params: {
          query: query,
          page_size: 10, // Limit results
        },
      });

      logger.debug(`Found ${response.data.count} matching recipes`);

      return response.data.results || [];
    } catch (error) {
      logger.error('Failed to search recipes:', error.message);
      throw new Error(`Failed to search recipes: ${error.message}`);
    }
  }

  /**
   * Check if a recipe with similar title already exists
   */
  async checkDuplicate(title) {
    try {
      const results = await this.searchRecipes(title);

      // Check for exact or very similar matches
      const normalizedTitle = title.toLowerCase().trim();
      const duplicates = results.filter(recipe => {
        const recipeTitle = recipe.name.toLowerCase().trim();
        return recipeTitle === normalizedTitle ||
               recipeTitle.includes(normalizedTitle) ||
               normalizedTitle.includes(recipeTitle);
      });

      if (duplicates.length > 0) {
        logger.warn(`Found ${duplicates.length} potential duplicate(s) for "${title}"`);
        return {
          isDuplicate: true,
          matches: duplicates.map(r => ({
            id: r.id,
            name: r.name,
            url: `${this.baseURL}/view/recipe/${r.id}`,
          })),
        };
      }

      return { isDuplicate: false, matches: [] };
    } catch (error) {
      logger.error('Failed to check for duplicates:', error.message);
      // Don't fail the import if duplicate check fails, just warn
      return { isDuplicate: false, matches: [], error: error.message };
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
    // Convert ingredients to Tandoor format
    const tandoorIngredients = recipeData.ingredients.map((ing) => {
      const ingredient = {
        food: { name: ing.name },
        amount: 0,
      };

      // Try to parse amount - could be number, fraction, or string
      if (ing.amount) {
        const amountStr = ing.amount.toString().trim();
        // Handle fractions like "1/2"
        if (amountStr.includes('/')) {
          const parts = amountStr.split('/');
          ingredient.amount = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else {
          ingredient.amount = parseFloat(amountStr) || 0;
        }
      }

      // Add unit if present
      if (ing.unit) {
        ingredient.unit = { name: ing.unit };
      }

      return ingredient;
    });

    // Create steps - put all ingredients in the first step
    const steps = recipeData.instructions.map((instruction, index) => ({
      instruction: instruction.text,
      ingredients: index === 0 ? tandoorIngredients : [],
      order: instruction.step,
    }));

    const tandoorRecipe = {
      name: recipeData.title,
      description: recipeData.description || '',
      servings: recipeData.servings,
      working_time: recipeData.prepTime || 0,
      waiting_time: recipeData.cookTime || 0,
      steps: steps,
    };

    // Add keywords/tags
    if (recipeData.tags && recipeData.tags.length > 0) {
      tandoorRecipe.keywords = recipeData.tags.map((tag) => ({ name: tag }));
    }

    // Add nutrition data if available - Tandoor requires specific format
    if (recipeData.nutrition) {
      // Extract numeric values from strings like "45g"
      const parseNutrition = (value) => {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        // Extract number from string like "45g" or "45"
        const match = value.toString().match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      };

      tandoorRecipe.nutrition = {
        calories: recipeData.nutrition.calories || 0,
        carbohydrates: parseNutrition(recipeData.nutrition.carbohydrates),
        fats: parseNutrition(recipeData.nutrition.fat),
        proteins: parseNutrition(recipeData.nutrition.protein),
      };
    } else {
      // Tandoor requires these fields, provide defaults
      tandoorRecipe.nutrition = {
        calories: 0,
        carbohydrates: 0,
        fats: 0,
        proteins: 0,
      };
    }

    logger.debug('Transformed recipe for Tandoor:', JSON.stringify(tandoorRecipe, null, 2));

    return tandoorRecipe;
  }

  /**
   * Upload image to a recipe using PUT method
   */
  async uploadRecipeImage(recipeId, imagePath) {
    logger.info(`Uploading image for recipe ${recipeId}: ${imagePath}`);

    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      logger.error(`Image file not found: ${imagePath}`);
      throw new Error('Image file not found');
    }

    const fileStats = fs.statSync(imagePath);
    logger.debug(`Image file size: ${fileStats.size} bytes`);

    // Method 1: Try PUT with multipart form data (Tandoor's preferred method)
    try {
      logger.info(`Attempting PUT to /api/recipe/${recipeId}/image/`);

      const imageStream = fs.createReadStream(imagePath);
      const formData = new FormData();

      // Append image with proper mimetype
      formData.append('image', imageStream, {
        filename: 'recipe.jpg',
        contentType: 'image/jpeg',
        knownLength: fileStats.size,
      });

      // Get headers with proper boundary
      const formHeaders = formData.getHeaders();

      logger.debug('Form headers:', formHeaders);

      const response = await axios.put(
        `${this.baseURL}/api/recipe/${recipeId}/image/`,
        formData,
        {
          headers: {
            ...formHeaders,
            Authorization: `Bearer ${this.apiToken}`,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      logger.success(`Image uploaded for recipe ${recipeId}`);
      logger.debug('Upload response:', response.data);

      // Check if image is actually set
      if (response.data.image) {
        logger.success(`Image URL: ${response.data.image}`);
      } else {
        logger.warn('Image field is still null in response!');
      }

      return response.data;
    } catch (error) {
      logger.error('PUT to /api/recipe/{id}/image/ failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Method 2: Try PATCH to /api/recipe/{id}/ with multipart
      try {
        logger.info('Trying PATCH to /api/recipe/{id}/');

        const imageStream = fs.createReadStream(imagePath);
        const formData = new FormData();
        formData.append('image', imageStream, {
          filename: 'recipe.jpg',
          contentType: 'image/jpeg',
        });

        const response = await axios.patch(
          `${this.baseURL}/api/recipe/${recipeId}/`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${this.apiToken}`,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );

        logger.success(`Image uploaded via PATCH for recipe ${recipeId}`);
        logger.debug('Upload response:', response.data);
        return response.data;
      } catch (patchError) {
        logger.error('PATCH also failed:', {
          status: patchError.response?.status,
          statusText: patchError.response?.statusText,
          data: patchError.response?.data,
          message: patchError.message,
        });

        throw new Error(`All image upload methods failed. Last error: ${patchError.message}`);
      }
    }
  }
}

export const tandoorClient = new TandoorClient();
