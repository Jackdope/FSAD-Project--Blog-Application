// Signup Page Script
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    form.addEventListener('submit', handleSignup);
});

async function handleSignup(e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!username) {
        showError('username', 'Username is required');
        return;
    }

    if (username.length < 3) {
        showError('username', 'Username must be at least 3 characters');
        return;
    }

    if (!email) {
        showError('email', 'Email is required');
        return;
    }

    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email');
        return;
    }

    if (!password) {
        showError('password', 'Password is required');
        return;
    }

    if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        return;
    }

    try {
        const response = await api.register({
            username,
            email,
            password,
            confirmPassword
        });

        showMessage('success', response.message || 'Registration successful! Please check your email to verify your account.');
        document.getElementById('signupForm').reset();
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('error', error.message || 'An error occurred. Please try again.');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
