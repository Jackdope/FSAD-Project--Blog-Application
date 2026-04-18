// Email Verification Page Script
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showVerificationError('No verification token provided');
        return;
    }

    try {
        const response = await api.verifyEmail(token);
        showVerificationSuccess();
    } catch (error) {
        console.error('Verification error:', error);
        showVerificationError(error.message || 'An error occurred during email verification');
    }
});

function showVerificationSuccess() {
    const container = document.getElementById('verification-result');
    container.innerHTML = `
        <div class="verification-success">
            <h2>✓ Email Verified Successfully</h2>
            <p>Your email has been verified and your account is now active.</p>
            <p>You can now login with your credentials.</p>
            <a href="login.html">Go to Login</a>
        </div>
    `;
}

function showVerificationError(message) {
    const container = document.getElementById('verification-result');
    container.innerHTML = `
        <div class="verification-error">
            <h2>✗ Verification Failed</h2>
            <p>${escapeHtml(message)}</p>
            <p>Please try registering again with a new email.</p>
            <a href="signup.html">Go to Signup</a>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
