/**
 * DocuTracker - Core Utilities
 * Contains shared functionality used across the application
 */

const DocuTracker = {
    // DOM manipulation utilities
    DOM: {
        /**
         * Get element by selector
         * @param {string} selector - CSS selector
         * @return {Element|null} - DOM element or null if not found
         */
        get: (selector) => document.querySelector(selector),
        
        /**
         * Get all elements matching selector
         * @param {string} selector - CSS selector
         * @return {NodeList} - List of matching DOM elements
         */
        getAll: (selector) => document.querySelectorAll(selector),
        
        /**
         * Set field value safely
         * @param {string} selector - CSS selector
         * @param {*} value - Value to set
         */
        setFieldValue: (selector, value) => {
            const element = document.querySelector(selector);
            if (element) {
                element.value = value !== null && value !== undefined ? value : '';
            }
        },

        /**
         * Show element
         * @param {Element} element - DOM element
         * @param {string} display - Display property value
         */
        show: (element, display = 'block') => {
            if (element) element.style.display = display;
        },

        /**
         * Hide element
         * @param {Element} element - DOM element
         */
        hide: (element) => {
            if (element) element.style.display = 'none';
        },

        /**
         * Add CSS class to element
         * @param {Element} element - DOM element
         * @param {string} className - CSS class to add
         */
        addClass: (element, className) => {
            if (element && className) element.classList.add(className);
        },

        /**
         * Remove CSS class from element
         * @param {Element} element - DOM element
         * @param {string} className - CSS class to remove
         */
        removeClass: (element, className) => {
            if (element && className) element.classList.remove(className);
        }
    },

    // AJAX utilities
    AJAX: {
        /**
         * Send GET request
         * @param {string} url - Request URL
         * @param {Object} options - Fetch options
         * @return {Promise} - Fetch promise
         */
        get: (url, options = {}) => {
            return fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                ...options
            })
            .then(response => response.json())
            .catch(error => {
                console.error('Error during fetch operation:', error);
                throw error;
            });
        },

        /**
         * Send POST request with FormData
         * @param {string} url - Request URL
         * @param {FormData} formData - Form data to send
         * @param {Object} options - Additional fetch options
         * @return {Promise} - Fetch promise
         */
        postForm: (url, formData, options = {}) => {
            return fetch(url, {
                method: 'POST',
                body: formData,
                ...options
            })
            .then(response => response.json())
            .catch(error => {
                console.error('Error during fetch operation:', error);
                throw error;
            });
        },

        /**
         * Send POST request with JSON
         * @param {string} url - Request URL
         * @param {Object} data - JSON data to send
         * @param {Object} options - Additional fetch options
         * @return {Promise} - Fetch promise
         */
        postJSON: (url, data, options = {}) => {
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                ...options
            })
            .then(response => response.json())
            .catch(error => {
                console.error('Error during fetch operation:', error);
                throw error;
            });
        }
    },

    // Logger with environment awareness
    logger: {
        isProduction: false, // Set to true in production
        
        log: function(message, data) {
            if (!this.isProduction) {
                console.log(message, data || '');
            }
        },
        
        error: function(message, error) {
            console.error(message, error || '');
        }
    }
};
