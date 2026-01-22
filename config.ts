// API Configuration
// Uses production URL when deployed, localhost for development
export const API_URL = import.meta.env.PROD
  ? 'https://gregarious-youthfulness-production.up.railway.app'
  : 'http://localhost:3001';
