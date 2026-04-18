// Auth Helper Functions
const auth = {
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },

    getUsername: () => {
        return localStorage.getItem('username');
    },

    setUsername: (username) => {
        localStorage.setItem('username', username);
    },

    setUserData: (token, username, email, userId) => {
        setAuthToken(token);
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        localStorage.setItem('userId', userId);
    },

    logout: () => {
        clearAuthToken();
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('userId');
    }
};

// Update navbar based on authentication status
function updateNavbar() {
    const userLinks = document.getElementById('nav-user-links');
    const authLinks = document.getElementById('nav-auth-links');
    const logoutLink = document.getElementById('nav-logout');

    // Only update if navbar elements exist on this page
    if (!userLinks || !authLinks || !logoutLink) {
        return;
    }

    if (auth.isAuthenticated()) {
        userLinks.style.display = 'block';
        authLinks.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        userLinks.style.display = 'none';
        authLinks.style.display = 'block';
        logoutLink.style.display = 'none';
    }
}

// Logout function
function logout() {
    auth.logout();
    window.location.href = 'index.html';
}

// Redirect to protect dashboard
function protectDashboard() {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Call updateNavbar on page load
document.addEventListener('DOMContentLoaded', updateNavbar);
