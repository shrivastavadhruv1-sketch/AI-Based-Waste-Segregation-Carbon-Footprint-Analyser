// assets/js/api.js

const API_BASE = 'http://localhost:5000/api';

/**
 * Make an API call to the backend server, automatically attaching the JWT token
 * @param {string} endpoint - API endpoint (e.g. '/auth/login')
 * @param {string} method - HTTP method ('GET', 'POST', etc.)
 * @param {object} body - Request body object (optional)
 * @returns {Promise<any>} Response JSON data
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

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);

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
        console.error(`API config Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}
