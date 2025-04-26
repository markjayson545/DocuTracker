document.addEventListener('DOMContentLoaded', function () {
    // Get reference to the form for potential future use
    const personalDetailsForm = document.getElementById('personal-details-form');
    const uploadVerificationForm = document.getElementById('upload-verification-document');

    const personalInfoStep = document.getElementById('personal-details-step-class');
    const verifyIdentityStep = document.getElementById('verify-identity-step-class');
    const processingApplicationStep = document.getElementById('processing-step-class');

    const progressLine = document.getElementById('progress-line-step-0');
    const progressLine1 = document.getElementById('progress-line-step-1');

    const backButton = document.getElementById('back-button');

    // Use the navigation function from the main file
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.previousStep) {
                window.previousStep();
            }
        });
    }

    // Helper function to safely set field values
    const setFieldValue = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) {
            element.value = value ?? '';
        }
    };

    // Function to fetch personal information from the server
    window.fetchPersonalInfo = function() {
        fetch('php/client/identity-verification/get-personal-information.php')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched personal info:', data);
                var profileExists = false;
                var contactExists = false;
                var detailsExists = false;
                
                if (data.exists == true) {
                    if (data.has_profile && data.profile_data != null) {
                        const profileData = data.profile_data;
                        // Set input values if they exist
                        window.setFieldValue('input[name="first-name"]', profileData.first_name);
                        window.setFieldValue('input[name="middle-name"]', profileData.middle_name);
                        window.setFieldValue('input[name="last-name"]', profileData.last_name);
                        window.setFieldValue('select[name="qualifier"]', profileData.qualifier);
                        window.setFieldValue('select[name="sex"]', profileData.sex);
                        window.setFieldValue('select[name="civil-status"]', profileData.civil_status);
                        window.setFieldValue('input[name="dob"]', profileData.birthdate);
                        window.setFieldValue('input[name="birth-place"]', profileData.birthplace);
                        profileExists = true;
                    }
                    
                    if (data.has_contact && data.contact_data != null) {
                        const contactData = data.contact_data;
                        window.setFieldValue('input[name="house-num"]', contactData.house_number_building_name);
                        window.setFieldValue('input[name="street"]', contactData.street_name);
                        window.setFieldValue('input[name="barangay"]', contactData.subdivision_barangay);
                        window.setFieldValue('input[name="city"]', contactData.city_municipality);
                        window.setFieldValue('input[name="province"]', contactData.province);
                        contactExists = true;
                    }
                    
                    if (data.has_details && data.details_data != null) {
                        const detailsData = data.details_data;
                        window.setFieldValue('input[name="height"]', detailsData.height);
                        window.setFieldValue('input[name="weight"]', detailsData.weight);
                        window.setFieldValue('select[name="nationality"]', detailsData.nationality);
                        window.setFieldValue('select[name="complexion"]', detailsData.complexion);
                        window.setFieldValue('select[name="blood-type"]', detailsData.blood_type);
                        window.setFieldValue('select[name="religion"]', detailsData.religion);
                        window.setFieldValue('select[name="education"]', detailsData.educational_attainment);
                        window.setFieldValue('select[name="occupation"]', detailsData.occupation);
                        detailsExists = true;
                    }
                    
                    // If all data exists, go to next step
                    if (profileExists && contactExists && detailsExists) {
                        window.nextStep();
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching personal information:', error);
            });
    };

    // Fetch personal information from the server
    fetchPersonalInfo();

});