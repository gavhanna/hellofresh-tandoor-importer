import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
  },

  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen3-vl:4b',
  },

  tandoor: {
    url: process.env.TANDOOR_URL,
    apiToken: process.env.TANDOOR_API_TOKEN,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
};

// Validate required environment variables
const requiredEnvVars = ['TANDOOR_URL', 'TANDOOR_API_TOKEN'];

export function validateConfig() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Please copy .env.example to .env and fill in the values');
  }

  // Check if at least one AI provider is configured
  const hasMistral = !!process.env.MISTRAL_API_KEY;
  const hasOllama = !!process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL === ''; // Ollama can use default

  if (!hasMistral && !hasOllama) {
    console.warn('⚠️  Warning: No AI provider configured. Please set either MISTRAL_API_KEY or configure Ollama.');
  }

  return missing.length === 0 && (hasMistral || hasOllama);
}
