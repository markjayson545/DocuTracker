document.addEventListener('DOMContentLoaded', function () {
    console.log('Sign-up JS loaded successfully!');
    
    const form = document.getElementById('signup-form');
    const formGroups = document.querySelectorAll('.form-group');
    const messageDiv = document.getElementById('message');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const usernameInput = document.getElementById('username');

    // Add animation class to each form group with delay
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.classList.add('animate');
        }, 100 * index);
    });

    // Client-side validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        // Basic phone validation - can be enhanced based on specific requirements
        const re = /^\+?\d{10,15}$/;
        return re.test(phone.replace(/[\s-]/g, ''));
    }

    function validateUsername(username) {
        // Username must be at least 3 characters and contain only letters, numbers, and underscores
        return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    function validatePasswordMatch() {
        return passwordInput.value === confirmPasswordInput.value;
    }

    // Add input event listeners for real-time validation
    emailInput.addEventListener('input', function() {
        if (this.value && !validateEmail(this.value)) {
            showFieldError(this, 'Please enter a valid email address');
        } else {
            clearFieldError(this);
        }
    });

    phoneInput.addEventListener('input', function() {
        if (this.value && !validatePhone(this.value)) {
            showFieldError(this, 'Please enter a valid phone number');
        } else {
            clearFieldError(this);
        }
    });

    usernameInput.addEventListener('input', function() {
        if (this.value && !validateUsername(this.value)) {
            showFieldError(this, 'Username must be at least 3 characters and contain only letters, numbers, and underscores');
        
        } else {
            clearFieldError(this);
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        if (passwordInput.value && !validatePasswordMatch()) {
            showFieldError(this, 'Passwords do not match');
        } else {
            clearFieldError(this);
        }
    });

    // Function to show field-specific error
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

    // Function to clear field-specific error
    function clearFieldError(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Show message in the UI with extended error support
    function showMessage(isSuccess, message, errorDetails = null) {
        messageDiv.style.display = 'block';
        
        if (isSuccess) {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.textContent = '✅ ' + message;
        } else {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.innerHTML = '❌ ' + message;
            
            // Add error details collapsible section if provided
            if (errorDetails) {
                const errorToggle = document.createElement('div');
                errorToggle.style.marginTop = '10px';
                errorToggle.style.cursor = 'pointer';
                errorToggle.innerHTML = '<small>▼ Show error details</small>';
                
                const errorDump = document.createElement('pre');
                errorDump.style.display = 'none';
                errorDump.style.backgroundColor = '#f5f5f5';
                errorDump.style.padding = '10px';
                errorDump.style.marginTop = '5px';
                errorDump.style.fontSize = '12px';
                errorDump.style.overflowX = 'auto';
                errorDump.style.whiteSpace = 'pre-wrap';
                errorDump.style.color = '#dc3545';
                
                // Format error details as JSON
                try {
                    errorDump.textContent = JSON.stringify(errorDetails, null, 2);
                } catch (e) {
                    errorDump.textContent = String(errorDetails);
                }
                
                errorToggle.addEventListener('click', function() {
                    if (errorDump.style.display === 'none') {
                        errorDump.style.display = 'block';
                        errorToggle.innerHTML = '<small>▲ Hide error details</small>';
                    } else {
                        errorDump.style.display = 'none';
                        errorToggle.innerHTML = '<small>▼ Show error details</small>';
                    }
                });
                
                messageDiv.appendChild(errorToggle);
                messageDiv.appendChild(errorDump);
            }
        }
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Hide message after 5 seconds only if successful
        if (isSuccess) {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Form submission using AJAX
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('Form submission intercepted by JS');
        
        // Clear any existing error messages
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        
        // Client-side validation before submission
        let hasErrors = false;
        
        // Validate email
        if (!validateEmail(emailInput.value)) {
            showFieldError(emailInput, 'Please enter a valid email address');
            hasErrors = true;
        }
        
        // Validate phone
        if (!validatePhone(phoneInput.value)) {
            showFieldError(phoneInput, 'Please enter a valid phone number');
            hasErrors = true;
        }
        
        // Validate username
        if (!validateUsername(usernameInput.value)) {
            showFieldError(usernameInput, 'Username must be at least 3 characters and contain only letters, numbers, and underscores');
            hasErrors = true;
        }
        
        // Validate password match
        if (!validatePasswordMatch()) {
            showFieldError(confirmPasswordInput, 'Passwords do not match');
            hasErrors = true;
        }
        
        if (hasErrors) {
            showMessage(false, 'Please fix the errors before submitting');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Create form data object
        const formData = new FormData(form);
        
        // Use the correct path from the form's action attribute
        const action = form.getAttribute('action');
        
        // Send AJAX request
        fetch(action, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            // First check if the response is OK
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            
            // Check the content type to handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json().catch(err => {
                    throw new Error('Invalid JSON response: ' + err.message);
                });
            } else {
                // For non-JSON responses, get the text and show it
                return response.text().then(text => {
                    throw new Error('Received non-JSON response: ' + text.substring(0, 100) + '...');
                });
            }
        })
        .then(data => {
            // Reset submit button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            if (data.success) {
                showMessage(true, data.message);
                
                // Reset form on success
                form.reset();
                
                // Redirect to login page after successful registration
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                // Display message with error details if available
                showMessage(false, data.message, data.error_details);
                
                // Highlight specific field based on error message
                const errorMsg = data.message.toLowerCase();
                if (errorMsg.includes('username')) {
                    showFieldError(usernameInput, 'This username is already taken');
                } else if (errorMsg.includes('email')) {
                    showFieldError(emailInput, 'This email is already registered');
                } else if (errorMsg.includes('phone')) {
                    showFieldError(phoneInput, 'This phone number is already registered');
                } else if (errorMsg.includes('password')) {
                    showFieldError(passwordInput, 'Password error: ' + data.message);
                }
            }
        })
        .catch(error => {
            // Reset submit button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            console.error('Error:', error);
            
            // Create a detailed error dump
            const errorData = {
                errorMessage: error.message,
                stack: error.stack,
                possibleCauses: [
                    "PHP script not executed (server configuration issue)",
                    "Incorrect file path in form action attribute",
                    "PHP error preventing JSON output",
                    "Missing or incorrect Content-Type header in PHP response"
                ],
                troubleshooting: [
                    "Check that the form action points to the correct PHP file",
                    "Ensure PHP is properly installed and configured on the server",
                    "Check the server error logs for PHP errors",
                    "Verify that the PHP file has the correct permissions"
                ],
                receivedResponse: error.message.includes('Received non-JSON response:') ? 
                    error.message.substring(error.message.indexOf(':') + 1) : 'Not available'
            };
            
            showMessage(false, 'Error processing request. Server might not be processing PHP files correctly.', errorData);
            
            // Check if it looks like we received PHP code and provide specific guidance
            if (error.message.includes('<?php')) {
                const fixInstructions = document.createElement('div');
                fixInstructions.className = 'server-config-error';
                fixInstructions.innerHTML = `
                    <p style="margin-top:15px;font-weight:bold;">Server Configuration Issue Detected</p>
                    <ul style="text-align:left;margin-top:10px;">
                        <li>The server is not processing PHP files correctly.</li>
                        <li>Make sure PHP is installed and properly configured on your server.</li>
                        <li>Check that the form action URL is correct: <code>${action}</code></li>
                        <li>If using XAMPP, make sure Apache is running.</li>
                    </ul>
                `;
                messageDiv.appendChild(fixInstructions);
            }
        });
    });
    
    // Password visibility toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon between eye and eye-slash
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });
});
