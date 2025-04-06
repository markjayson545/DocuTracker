document.addEventListener('DOMContentLoaded', function () {
    const personalDetailsForm = document.getElementById('personal-info-form');
    // Get reference to the form for potential future use
    const uploadVerificationForm = document.getElementById('upload-verification-document');

    const personalInfoStep = document.getElementById('personal-details-step-class');
    const verifyIdentityStep = document.getElementById('verify-identity-step-class');
    const processingApplicationStep = document.getElementById('processing-step-class');

    const progressLine = document.getElementById('progress-line-step-0');
    const progressLine1 = document.getElementById('progress-line-step-1');

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

    // Add event listener to the form
    personalDetailsForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Create a FormData object from the form
        const formData = new FormData(personalDetailsForm);

        // Send the form data to the server
        fetch('php/save-personal-info-contact-address.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success == true) {
                    // Data saved successfully
                    console.log('Data saved successfully');
                    // Proceed to the next step
                    nextStep();
                } else {
                    // Error saving data
                    console.log(data.error);
                }
            })
            .catch(error => {
                console.log(error);
            });
    });
});