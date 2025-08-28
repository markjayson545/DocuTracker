// Basic backward compatibility layer
document.addEventListener('DOMContentLoaded', function() {
    // Check if FormValidator is available
    if (typeof FormValidator === 'undefined') {
        console.warn('FormValidator not found. Using legacy validation.');
        
        // Get form elements
        const form = document.getElementById('personal-info-form');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select');
        
        // Add form submission handler
        form.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Clear previous error messages
            clearAllErrors();
            
            // Validate each input
            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                event.preventDefault();
            }
        });

        // Add real-time validation for all inputs
        inputs.forEach(input => {
            // Validate on blur (when user leaves the field)
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            // For text inputs, validate as user types with a small delay
            if (input.tagName === 'INPUT' && input.type !== 'date') {
                input.addEventListener('input', debounce(function() {
                    validateInput(this);
                }, 500));
            }
            
            // For select and date inputs, validate on change
            if (input.tagName === 'SELECT' || input.type === 'date') {
                input.addEventListener('change', function() {
                    validateInput(this);
                });
            }
        });
        
        // Debounce function to prevent excessive validation during typing
        function debounce(func, delay) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        }
        
        // Legacy validation functions
        function validateInput(input) {
            const value = input.value.trim();
            const id = input.id;
            
            // Remove any existing error for this input first
            removeError(input);
            
            // Skip validation for optional fields if empty
            if (!input.required && value === '') {
                return true;
            }
            
            // Validate based on input type and id
            switch(id) {
                case 'first-name':
                case 'last-name':
                case 'middle-name':
                    return validateText(input, 2, 50, true); // true means no numbers allowed
                    
                case 'street':
                case 'barangay':
                case 'city':
                case 'province':
                case 'birth-place':
                    return validateText(input, 2, 50);
                    
                case 'house-num':
                    return validateHouseNumber(input);
                    
                case 'dob':
                    return validateDateOfBirth(input);
                    
                case 'height':
                case 'weight':
                    return validateMeasurement(input, id === 'height' ? 'cm' : 'kg');
                    
                case 'phone-number':
                    return validatePhoneNumber(input);
                    
                case 'postal-code':
                    return validatePostalCode(input);
                    
                // For select elements
                case 'qualifier':
                case 'sex':
                case 'civil-status':
                case 'nationality':
                case 'complexion':
                case 'blood-type':
                case 'religion':
                case 'education':
                case 'occupation':
                    return validateSelect(input);
                    
                default:
                    // Generic required field validation
                    if (input.required && value === '') {
                        showError(input, 'This field is required');
                        return false;
                    }
                    return true;
            }
        }
        
        function validateText(input, minLength = 2, maxLength = 50, noNumbers = false) {
            const value = input.value.trim();
            
            if (input.required && value === '') {
                showError(input, 'This field is required');
                return false;
            }
            
            if (value !== '' && value.length < minLength) {
                showError(input, `Must be at least ${minLength} characters`);
                return false;
            }
            
            if (value.length > maxLength) {
                showError(input, `Cannot exceed ${maxLength} characters`);
                return false;
            }
            
            // Stricter validation for name fields - no numbers allowed
            if (noNumbers && /[0-9]/.test(value)) {
                showError(input, 'Numbers are not allowed in this field');
                return false;
            }
            
            // Allow letters, spaces, hyphens and apostrophes for names
            if (!/^[A-Za-z\s\-']+$/.test(value) && (input.id.includes('name') || input.id === 'birth-place')) {
                showError(input, 'Only letters, spaces, hyphens and apostrophes allowed');
                return false;
            }
            
            return true;
        }
        
        function validateHouseNumber(input) {
            const value = input.value.trim();
            
            if (input.required && value === '') {
                showError(input, 'House number is required');
                return false;
            }
            
            if (value !== '' && value.length > 10) {
                showError(input, 'House number should not exceed 10 characters');
                return false;
            }
            
            // Allow alphanumeric characters, hyphens, slashes, and spaces for house numbers
            if (!/^[A-Za-z0-9\s\-\/]+$/.test(value)) {
                showError(input, 'Only letters, numbers, spaces, hyphens and slashes allowed');
                return false;
            }
            
            return true;
        }
        
        function validateDateOfBirth(input) {
            const value = input.value;
            
            if (input.required && value === '') {
                showError(input, 'Date of birth is required');
                return false;
            }
            
            if (value !== '') {
                const dob = new Date(value);
                const now = new Date();
                
                if (isNaN(dob.getTime())) {
                    showError(input, 'Invalid date format');
                    return false;
                }
                
                if (dob > now) {
                    showError(input, 'Date of birth cannot be in the future');
                    return false;
                }
                
                // Check if person is at least 13 years old
                const minAgeDate = new Date();
                minAgeDate.setFullYear(now.getFullYear() - 10);
                if (dob > minAgeDate) {
                    showError(input, 'You must be at least 10 years old');
                    return false;
                }
                
                // Check if person is not too old (120 years max)
                const maxAge = new Date();
                maxAge.setFullYear(now.getFullYear() - 120);
                if (dob < maxAge) {
                    showError(input, 'Date of birth is too far in the past');
                    return false;
                }
            }
            
            return true;
        }
        
        function validateMeasurement(input, unit) {
            const value = input.value.trim();
            
            if (input.required && value === '') {
                showError(input, `${input.id.charAt(0).toUpperCase() + input.id.slice(1)} is required`);
                return false;
            }
            
            // Allow ONLY numbers with decimal points - no letters or other characters
            if (value !== '' && !/^\d+(\.\d+)?$/.test(value)) {
                showError(input, `Please enter a valid number for ${input.id} in ${unit}. No letters allowed.`);
                return false;
            }
            
            // Validate reasonable ranges
            const numValue = parseFloat(value);
            if (input.id === 'height' && (numValue < 50 || numValue > 250)) {
                showError(input, 'Height should be between 50cm and 250cm');
                return false;
            }
            
            if (input.id === 'weight' && (numValue < 2 || numValue > 500)) {
                showError(input, 'Weight should be between 2kg and 500kg');
                return false;
            }
            
            return true;
        }
        
        // Add new validation functions for numeric-only fields
        function validatePhoneNumber(input) {
            const value = input.value.trim();
            
            if (input.required && value === '') {
                showError(input, 'Phone number is required');
                return false;
            }
            
            // Only allow digits and optional plus sign at beginning
            if (value !== '' && !/^\+?\d+$/.test(value)) {
                showError(input, 'Phone number can only contain digits and an optional + at the beginning');
                return false;
            }
            
            return true;
        }
        
        function validatePostalCode(input) {
            const value = input.value.trim();
            
            if (input.required && value === '') {
                showError(input, 'Postal code is required');
                return false;
            }
            
            // Only allow digits for postal code
            if (value !== '' && !/^\d+$/.test(value)) {
                showError(input, 'Postal code can only contain numbers');
                return false;
            }
            
            return true;
        }
        
        function validateSelect(input) {
            if (input.required && (input.value === '' || input.selectedIndex === 0)) {
                showError(input, 'Please select an option');
                return false;
            }
            return true;
        }
        
        function showError(input, message) {
            // Remove any existing error for this input
            removeError(input);
            
            // Get parent element (input-with-icon or form-group)
            const parentEl = input.closest('.input-with-icon') || input.parentNode;
            const formGroup = input.closest('.form-group');
            
            // Create and insert error message
            const errorElement = document.createElement('div');
            errorElement.id = `${input.id}-error`;
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            
            // Apply styles to error message
            errorElement.style.color = '#e74c3c';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '5px';
            errorElement.style.transition = 'opacity 0.3s ease';
            errorElement.style.opacity = '0';
            
            // Insert error after the input or input container
            if (parentEl.nextElementSibling) {
                formGroup.insertBefore(errorElement, parentEl.nextElementSibling);
            } else {
                formGroup.appendChild(errorElement);
            }
            
            // Add error class to input for styling
            input.classList.add('error-input');
            if (formGroup) formGroup.classList.add('has-error');
            
            // Trigger reflow and animate in
            setTimeout(() => {
                errorElement.style.opacity = '1';
            }, 10);
            
            return errorElement;
        }
        
        function removeError(input) {
            // Find and remove error message
            const errorElement = document.getElementById(`${input.id}-error`);
            if (errorElement) {
                // Fade out animation
                errorElement.style.opacity = '0';
                setTimeout(() => {
                    errorElement.remove();
                }, 300);
            }
            
            // Remove error styling
            input.classList.remove('error-input');
            const formGroup = input.closest('.form-group');
            if (formGroup) formGroup.classList.remove('has-error');
        }
        
        function clearAllErrors() {
            const errors = document.querySelectorAll('.error-message');
            errors.forEach(error => {
                error.style.opacity = '0';
                setTimeout(() => {
                    error.remove();
                }, 300);
            });
            
            const errorInputs = document.querySelectorAll('.error-input');
            errorInputs.forEach(input => {
                input.classList.remove('error-input');
                const formGroup = input.closest('.form-group');
                if (formGroup) formGroup.classList.remove('has-error');
            });
        }
    }
});