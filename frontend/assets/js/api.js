// assets/js/api.js

const API_BASE = 'http://localhost:5000/api';

/** Timeout (ms) for every backend request — prevents infinite hangs */
const API_TIMEOUT_MS = 8000;

/**
 * Make an API call to the backend server, automatically attaching the JWT token.
 * Aborts after API_TIMEOUT_MS if the server doesn't respond.
 * @param {string} endpoint - API endpoint (e.g. '/auth/login')
 * @param {string} method   - HTTP method ('GET', 'POST', etc.)
 * @param {object} body     - Request body object (optional)
 * @returns {Promise<any>}  Response JSON data
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE}${endpoint}`;

    // Default headers
    const headers = {
        'Content-Type': 'application/json'
    };

    // Attach token if present
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // AbortController so we can cancel a hanging request after a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const config = {
        method,
        headers,
        signal: controller.signal
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // If unauthorized, clear local storage and redirect to login
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            const msg = `Request timed out after ${API_TIMEOUT_MS / 1000}s — backend not responding`;
            console.error(`API Timeout [${method} ${endpoint}]`);
            throw new Error(msg);
        }

        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}
