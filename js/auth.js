document.addEventListener('DOMContentLoaded', () => {

    // --- Login Page Logic ---
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        /**
         * Handles the login form submission.
         * Sends credentials to the server API for authentication.
         * @param {Event} e - The submit event.
         */
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.querySelector('input[type="email"]').value;
            const password = document.querySelector('input[type="password"]').value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Login Successful!');
                    if (data.user && data.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                } else {
                    alert(data.error || 'Invalid email or password. Please try again or register.');
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('An error occurred during login. Please try again.');
            }
        });
    }

    // --- Forgot Password Logic ---
    const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');
    if (forgotPasswordForm) {
        /**
         * Handles the forgot password form submission.
         * Sends the new password to the server API.
         * @param {Event} e - The submit event.
         */
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('resetEmail').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmNewPassword) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, newPassword })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Password reset successful! Please log in with your new password.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Failed to reset password.');
                }
            } catch (err) {
                console.error('Forgot password error:', err);
                alert('An error occurred. Please try again.');
            }
        });
    }

});
