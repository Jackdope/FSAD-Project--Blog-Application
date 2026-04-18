// Login Page Script
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validation
    if (!username) {
        showError('username', 'Username is required');
        return;
    }

    if (!password) {
        showError('password', 'Password is required');
        return;
    }

    try {
        const response = await api.login({
            username,
            password
        });

        auth.setUserData(response.token, response.username, response.email, response.userId);
        showMessage('success', 'Login successful! Redirecting to dashboard...');
        
        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        showMessage('error', error.message || 'An error occurred. Please try again.');
    }
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-text');
    errors.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
}

function showMessage(type, message) {
    const messageElement = document.getElementById('form-message');
    messageElement.textContent = message;
    messageElement.className = `message show ${type}`;
}
