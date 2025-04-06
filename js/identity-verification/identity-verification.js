/**
 * Identity Verification Module
 * Controls the identity verification workflow
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the module
    const IdentityVerification = {
        // DOM elements
        elements: {
            personalInfoForm: document.getElementById('personal-info-form'),
            uploadVerificationForm: document.getElementById('upload-verification-document'),
            personalInfoStep: document.getElementById('personal-details-step-class'),
            verifyIdentityStep: document.getElementById('verify-identity-step-class'),
            processingStep: document.getElementById('processing-step-class'),
            progressLine0: document.getElementById('progress-line-step-0'),
            progressLine1: document.getElementById('progress-line-step-1'),
            backButton: document.getElementById('back-button')
        },
        
        /**
         * Initialize the module
         */
        init: function() {
            // Check if we have all required elements
            if (!this.elements.personalInfoForm) {
                DocuTracker.logger.error('Personal info form not found');
                return;
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize form validation
            FormValidator.init('personal-info-form');
            
            // Load existing personal information
            this.loadPersonalInfo();
        },
        
        /**
         * Setup event listeners
         */
        setupEventListeners: function() {
            // Handle form submission
            if (this.elements.personalInfoForm) {
                this.elements.personalInfoForm.addEventListener('submit', this.handleFormSubmit.bind(this));
            }
            
            // Handle back button
            if (this.elements.backButton) {
                this.elements.backButton.addEventListener('click', this.previousStep.bind(this));
            }
        },
        
        /**
         * Handle form submission
         * @param {Event} event - Form submit event
         */
        handleFormSubmit: function(event) {
            event.preventDefault();
            
            const formData = new FormData(this.elements.personalInfoForm);
            
            // Save personal information
            DocuTracker.AJAX.postForm('php/save-personal-info-contact-address.php', formData)
                .then(data => {
                    DocuTracker.logger.log('Save personal info response:', data);
                    
                    if (data.success === true) {
                        this.nextStep();
                    } else {
                        // Show error message
                        alert(data.error || 'Failed to save personal information.');
                    }
                })
                .catch(error => {
                    DocuTracker.logger.error('Error saving personal info:', error);
                    alert('An error occurred while saving your information.');
                });
        },
        
        /**
         * Load personal information
         */
        loadPersonalInfo: function() {
            DocuTracker.AJAX.get('php/get-personal-information.php')
                .then(data => {
                    DocuTracker.logger.log('Personal info data:', data);
                    
                    let profileExists = false;
                    let contactExists = false;
                    let detailsExists = false;
                    
                    if (data.exists === true) {
                        // Load profile data
                        if (data.has_profile && data.profile_data) {
                            const profileData = data.profile_data;
                            DocuTracker.DOM.setFieldValue('input[name="first-name"]', profileData.first_name);
                            DocuTracker.DOM.setFieldValue('input[name="middle-name"]', profileData.middle_name);
                            DocuTracker.DOM.setFieldValue('input[name="last-name"]', profileData.last_name);
                            DocuTracker.DOM.setFieldValue('select[name="qualifier"]', profileData.qualifier);
                            DocuTracker.DOM.setFieldValue('select[name="sex"]', profileData.sex);
                            DocuTracker.DOM.setFieldValue('select[name="civil-status"]', profileData.civil_status);
                            DocuTracker.DOM.setFieldValue('input[name="dob"]', profileData.birthdate);
                            DocuTracker.DOM.setFieldValue('input[name="birth-place"]', profileData.birthplace);
                            profileExists = true;
                        }
                        
                        // Load contact data
                        if (data.has_contact && data.contact_data) {
                            const contactData = data.contact_data;
                            DocuTracker.DOM.setFieldValue('input[name="house-num"]', contactData.house_number_building_name);
                            DocuTracker.DOM.setFieldValue('input[name="street"]', contactData.street_name);
                            DocuTracker.DOM.setFieldValue('input[name="barangay"]', contactData.subdivision_barangay);
                            DocuTracker.DOM.setFieldValue('input[name="city"]', contactData.city_municipality);
                            DocuTracker.DOM.setFieldValue('input[name="province"]', contactData.province);
                            contactExists = true;
                        }
                        
                        // Load details data
                        if (data.has_details && data.details_data) {
                            const detailsData = data.details_data;
                            DocuTracker.DOM.setFieldValue('input[name="height"]', detailsData.height);
                            DocuTracker.DOM.setFieldValue('input[name="weight"]', detailsData.weight);
                            DocuTracker.DOM.setFieldValue('select[name="nationality"]', detailsData.nationality);
                            DocuTracker.DOM.setFieldValue('select[name="complexion"]', detailsData.complexion);
                            DocuTracker.DOM.setFieldValue('select[name="blood-type"]', detailsData.blood_type);
                            DocuTracker.DOM.setFieldValue('select[name="religion"]', detailsData.religion);
                            DocuTracker.DOM.setFieldValue('select[name="education"]', detailsData.educational_attainment);
                            DocuTracker.DOM.setFieldValue('select[name="occupation"]', detailsData.occupation);
                            detailsExists = true;
                        }
                        
                        // If all data exists, proceed to next step
                        if (profileExists && contactExists && detailsExists) {
                            this.nextStep();
                        }
                    }
                })
                .catch(error => {
                    DocuTracker.logger.error('Error loading personal info:', error);
                });
        },
        
        /**
         * Proceed to next step
         */
        nextStep: function() {
            // Hide personal info form, show verification form
            DocuTracker.DOM.hide(this.elements.personalInfoForm);
            DocuTracker.DOM.show(this.elements.uploadVerificationForm, 'flex');
            
            // Update step indicators
            DocuTracker.DOM.removeClass(this.elements.personalInfoStep, 'active');
            DocuTracker.DOM.addClass(this.elements.personalInfoStep, 'completed');
            DocuTracker.DOM.addClass(this.elements.verifyIdentityStep, 'active');
            
            // Update progress lines
            DocuTracker.DOM.removeClass(this.elements.progressLine0, 'active');
            DocuTracker.DOM.addClass(this.elements.progressLine0, 'completed');
            DocuTracker.DOM.addClass(this.elements.progressLine1, 'active');
        },
        
        /**
         * Go back to previous step
         */
        previousStep: function() {
            // Show personal info form, hide verification form
            DocuTracker.DOM.show(this.elements.personalInfoForm);
            DocuTracker.DOM.hide(this.elements.uploadVerificationForm);
            
            // Update step indicators
            DocuTracker.DOM.removeClass(this.elements.personalInfoStep, 'completed');
            DocuTracker.DOM.addClass(this.elements.personalInfoStep, 'active');
            DocuTracker.DOM.removeClass(this.elements.verifyIdentityStep, 'active');
            
            // Update progress lines
            DocuTracker.DOM.removeClass(this.elements.progressLine1, 'active');
            DocuTracker.DOM.removeClass(this.elements.progressLine0, 'completed');
            DocuTracker.DOM.addClass(this.elements.progressLine0, 'active');
        }
    };
    
    // Initialize the module
    IdentityVerification.init();
});
