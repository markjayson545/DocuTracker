/**
 * This file is now deprecated. 
 * Validation functionality has been moved to FormValidator module.
 * Include these scripts in your HTML instead:
 * 
 * <script src="/js/utils/core.js"></script>
 * <script src="/js/validation/form-validator.js"></script>
 * <script src="/js/client/identity-verification/identity-verification.js"></script>
 */

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
        
        // Legacy validation functions
        function validateInput(input) {
            const value = input.value.trim();
            const id = input.id;
            
            // Skip validation for optional fields if empty
            if (!input.required && value === '') {
                return true;
            }
            
            // Validate based on input type and id
            switch(id) {
                case 'first-name':
                case 'last-name':
                case 'middle-name':
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
                    return validateMeasurement(input, 'cm');
                    
                case 'weight':
                    return validateMeasurement(input, 'kg');
                    
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
        
        function validateText(input, minLength = 2, maxLength = 50) {
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
            
            // Allow numbers with decimal points
            if (value !== '' && !/^\d+(\.\d+)?$/.test(value)) {
                showError(input, `Please enter a valid ${input.id} in ${unit}`);
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
        
        function validateSelect(input) {
            if (input.required && (input.value === '' || input.selectedIndex === 0)) {
                showError(input, 'Please select an option');
                return false;
            }
            return true;
        }
        
        function showError(input, message) {
            // Remove any existing error for this input
            const existingError = document.getElementById(`${input.id}-error`);
            if (existingError) {
                existingError.remove();
            }
            
            // Create and insert error message
            const errorElement = document.createElement('p');
            errorElement.id = `${input.id}-error`;
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            errorElement.style.color = 'red';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '5px';
            
            input.parentNode.appendChild(errorElement);
            input.classList.add('error');
        }
        
        function clearAllErrors() {
            const errors = document.querySelectorAll('.error-message');
            errors.forEach(error => error.remove());
            
            const errorInputs = document.querySelectorAll('.error');
            errorInputs.forEach(input => input.classList.remove('error'));
        }
    }
});