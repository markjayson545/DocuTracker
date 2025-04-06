/**
 * Form Validation Module
 * Provides reusable validation functions for forms
 */

const FormValidator = {
    /**
     * Initialize form validation
     * @param {string} formId - ID of the form to validate
     * @param {Object} customRules - Optional custom validation rules
     */
    init: function(formId, customRules = {}) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        
        // Add form submission handler
        form.addEventListener('submit', (event) => {
            let isValid = true;
            
            // Clear previous error messages
            this.clearAllErrors(form);
            
            // Validate each input
            inputs.forEach(input => {
                if (!this.validateInput(input, customRules)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                event.preventDefault();
            }
        });
        
        // Add validation on input change
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                FormValidator.validateInput(this, customRules);
            });
            
            input.addEventListener('input', function() {
                // Remove error when user starts typing again
                const errorElement = document.getElementById(`${this.id}-error`);
                if (errorElement) {
                    errorElement.remove();
                }
                this.classList.remove('error');
            });
        });
    },
    
    /**
     * Validate a single input field
     * @param {Element} input - Input element to validate
     * @param {Object} customRules - Optional custom validation rules
     * @return {boolean} - True if valid, false otherwise
     */
    validateInput: function(input, customRules = {}) {
        const value = input.value.trim();
        const id = input.id;
        
        // Skip validation for optional fields if empty
        if (!input.required && value === '') {
            return true;
        }
        
        // Check if custom rule exists for this input
        if (customRules[id] && typeof customRules[id] === 'function') {
            return customRules[id](input, value);
        }
        
        // Default validation based on input type and id
        switch(id) {
            case 'first-name':
            case 'last-name':
            case 'middle-name':
            case 'street':
            case 'barangay':
            case 'city':
            case 'province':
            case 'birth-place':
                return this.validateText(input, 2, 50);
                
            case 'house-num':
                return this.validateHouseNumber(input);
                
            case 'dob':
                return this.validateDateOfBirth(input);
                
            case 'height':
                return this.validateMeasurement(input, 'cm', 50, 250);
                
            case 'weight':
                return this.validateMeasurement(input, 'kg', 2, 500);
                
            // For select elements
            default:
                if (input.tagName.toLowerCase() === 'select') {
                    return this.validateSelect(input);
                }
                
                // Generic required field validation
                if (input.required && value === '') {
                    this.showError(input, 'This field is required');
                    return false;
                }
                return true;
        }
    },
    
    /**
     * Validate text input
     * @param {Element} input - Input element
     * @param {number} minLength - Minimum length
     * @param {number} maxLength - Maximum length
     * @return {boolean} - True if valid, false otherwise
     */
    validateText: function(input, minLength = 2, maxLength = 50) {
        const value = input.value.trim();
        
        if (input.required && value === '') {
            this.showError(input, 'This field is required');
            return false;
        }
        
        if (value !== '' && value.length < minLength) {
            this.showError(input, `Must be at least ${minLength} characters`);
            return false;
        }
        
        if (value.length > maxLength) {
            this.showError(input, `Cannot exceed ${maxLength} characters`);
            return false;
        }
        
        // Allow letters, spaces, hyphens and apostrophes for names
        if (!/^[A-Za-z\s\-']+$/.test(value) && (input.id.includes('name') || input.id === 'birth-place')) {
            this.showError(input, 'Only letters, spaces, hyphens and apostrophes allowed');
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate house number
     * @param {Element} input - Input element
     * @return {boolean} - True if valid, false otherwise
     */
    validateHouseNumber: function(input) {
        const value = input.value.trim();
        
        if (input.required && value === '') {
            this.showError(input, 'House number is required');
            return false;
        }
        
        if (value !== '' && value.length > 10) {
            this.showError(input, 'House number should not exceed 10 characters');
            return false;
        }
        
        // Allow alphanumeric characters, hyphens, slashes, and spaces for house numbers
        if (!/^[A-Za-z0-9\s\-\/]+$/.test(value)) {
            this.showError(input, 'Only letters, numbers, spaces, hyphens and slashes allowed');
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate date of birth
     * @param {Element} input - Input element
     * @return {boolean} - True if valid, false otherwise
     */
    validateDateOfBirth: function(input) {
        const value = input.value;
        
        if (input.required && value === '') {
            this.showError(input, 'Date of birth is required');
            return false;
        }
        
        if (value !== '') {
            const dob = new Date(value);
            const now = new Date();
            
            if (isNaN(dob.getTime())) {
                this.showError(input, 'Invalid date format');
                return false;
            }
            
            if (dob > now) {
                this.showError(input, 'Date of birth cannot be in the future');
                return false;
            }
            
            // Check if person is not too old (120 years max)
            const maxAge = new Date();
            maxAge.setFullYear(now.getFullYear() - 120);
            if (dob < maxAge) {
                this.showError(input, 'Date of birth is too far in the past');
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Validate measurement input (height/weight)
     * @param {Element} input - Input element
     * @param {string} unit - Measurement unit
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @return {boolean} - True if valid, false otherwise
     */
    validateMeasurement: function(input, unit, min, max) {
        const value = input.value.trim();
        
        if (input.required && value === '') {
            this.showError(input, `${input.id.charAt(0).toUpperCase() + input.id.slice(1)} is required`);
            return false;
        }
        
        // Allow numbers with decimal points
        if (value !== '' && !/^\d+(\.\d+)?$/.test(value)) {
            this.showError(input, `Please enter a valid ${input.id} in ${unit}`);
            return false;
        }
        
        // Validate reasonable ranges
        const numValue = parseFloat(value);
        if (numValue < min || numValue > max) {
            this.showError(input, `${input.id.charAt(0).toUpperCase() + input.id.slice(1)} should be between ${min}${unit} and ${max}${unit}`);
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate select input
     * @param {Element} input - Select element
     * @return {boolean} - True if valid, false otherwise
     */
    validateSelect: function(input) {
        if (input.required && (input.value === '' || input.selectedIndex === 0)) {
            this.showError(input, 'Please select an option');
            return false;
        }
        return true;
    },
    
    /**
     * Show error message
     * @param {Element} input - Input element
     * @param {string} message - Error message
     */
    showError: function(input, message) {
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
        errorElement.style.color = '#f44336';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        
        input.parentNode.appendChild(errorElement);
        input.classList.add('error');
    },
    
    /**
     * Clear all error messages in a form
     * @param {Element} form - Form element
     */
    clearAllErrors: function(form) {
        const errors = form.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
        
        const errorInputs = form.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }
};
