document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const formGroups = document.querySelectorAll('.form-group');

    formGroups.forEach((formGroup, index) => {
        setTimeout(() => {
            formGroup.classList.add('animate');
        }, 100 * index);
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    emailInput.addEventListener('input', function() {
        if (this.value && !validateEmail(this.value)) {
            showFieldError(this, 'Please enter a valid email address');
        } else {
            clearFieldError(this);
        }
    });

    passwordInput.addEventListener('input', function() {
        if (this.value && !validatePassword(this.value)) {
            showFieldError(this, 'Password must be at least 6 characters');
        } else {
            clearFieldError(this);
        }
    });

    function showFieldError(field, message) {
        clearFieldError(field); // Clear any existing error first
        
        field.style.borderColor = '#dc3545';
        field.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';
        
        // Create and append error message
        const errorSpan = document.createElement('span');
        errorSpan.className = 'field-error';
        errorSpan.textContent = message;
        errorSpan.style.color = '#dc3545';
        errorSpan.style.fontSize = '12px';
        errorSpan.style.display = 'block';
        errorSpan.style.marginTop = '5px';
        
        // Find the form-group parent and append the error after the input-group
        const formGroup = field.closest('.form-group');
        formGroup.appendChild(errorSpan);
    }

    function clearFieldError(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function showMessage(status, message, data) {
        if (status === 'success') {
            alert(message);
            window.location.href = 'dashboard.html';
        }
        if (status === 'error') {
            alert(message);
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('Form submitted');
        document.querySelectorAll('.field-error').forEach((error) => error.remove());

        let hasErrors = false;  // Changed to false as initial value

        if (!emailInput.value || !validateEmail(emailInput.value)) {
            showFieldError(emailInput, 'Please enter a valid email address');
            hasErrors = true;
        }

        if (!passwordInput.value || !validatePassword(passwordInput.value)) {
            showFieldError(passwordInput, 'Password must be at least 6 characters');
            hasErrors = true;
        }

        if (hasErrors) {
            showMessage('error', 'Please fix the errors in the form');
            return;
        }

        const submitBtn = document.querySelector('.submit-btn');
        const submitBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';

        const formData = new FormData();
        formData.append('email', emailInput.value);  // Add email to formData
        formData.append('password', passwordInput.value);  // Add password to formData

        const action = form.getAttribute('action');

        fetch(action, {
            method: 'POST',
            body: formData
        })
        .then(
            response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    throw new Error('Content type is not JSON');
                }
            }
        ).then(
            data => {
                submitBtn.innerHTML = submitBtnText;
                submitBtn.disabled = false;
                showMessage(data.status, data.message, data.data);  // Use data.status instead of hardcoding 'success'
            }
        ).catch(error => {
            submitBtn.innerHTML = submitBtnText;
            submitBtn.disabled = false;
            showMessage('error', 'Login failed: ' + error.message);
        });
    })

    

});