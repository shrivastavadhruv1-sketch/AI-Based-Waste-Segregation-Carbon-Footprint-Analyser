// assets/js/guard.js

// This file immediately checks for authentication state
// and redirects unauthenticated users to the login page.
// Include this at the TOP of protected pages.

function getAuthToken() {
    return localStorage.getItem('token');
}

function getUserInfo() {
    return {
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        userName: localStorage.getItem('userName'),
        userOrg: localStorage.getItem('userOrg')
    };
}

// Redirect if strictly not logged in (and not already on login/register pages)
const currentPath = window.location.pathname;
const isAuthPage = currentPath.endsWith('login.html') || currentPath.endsWith('register.html');

if (!getAuthToken() && !isAuthPage) {
    window.location.href = 'login.html';
} else if (getAuthToken() && isAuthPage) {
    // If logged in and trying to access login/register, redirect to dashboard
    const role = localStorage.getItem('role');
    if (role === 'org_admin' || role === 'super_admin') {
        window.location.href = 'admin.html'; // Assuming admin.html exists or will exist
    } else {
        window.location.href = 'dashboard.html';
    }
}

function requireAdmin() {
    const info = getUserInfo();
    if (info.role !== 'org_admin' && info.role !== 'super_admin') {
        window.location.href = 'dashboard.html';
    }
}

// UI Initialization - Setup top right user info in navbar
document.addEventListener('DOMContentLoaded', () => {
    setupUserNavbarParams();
});

function setupUserNavbarParams() {
    // If we're on an auth page, don't try to setup user navbar info
    if (isAuthPage || !getAuthToken()) return;

    const navActions = document.querySelector('.nav-actions');
    const tryBtn = document.getElementById('nav-try-btn');

    // Hide 'Try Now' button if logged in
    if (tryBtn) {
        tryBtn.style.display = 'none';
    }

    if (navActions) {
        const info = getUserInfo();

        // Remove existing user info to avoid duplicates
        const existingUserInfo = document.getElementById('user-navbar-info');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }

        const userInfoDiv = document.createElement('div');
        userInfoDiv.id = 'user-navbar-info';
        userInfoDiv.className = 'user-navbar-info';

        userInfoDiv.innerHTML = `
            <div class="user-greeting">
                <span class="user-name">Hi, ${info.userName || 'User'}</span>
                <span class="user-org">${info.userOrg || ''}</span>
            </div>
            <button id="logout-btn" class="btn btn-secondary btn-sm">Logout</button>
        `;

        // Insert before mobile menu button
        const mobileBtn = document.getElementById('mobile-menu-btn');
        if (mobileBtn) {
            navActions.insertBefore(userInfoDiv, mobileBtn);
        } else {
            navActions.appendChild(userInfoDiv);
        }

        // Logic to logout
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}
