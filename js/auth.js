document.addEventListener('DOMContentLoaded', () => {

    // --- Login Page Logic ---
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        /**
         * Handles the login form submission.
         * Verifies the email and password against the stored 'registeredUsers' in localStorage.
         * If successful, sets the 'currentUser' and redirects to the dashboard.
         * @param {Event} e - The submit event.
         */
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.querySelector('input[type="email"]').value;
            const password = document.querySelector('input[type="password"]').value;

            // Retrieve registered users
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

            // Find matching user
            const user = registeredUsers.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                alert('Login Successful!');
                window.location.href = '../index.html';
            } else {
                alert('Invalid email or password. Please try again or register.');
            }
        });
    }

    // --- Forgot Password Logic ---
    const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');
    if (forgotPasswordForm) {
        /**
         * Handles the forgot password form submission.
         * Finds the user by email and updates their password in localStorage.
         * @param {Event} e - The submit event.
         */
        forgotPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('resetEmail').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmNewPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Retrieve registered users
            let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

            // Find user index
            const userIndex = registeredUsers.findIndex(u => u.email === email);

            if (userIndex === -1) {
                alert('Email not found.');
                return;
            }

            // Update password
            registeredUsers[userIndex].password = newPassword;

            // Save back to localStorage
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

            alert('Password reset successful! Please log in with your new password.');
            window.location.href = 'login.html';
        });
    }

});
