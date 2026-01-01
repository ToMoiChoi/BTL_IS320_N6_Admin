// API Configuration
// Change this URL to point to your backend server
// For production: set REACT_APP_API_URL in .env file and rebuild

// eslint-disable-next-line no-undef
const envApiUrl = typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL;
const envProvincesApi = typeof process !== 'undefined' && process.env && process.env.REACT_APP_PROVINCES_API;
const envVietqrApi = typeof process !== 'undefined' && process.env && process.env.REACT_APP_VIETQR_API;

export const API_URL = envApiUrl || "http://127.0.0.1:8000";

export const PROVINCES_API = envProvincesApi || "https://provinces.open-api.vn/api/v2";
export const VIETQR_API = envVietqrApi || "https://api.vietqr.io/v2/banks";