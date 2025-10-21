import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
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
const requiredEnvVars = ['MISTRAL_API_KEY', 'TANDOOR_URL', 'TANDOOR_API_TOKEN'];

export function validateConfig() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Please copy .env.example to .env and fill in the values');
  }

  return missing.length === 0;
}
