// API Configuration
// Change this URL to point to your backend server
// For production: set REACT_APP_API_URL in .env file and rebuild

// eslint-disable-next-line no-undef
const envApiUrl = typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL;

export const API_URL = envApiUrl || "http://127.0.0.1:8000";
