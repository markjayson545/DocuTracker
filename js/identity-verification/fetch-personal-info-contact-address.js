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

    backButton.addEventListener('click', previousStep);

    // Helper function to safely set field values
    const setFieldValue = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) {
            element.value = value ?? '';
        }
    };

    function nextStep() {
        personalDetailsForm.style.display = 'none';
        uploadVerificationForm.style.display = 'flex';

        personalInfoStep.classList.remove('active');
        personalInfoStep.classList.add('completed');

        verifyIdentityStep.classList.add('active');

        progressLine.classList.remove('active');
        progressLine.classList.add('completed');
        progressLine1.classList.add('active');
    }

    function previousStep() {
        personalDetailsForm.style.display = 'block';
        uploadVerificationForm.style.display = 'none';

        personalInfoStep.classList.remove('completed');
        personalInfoStep.classList.add('active');

        verifyIdentityStep.classList.remove('active');

        progressLine1.classList.remove('active');
        progressLine.classList.remove('completed');
        progressLine.classList.add('active');
    }

    // Fetch personal information from the server
    fetch('php/get-personal-information.php')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            var profileExists = false;
            var contactExists = false;
            var detailsExists = false;
            if (data.exists == true) {
                if (data.has_profile && data.profile_data != null) {
                    const profileData = data.profile_data;
                    // Set input values if they exist and if the input elements exist
                    setFieldValue('input[name="first-name"]', profileData.first_name);
                    setFieldValue('input[name="middle-name"]', profileData.middle_name);
                    setFieldValue('input[name="last-name"]', profileData.last_name);
                    setFieldValue('select[name="qualifier"]', profileData.qualifier);
                    setFieldValue('select[name="sex"]', profileData.sex);
                    setFieldValue('select[name="civil-status"]', profileData.civil_status);
                    setFieldValue('input[name="dob"]', profileData.birthdate);
                    setFieldValue('input[name="birth-place"]', profileData.birthplace);
                    profileExists = true;
                }
                if (data.has_contact && data.contact_data != null) {
                    const contactData = data.contact_data;
                    setFieldValue('input[name="house-num"]', contactData.house_number_building_name);
                    setFieldValue('input[name="street"]', contactData.street_name);
                    setFieldValue('input[name="barangay"]', contactData.subdivision_barangay);
                    setFieldValue('input[name="city"]', contactData.city_municipality);
                    setFieldValue('input[name="province"]', contactData.province);
                    contactExists = true;
                }
                if (data.has_details && data.details_data != null) {
                    const detailsData = data.details_data;
                    setFieldValue('input[name="height"]', detailsData.height);
                    setFieldValue('input[name="weight"]', detailsData.weight);
                    setFieldValue('select[name="nationality"]', detailsData.nationality);
                    setFieldValue('select[name="complexion"]', detailsData.complexion);
                    setFieldValue('select[name="blood-type"]', detailsData.blood_type);
                    setFieldValue('select[name="religion"]', detailsData.religion);
                    setFieldValue('select[name="education"]', detailsData.educational_attainment);
                    setFieldValue('select[name="occupation"]', detailsData.occupation);
                    detailsExists = true;
                }
            }
            if (profileExists && contactExists && detailsExists) {
                nextStep();
            }
        })
        .catch(error => {
            console.log(error);
        });

});