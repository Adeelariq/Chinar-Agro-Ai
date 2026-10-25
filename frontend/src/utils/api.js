/**
 * Centralized API Base Configuration
 * Defaults to http://127.0.0.1:8010 where the venv FastAPI backend runs.
 */
export const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8010';
export default API_BASE;
