import { z } from 'zod';

// Schema for ingredient
export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  unit: z.string().optional(),
});

// Schema for instruction step
export const instructionSchema = z.object({
  step: z.number(),
  text: z.string(),
});

// Schema for nutrition info
export const nutritionSchema = z.object({
  calories: z.number().optional(),
  protein: z.string().optional(),
  carbohydrates: z.string().optional(),
  fat: z.string().optional(),
  saturatedFat: z.string().optional(),
  sugar: z.string().optional(),
  fiber: z.string().optional(),
  sodium: z.string().optional(),
});

// Main recipe schema
export const recipeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  servings: z.number(),
  prepTime: z.number().optional(),
  cookTime: z.number().optional(),
  totalTime: z.number().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(instructionSchema),
  nutrition: nutritionSchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Schema for upload request
export const uploadRequestSchema = z.object({
  frontImage: z.any(),
  backImage: z.any(),
});

// Schema for import request
export const importRequestSchema = z.object({
  sessionId: z.string().uuid(),
  recipeData: recipeSchema,
});
