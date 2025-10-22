import axios from 'axios';

// In production (Docker), use relative URL so nginx proxies to backend
// In development, use VITE_API_URL or default to localhost:3001
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload recipe card images
 */
export async function uploadRecipeCards(frontImage, backImage) {
  const formData = new FormData();
  formData.append('frontImage', frontImage);
  formData.append('backImage', backImage);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Import recipe to Tandoor
 */
export async function importRecipe(sessionId, recipeData) {
  const response = await api.post('/import', {
    sessionId,
    recipeData,
  });

  return response.data;
}

/**
 * Get session data
 */
export async function getSession(sessionId) {
  const response = await api.get(`/upload/session/${sessionId}`);
  return response.data;
}

/**
 * Health check
 */
export async function healthCheck() {
  const response = await api.get('/health');
  return response.data;
}

/**
 * Check Tandoor connection
 */
export async function checkTandoor() {
  const response = await api.get('/health/tandoor');
  return response.data;
}

export default api;
