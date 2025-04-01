document.addEventListener('DOMContentLoaded', function () {
    const signUpForm = document.getElementById('signup-form');

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    const systemMessage = document.getElementById('system-message');
    const systemMessageIcon = document.getElementById('system-message-icon');
    const systemMessageTitle = document.getElementById('system-message-title');
    const systemMessageText = document.getElementById('system-message-content');

    const togglePasswordVisibility = document.getElementById('toggle-password1');
    const toggleConfirmPasswordVisibility = document.getElementById('toggle-password2');

    const togglePasswordIcon = document.getElementById('toggle-password-icon1');
    const toggleConfirmPasswordIcon = document.getElementById('toggle-password-icon2');

    function togglePasswordVisibilityFunction() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordIcon.classList.remove('fa-eye-slash');
            togglePasswordIcon.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            togglePasswordIcon.classList.remove('fa-eye');
            togglePasswordIcon.classList.add('fa-eye-slash');
        }
    }

    function toggleConfirmPasswordVisibilityFunction() {
        if (confirmPasswordInput.type === 'password') {
            confirmPasswordInput.type = 'text';
            toggleConfirmPasswordIcon.classList.remove('fa-eye-slash');
            toggleConfirmPasswordIcon.classList.add('fa-eye');
        }
        else {
            confirmPasswordInput.type = 'password';
            toggleConfirmPasswordIcon.classList.remove('fa-eye');
            toggleConfirmPasswordIcon.classList.add('fa-eye-slash');
        }
    }

    togglePasswordVisibility.addEventListener('click', togglePasswordVisibilityFunction);
    toggleConfirmPasswordVisibility.addEventListener('click', toggleConfirmPasswordVisibilityFunction);

    let errorFields = [false, false, false, false];

    confirmPasswordInput.addEventListener('input', function () {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        if (password != confirmPassword) {
            passwordError.textContent = 'Passwords do not match';
            confirmPasswordError.textContent = 'Passwords do not match';
            errorFields[0] = true
        }
        else if (password.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters long';
            confirmPasswordError.textContent = '';
            errorFields[0] = true;
        }
        else {
            passwordError.textContent = '';
            confirmPasswordError.textContent = '';
            errorFields[0] = false;
        }
    });

    usernameInput.addEventListener('input', validateUsername);

    function validateUsername() {
        const username = usernameInput.value.trim();

        if (username.length < 3) {
            usernameError.textContent = 'Username must be at least 3 characters long';
            errorFields[1] = true;
        }
        else if (username.includes(' ')) {
            usernameError.textContent = 'Username cannot contain spaces';
            errorFields[1] = true;
        }
        else {
            usernameError.textContent = '';
            errorFields[1] = false;
        }
    }

    emailInput.addEventListener('input', validateEmail);

    function validateEmail() {
        const email = emailInput.value.trim();
        if (!email.includes('@')) {
            emailError.textContent = 'Invalid email address';
            errorFields[2] = true;
        }
        else {
            emailError.textContent = '';
            errorFields[2] = false;
        }
    }

    phoneInput.addEventListener('input', validatePhone);

    passwordInput.addEventListener('input', validatePassword);

    function validatePassword() {
        const password = passwordInput.value.trim();
        if (password.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters long';
            errorFields[3] = true;
        }
        else {
            passwordError.textContent = '';
            errorFields[3] = false;
        }
    }

    function validatePhone() {
        const phone = phoneInput.value.trim();
        if (phone.length < 10) {
            phoneError.textContent = 'Invalid phone number';
            errorFields[3] = true;
        }
        else {
            phoneError.textContent = '';
            errorFields[3] = false;
        }
    }

    function showSystemMessage(message, type) {
        if (type == 'error') {
            systemMessage.style.display = 'flex';
            systemMessage.style.backgroundColor = 'var(--error-color-light)';
            systemMessageIcon.classList.remove('fa-circle-exclamation');
            systemMessageIcon.style.color = 'var(--error-color)';
            systemMessageIcon.classList.add('fa-circle-exclamation');
            systemMessageTitle.innerText = 'Error';
            systemMessageTitle.style.color = 'var(--error-color)';
            systemMessageText.innerText = message;
        }
        else {
            systemMessage.style.display = 'flex';
            systemMessage.style.backgroundColor = 'var(--success-color-light)';
            systemMessageIcon.classList.remove('fa-circle-check');
            systemMessageIcon.style.color = 'var(--success-color)';
            systemMessageIcon.classList.add('fa-circle-check');
            systemMessageTitle.innerText = 'Success';
            systemMessageTitle.style.color = 'var(--success-color)';
            systemMessageText.innerText = message;
        }
    }

    signUpForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(signUpForm);

        console.log(errorFields);
        if (errorFields.includes(true)) {
            showSystemMessage('Please fill in all fields correctly', 'error');
        } else {
            fetch('php/create-user.php', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success == true) {
                        showSystemMessage('User created successfully', 'success');
                    }
                    else {
                        showSystemMessage(data.message, 'error');
                    }
                }).catch(error => {
                    console.log(error);
                });
        }
    });

});