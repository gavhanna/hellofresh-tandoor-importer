import axios from 'axios';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { imageToBase64 } from './imageProcessor.js';

const OLLAMA_API_URL = config.ollama.baseUrl || 'http://localhost:11434';
const MODEL = config.ollama.model || 'qwen3-vl:4b';

/**
 * Extract recipe data from images using Ollama
 */
export async function extractRecipeData(frontImagePath, backImagePath) {
  try {
    logger.info('Extracting recipe data with Ollama...');

    // Convert images to base64
    const frontImageBase64 = await imageToBase64(frontImagePath);
    const backImageBase64 = await imageToBase64(backImagePath);

    const prompt = `Analyze these HelloFresh recipe card images (front and back) and extract ALL recipe information into structured JSON.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "title": "Recipe name",
  "description": "Brief description if available",
  "servings": 2,
  "prepTime": 10,
  "cookTime": 25,
  "totalTime": 35,
  "difficulty": "easy",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "2",
      "unit": "cloves"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "text": "Full instruction text"
    }
  ],
  "nutrition": {
    "calories": 680,
    "protein": "45g",
    "carbohydrates": "52g",
    "fat": "28g",
    "saturatedFat": "12g",
    "sugar": "8g",
    "fiber": "4g",
    "sodium": "850mg"
  },
  "tags": ["tag1", "tag2"]
}

IMPORTANT:
- Extract ALL visible information from both cards
- Be precise with measurements and quantities
- For ingredients: "amount" should be ONLY the number (e.g., "2", "1/2"), "unit" should be ONLY the unit (e.g., "cloves", "tsp", "pack")
- Do NOT duplicate the unit in both amount and unit fields
- Maintain the exact JSON structure above
- Use "easy", "medium", or "hard" for difficulty
- Return ONLY the JSON object, nothing else`;

    const response = await axios.post(
      `${OLLAMA_API_URL}/api/chat`,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [frontImageBase64, backImageBase64],
          },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 2000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.message.content;
    logger.debug('Ollama response:', content);

    // Parse JSON response
    const recipeData = parseRecipeJSON(content);
    logger.success('Recipe data extracted successfully');

    return recipeData;
  } catch (error) {
    logger.error('Ollama API error:', error.response?.data || error.message);

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Ollama. Make sure Ollama is running and the URL is correct.');
    }

    if (error.response?.status === 404) {
      throw new Error(`Model "${MODEL}" not found. Make sure you have pulled this model in Ollama.`);
    }

    throw new Error(`Failed to extract recipe data: ${error.message}`);
  }
}

/**
 * Parse JSON from Ollama response (handles markdown code blocks)
 */
function parseRecipeJSON(content) {
  try {
    // Remove markdown code blocks if present
    let jsonString = content.trim();

    // Remove ```json and ``` if present
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    logger.error('Failed to parse JSON:', content);
    throw new Error('Failed to parse recipe data from AI response');
  }
}
