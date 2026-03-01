// assets/js/auth.js

// Requires assets/js/api.js to be loaded first.

async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', 'POST', { email, password });
        return data;
    } catch (error) {
        throw error;
    }
}

async function register(name, email, password, organization) {
    try {
        const data = await apiCall('/auth/register', 'POST', { name, email, password, organization });
        return data;
    } catch (error) {
        throw error;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Event listener for global logout button if it exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
