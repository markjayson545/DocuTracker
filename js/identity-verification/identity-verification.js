document.addEventListener('DOMContentLoaded', async function () {
    // Global references to DOM elements
    const personalDetailsForm = document.getElementById('personal-details-form');
    const uploadVerificationForm = document.getElementById('upload-verification-document');
    const processingStatus = document.querySelector('.processing-status');

    // Step indicators
    const personalInfoStep = document.getElementById('personal-details-step-class');
    const verifyIdentityStep = document.getElementById('verify-identity-step-class');
    const processingStep = document.getElementById('processing-step-class');

    // Progress lines
    const progressLine0 = document.getElementById('progress-line-step-0');
    const progressLine1 = document.getElementById('progress-line-step-1');

    // Navigation buttons
    const backButton = document.getElementById('back-button');
    const uploadForm = document.getElementById('upload-verification-form');

    // Initially hide all sections until we determine which one to show
    personalDetailsForm.style.display = 'none';
    uploadVerificationForm.style.display = 'none';
    processingStatus.style.display = 'none';

    // Track application state
    window.applicationState = {
        personalInfoCompleted: false,
        documentUploaded: false,
        processingStarted: false
    };

    // Helper function to safely set field values
    window.setFieldValue = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) {
            element.value = value ?? '';
        }
    };

    // Helper function to hide all sections
    window.hideAllSections = function () {
        personalDetailsForm.style.display = 'none';
        uploadVerificationForm.style.display = 'none';
        processingStatus.style.display = 'none';
    };

    // Helper function to update step indicators based on current step
    window.updateStepIndicators = function (currentStep) {
        // Reset all steps first
        [personalInfoStep, verifyIdentityStep, processingStep].forEach(step => {
            step.classList.remove('active', 'completed');
        });

        // Reset progress lines
        progressLine0.classList.remove('active', 'completed');
        progressLine1.classList.remove('active', 'completed');

        switch (currentStep) {
            case 1: // Personal Info step is active
                personalInfoStep.classList.add('active');
                progressLine0.classList.add('active');
                break;
            case 2: // Verify Identity step is active
                personalInfoStep.classList.add('completed');
                verifyIdentityStep.classList.add('active');
                progressLine0.classList.add('completed');
                progressLine1.classList.add('active');
                break;
            case 3: // Processing step is active
                personalInfoStep.classList.add('completed');
                verifyIdentityStep.classList.add('completed');
                processingStep.classList.add('active');
                progressLine0.classList.add('completed');
                progressLine1.classList.add('completed');
                break;
        }
    };

    // Navigation functions - expose to global scope for use in other files
    window.nextStep = function () {
        // Hide all sections first
        window.hideAllSections();

        // Update application state
        window.applicationState.personalInfoCompleted = true;

        // Check if document is already uploaded before showing upload form
        if (window.applicationState.documentUploaded) {
            // If document is already uploaded, show processing status instead
            processingStatus.style.display = 'block';
            window.updateStepIndicators(3);
        } else {
            // Show the upload verification form
            uploadVerificationForm.style.display = 'flex';
            // Update step indicators for step 2
            window.updateStepIndicators(2);
        }

        // Scroll to top for better UX
        window.scrollTo(0, 0);
    };

    window.previousStep = function () {
        // Hide all sections first
        window.hideAllSections();

        // Show the personal details form
        personalDetailsForm.style.display = 'block';

        // Update step indicators for step 1
        window.updateStepIndicators(1);

        // Scroll to top for better UX
        window.scrollTo(0, 0);
    };

    window.showVerificationForm = function () {
        // Hide all sections first
        window.hideAllSections();

        // Show the upload verification form
        uploadVerificationForm.style.display = 'flex';

        // Update step indicators for step 2
        window.updateStepIndicators(2);

        // Scroll to top for better UX
        window.scrollTo(0, 0);
    }

    window.goToProcessingStep = function () {
        // Hide all sections first
        window.hideAllSections();

        // Update application state
        window.applicationState.documentUploaded = true;
        window.applicationState.processingStarted = true;

        // Show the processing status
        processingStatus.style.display = 'block';

        // Update step indicators for step 3
        window.updateStepIndicators(3);

        // Scroll to top for better UX
        window.scrollTo(0, 0);
    };

    // Add click event listeners to step indicators
    personalInfoStep.addEventListener('click', function () {
        // Always allow going to personal info step
        window.previousStep();
    });

    verifyIdentityStep.addEventListener('click', function () {
        // Only allow if personal info is completed
        if (window.applicationState.personalInfoCompleted) {
            // Check if document is already uploaded
            if (window.applicationState.documentUploaded) {
                // If document already uploaded, go to processing step instead
                window.showVerificationForm();
            } else {
                // Otherwise show the upload form
                window.nextStep();
            }
        } else {
            alert("Please complete the Personal Information step first.");
        }
    });

    processingStep.addEventListener('click', function () {
        // Only allow if document is uploaded
        if (window.applicationState.documentUploaded) {
            window.goToProcessingStep();
        } else if (window.applicationState.personalInfoCompleted) {
            alert("Please upload your verification document first.");
        } else {
            alert("Please complete the Personal Information and Verification steps first.");
        }
    });

    // Make step indicators look clickable by adding cursor pointer
    personalInfoStep.style.cursor = 'pointer';
    verifyIdentityStep.style.cursor = 'pointer';
    processingStep.style.cursor = 'pointer';

    // Modified: Check if the user already has an application - returns a Promise
    window.checkExistingApplication = function () {
        return new Promise((resolve, reject) => {
            fetch('php/get-uploaded-document.php')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.has_application) {
                        // Update application details
                        if (data.application) {
                            document.getElementById('application-id').textContent = data.application.id || 'N/A';
                            document.getElementById('application-date').textContent = data.application.submission_date || 'N/A';
                            document.getElementById('application-status').textContent = data.application.status || 'Under Review';

                            // Update process step indicators based on status
                            updateProcessStepIndicators(data.application.status);

                            // Show document preview if available
                            if (data.application.document_path) {
                                window.showExistingDocument(data.application.document_type, data.application.document_path);
                            }
                        }

                        // Display personal details on the processing status page
                        if (data.personal_details) {
                            displayPersonalDetails(data.personal_details);
                        }

                        // Determine which section to show based on application state
                        if (data.application && data.application.document_path) {
                            // If document is uploaded and application exists, show processing step
                            window.applicationState.personalInfoCompleted = true;
                            window.applicationState.documentUploaded = true;
                            window.applicationState.processingStarted = true;
                            resolve({ step: 3 });
                        } else if (data.has_personal_details) {
                            // If user has entered personal details but not uploaded document
                            window.applicationState.personalInfoCompleted = true;
                            resolve({ step: 2 });
                        } else {
                            // If no progress, show personal info section (default)
                            resolve({ step: 1 });
                        }
                    } else {
                        // No existing application, show first step
                        resolve({ step: 1 });
                    }
                })
                .catch(error => {
                    console.error('Error checking application status:', error);
                    reject(error);
                });
        });
    };

    // Function to display personal details on the application status page
    function displayPersonalDetails(details) {
        // Check if application-details section exists, if not, create it
        let personalInfoSection = document.querySelector('.personal-info-details');
        if (!personalInfoSection) {
            personalInfoSection = document.createElement('div');
            personalInfoSection.className = 'personal-info-details';

            const heading = document.createElement('h3');
            heading.textContent = 'Personal Information';
            personalInfoSection.appendChild(heading);

            // Add the section to the application details container
            const applicationDetailsContainer = document.querySelector('.application-details');
            applicationDetailsContainer.parentNode.insertBefore(personalInfoSection, applicationDetailsContainer.nextSibling);
        }

        // Create table for personal details
        const detailsTable = document.createElement('table');
        detailsTable.className = 'personal-details-table';

        // Format name information
        const fullName = `${details.first_name || ''} ${details.middle_name || ''} ${details.last_name || ''} ${details.qualifier || ''}`.trim();
        addTableRow(detailsTable, 'Full Name', fullName);

        // Format basic information
        if (details.sex) addTableRow(detailsTable, 'Sex', details.sex.charAt(0).toUpperCase() + details.sex.slice(1));
        if (details.civil_status) addTableRow(detailsTable, 'Civil Status', details.civil_status.charAt(0).toUpperCase() + details.civil_status.slice(1));
        if (details.birthdate) {
            const birthDate = new Date(details.birthdate);
            addTableRow(detailsTable, 'Date of Birth', birthDate.toLocaleDateString());
        }
        if (details.birthplace) addTableRow(detailsTable, 'Place of Birth', details.birthplace);

        // Physical details
        if (details.height) addTableRow(detailsTable, 'Height', details.height + ' cm');
        if (details.weight) addTableRow(detailsTable, 'Weight', details.weight + ' kg');
        if (details.complexion) addTableRow(detailsTable, 'Complexion', details.complexion.charAt(0).toUpperCase() + details.complexion.slice(1));
        if (details.blood_type) addTableRow(detailsTable, 'Blood Type', details.blood_type.toUpperCase());

        // Other details
        if (details.religion) addTableRow(detailsTable, 'Religion', details.religion.charAt(0).toUpperCase() + details.religion.slice(1));
        if (details.educational_attainment) addTableRow(detailsTable, 'Educational Attainment', details.educational_attainment.charAt(0).toUpperCase() + details.educational_attainment.slice(1));
        if (details.occupation) addTableRow(detailsTable, 'Occupation', details.occupation.charAt(0).toUpperCase() + details.occupation.slice(1));

        // Address formatting
        if (details.house_number_building_name || details.street_name || details.subdivision_barangay ||
            details.city_municipality || details.province) {
            const addressParts = [];
            if (details.house_number_building_name) addressParts.push(details.house_number_building_name);
            if (details.street_name) addressParts.push(details.street_name);
            if (details.subdivision_barangay) addressParts.push(details.subdivision_barangay);
            if (details.city_municipality) addressParts.push(details.city_municipality);
            if (details.province) addressParts.push(details.province);

            addTableRow(detailsTable, 'Address', addressParts.join(', '));
        }

        // Add the table to the personal info section
        personalInfoSection.appendChild(detailsTable);
    }

    // Helper function to add table rows
    function addTableRow(table, label, value) {
        if (!value) return; // Don't add empty values

        const row = document.createElement('tr');

        const labelCell = document.createElement('td');
        labelCell.className = 'detail-label';
        labelCell.textContent = label;

        const valueCell = document.createElement('td');
        valueCell.className = 'detail-value';
        valueCell.textContent = value;

        row.appendChild(labelCell);
        row.appendChild(valueCell);
        table.appendChild(row);
    }

    // Update process indicators based on status
    function updateProcessStepIndicators(status) {
        const submittedIcon = document.querySelector('.step-process.submitted i');
        const reviewIcon = document.querySelector('.step-process.under-review i');
        const verifiedIcon = document.querySelector('.step-process.verified i');

        // Always mark submitted as done
        submittedIcon.classList.add('active');

        if (status === 'Under Review') {
            reviewIcon.classList.add('active');
        } else if (status === 'Approved' || status === 'Verified') {
            reviewIcon.classList.add('active');
            verifiedIcon.classList.add('active');
        }
    }

    // Display an existing document
    window.showExistingDocument = function (documentType, documentPath) {
        // Set the document type dropdown if available
        if (documentType) {
            const docTypeSelect = document.getElementById('document-type');
            if (docTypeSelect) {
                docTypeSelect.value = documentType;
            }
        }

        // Show document preview
        const previewContainer = document.getElementById('document-preview-container');
        if (previewContainer) {
            previewContainer.innerHTML = '';
            previewContainer.style.display = 'block';

            const previewHeader = document.createElement('h4');
            previewHeader.textContent = 'Currently Uploaded Document';
            previewContainer.appendChild(previewHeader);

            if (documentPath) {
                const fileExt = documentPath.split('.').pop().toLowerCase();

                if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
                    // Image preview
                    const img = document.createElement('img');
                    img.classList.add('document-preview-img');
                    img.src = `php/view-document.php?path=${encodeURIComponent(documentPath)}`;
                    previewContainer.appendChild(img);
                } else if (fileExt === 'pdf') {
                    // PDF viewer or link
                    const pdfContainer = document.createElement('div');
                    pdfContainer.className = 'pdf-preview';

                    const pdfIcon = document.createElement('i');
                    pdfIcon.className = 'fas fa-file-pdf';

                    const pdfLink = document.createElement('a');
                    pdfLink.href = `php/view-document.php?path=${encodeURIComponent(documentPath)}`;
                    pdfLink.target = '_blank';
                    pdfLink.textContent = 'View PDF Document';

                    pdfContainer.appendChild(pdfIcon);
                    pdfContainer.appendChild(pdfLink);
                    previewContainer.appendChild(pdfContainer);
                }

                const documentInfo = document.createElement('div');
                documentInfo.className = 'document-info';
                documentInfo.innerHTML = `
                    <p><strong>Document Type:</strong> ${documentType || 'Unknown'}</p>
                    <p><strong>Uploaded:</strong> ${new Date().toLocaleDateString()}</p>
                `;
                previewContainer.appendChild(documentInfo);
            }
        }
    };

    // Add event listeners
    if (backButton) {
        backButton.addEventListener('click', window.previousStep);
    }

    // New async initialization function to ensure correct section is displayed
    async function initializeApplication() {
        try {
            // First fetch any existing personal data if that function exists
            if (typeof window.fetchPersonalInfo === 'function') {
                await window.fetchPersonalInfo();
            }

            // Then check for existing application
            const result = await window.checkExistingApplication();

            // Show the appropriate section based on application state
            window.hideAllSections();

            switch (result.step) {
                case 3:
                    window.goToProcessingStep();
                    break;
                case 2:
                    window.nextStep();
                    break;
                case 1:
                default:
                    // Show the personal details form as default
                    personalDetailsForm.style.display = 'block';
                    window.updateStepIndicators(1);
                    break;
            }
        } catch (error) {
            console.error("Failed to initialize application:", error);
            // Fallback to showing the first step on error
            personalDetailsForm.style.display = 'block';
            window.updateStepIndicators(1);
        }
    }

    // Start the application initialization
    await initializeApplication();
});
