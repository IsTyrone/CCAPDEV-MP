document.addEventListener('DOMContentLoaded', () => {

    // --- Country Codes Data ---
    /**
     * Array of country objects used to populate the phone number dropdown.
     * Each object contains a 'code' (e.g., "+63") and a 'name' (e.g., "Philippines").
     * @type {Array<{code: string, name: string}>}
     */
    const countryCodes = [
        { code: "+63", name: "Philippines" },
    ];

    const countrySelect = document.getElementById('countryCode');
    if (countrySelect) {
        countryCodes.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = `${country.name} (${country.code})`;
            countrySelect.appendChild(option);
        });
    }

    // --- Register Page Logic ---
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        /**
         * Handles the submission of the registration form.
         * Validates passwords and sends registration data to the server API.
         * @param {Event} e - The submit event.
         */
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Gather inputs
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const middleName = document.getElementById('middleName')?.value || '';
            const username = document.getElementById('username')?.value || '';
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, middleName, username, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Registration Successful!');
                    window.location.href = '../index.html';
                } else {
                    alert(data.error || 'Registration failed. Please try again.');
                }
            } catch (err) {
                console.error('Registration error:', err);
                alert('An error occurred during registration. Please try again.');
            }
        });
    }

});
