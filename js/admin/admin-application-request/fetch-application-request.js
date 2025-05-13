document.addEventListener('DOMContentLoaded', function () {
    const totalApplicationsValue = document.getElementById('total-applications-value');
    const pendingApplicationsValue = document.getElementById('pending-applications-value');
    const underReviewApplicationsValue = document.getElementById('under-review-applications-value');
    const approvedApplicationsValue = document.getElementById('approved-applications-value');
    const rejectedApplicationsValue = document.getElementById('rejected-applications-value');

    const applicationRequestTable = document.getElementById('application-table-body');
    const userProfileModal = document.getElementById('modal-overlay');
    const userProfileModalCloseBtn = document.getElementById('close-modal-btn');

    const documentPlaceholder = document.getElementById('document-placeholder');

    userProfileModalCloseBtn.addEventListener('click', function () {
        userProfileModal.style.display = 'none';
        const documentControls = document.getElementById('document-controls');
        documentControls.style.display = 'none';
    });

    function parseDate(date) {
        const now = new Date();
        const updateDateTime = new Date(date);
        const diffMs = now - updateDateTime;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);

        let formattedUpdateDate;
        if (diffSec < 60) {
            formattedUpdateDate = 'just now';
        } else if (diffMin < 60) {
            formattedUpdateDate = diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
        } else if (diffHrs < 24) {
            formattedUpdateDate = diffHrs === 1 ? '1 hour ago' : `${diffHrs} hours ago`;
        } else if (diffDays < 30) {
            formattedUpdateDate = diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
        } else {
            formattedUpdateDate = updateDateTime.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        return formattedUpdateDate;
    }

    function insertApplicationRequestRow(appId, fName, lName, docType, date, status) {
        const formattedStatus = status
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return `
                    <tr>
                        <td>APP-${appId}</td>
                        <td>${fName} ${lName}</td>
                        <td>${capitalizeFirstLetter(docType)}</td>
                        <td>${parseDate(date)}</td>
                        <td><span class="status-badge status-${status}">${formattedStatus}</span></td>
                        <td class="actions-cell">
                        <button class="verify-btn" id="verifyBtn${appId}">Verify</button>
                        <button class="reject-btn">Reject</button>
                        </td>
                    </tr>`;
    }

    function createEventListenerForVerifyButton(btnId, appId) {
        const verifyBtn = document.getElementById(btnId);
        if (verifyBtn) {
            verifyBtn.addEventListener('click', async function () {
                await fetchApplicationDetails(appId);
            });
        }
    }

    function capitalizeFirstLetter(val) {
        if (!val || typeof val !== 'string') return '';
        let value = val.replace(/-/g, " ");
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    }

    function openUserProfileModal(applicationDetails) {
        // Add this line to store the current application ID in the modal
        const userProfileModal = document.getElementById('modal-overlay');
        if (userProfileModal) {
            userProfileModal.dataset.applicationId = applicationDetails.application_id;
        }

        // Title
        const fullNameTitle = document.getElementById('full-name-title');
        const userIdTitle = document.getElementById('user-id-title');
        const registeredOnTitle = document.getElementById('registered-on-title');
        const verificationStatus = document.getElementById('verification-status');
        const verificationStatusBadge = document.getElementById('verification-status-badge');
        const verificationStatusIcon = document.getElementById('verification-status-icon');
        const verifiedUsersSection = document.getElementById('verified-users-section');
        const verificationDate = document.getElementById('verification-date');
        const verifiedBy = document.getElementById('verified-by');
        const viewApplicationBtn = document.getElementById('view-application-btn');

        // Profile Details
        const profileSectionFullName = document.getElementById('profile-section-full-name');
        const profileSectionEmail = document.getElementById('profile-section-email');
        const profileSectionPhone = document.getElementById('profile-section-phone');
        const profileSectionFullAddress = document.getElementById('profile-section-full-address');
        const profileSectionBirthdate = document.getElementById('profile-section-birthdate');
        const profileSectionSex = document.getElementById('profile-section-sex');
        const profileSectionCivilStatus = document.getElementById('profile-section-civil-status');
        const profileSectionNationality = document.getElementById('profile-section-nationality');
        const profileSectionBirthplace = document.getElementById('profile-section-birthplace');
        const profileSectionHeight = document.getElementById('profile-section-height');
        const profileSectionWeight = document.getElementById('profile-section-weight');
        const profileSectionComplexion = document.getElementById('profile-section-complexion');
        const profileSectionBloodType = document.getElementById('profile-section-blood-type');
        const profileSectionReligion = document.getElementById('profile-section-religion');
        const profileSectionEducation = document.getElementById('profile-section-education');
        const profileSectionOccupation = document.getElementById('profile-section-occupation');

        // Title
        fullNameTitle.innerText = `${applicationDetails.first_name} ${applicationDetails.middle_name ? applicationDetails.middle_name + ' ' : ''}${applicationDetails.last_name} ${applicationDetails.qualifier === 'none' ? '' : applicationDetails.qualifier}`;
        userIdTitle.innerText = `ID: ${applicationDetails.user_id}`;
        registeredOnTitle.innerText = `Registered on: ${new Date(applicationDetails.user_created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

        // Format the status for display and update verification UI
        const isVerified = applicationDetails.is_verified === '1' || applicationDetails.is_verified === true;
        
        if (isVerified) {
            verificationStatus.innerText = 'Verified';
            verificationStatusBadge.classList.add('verified');
            verificationStatusBadge.classList.remove('not-verified');
            verificationStatusIcon.className = 'fas fa-check-circle';
            
            // Show verified users section
            verifiedUsersSection.style.display = 'block';
            
            // Update verified user info
            if (applicationDetails.verification_date) {
                const formattedVerificationDate = new Date(applicationDetails.verification_date).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                });
                verificationDate.innerText = formattedVerificationDate;
            } else {
                verificationDate.innerText = 'N/A';
            }
            
            verifiedBy.innerText = applicationDetails.verified_by || 'System';
            
            // Set up view application button
            viewApplicationBtn.addEventListener('click', () => {
                // Navigate to detailed application page or show application details
                window.location.href = `admin-view-application.html?id=${applicationDetails.application_id}`;
            });
        } else {
            verificationStatus.innerText = 'Not Verified';
            verificationStatusBadge.classList.add('not-verified');
            verificationStatusBadge.classList.remove('verified');
            verificationStatusIcon.className = 'fas fa-times-circle';
            
            // Hide verified users section
            verifiedUsersSection.style.display = 'none';
        }

        // Profile Details
        profileSectionFullName.innerText = `${applicationDetails.first_name} ${applicationDetails.middle_name ? applicationDetails.middle_name + ' ' : ''}${applicationDetails.last_name} ${applicationDetails.qualifier === 'none' ? '' : applicationDetails.qualifier}`;
        profileSectionEmail.innerText = applicationDetails.email || 'N/A';
        profileSectionPhone.innerText = applicationDetails.phone || 'N/A';

        // Construct full address
        const addressParts = [
            applicationDetails.house_number_building_name,
            applicationDetails.street_name,
            applicationDetails.subdivision_barangay,
            applicationDetails.city_municipality,
            applicationDetails.province
        ].filter(Boolean); // Remove empty parts
        profileSectionFullAddress.innerText = addressParts.join(', ') || 'N/A';

        // Format birthdate
        const birthdate = applicationDetails.birthdate ? new Date(applicationDetails.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        profileSectionBirthdate.innerText = birthdate;

        profileSectionSex.innerText = capitalizeFirstLetter(applicationDetails.sex) || 'N/A';
        profileSectionCivilStatus.innerText = capitalizeFirstLetter(applicationDetails.civil_status) || 'N/A';
        profileSectionNationality.innerText = capitalizeFirstLetter(applicationDetails.nationality) || 'N/A'; // Note: This field might not be in the data
        profileSectionBirthplace.innerText = capitalizeFirstLetter(applicationDetails.birthplace) || 'N/A';
        profileSectionHeight.innerText = applicationDetails.height ? `${applicationDetails.height} cm` : 'N/A';
        profileSectionWeight.innerText = applicationDetails.weight ? `${applicationDetails.weight} kg` : 'N/A';
        profileSectionComplexion.innerText = capitalizeFirstLetter(applicationDetails.complexion) || 'N/A';
        profileSectionBloodType.innerText = applicationDetails.blood_type || 'N/A';
        profileSectionReligion.innerText = capitalizeFirstLetter(applicationDetails.religion) || 'N/A';
        profileSectionEducation.innerText = capitalizeFirstLetter(applicationDetails.educational_attainment) || 'N/A';
        profileSectionOccupation.innerText = capitalizeFirstLetter(applicationDetails.occupation) || 'N/A';

        // Render all uploaded documents in the admin-documents-table
        if (applicationDetails.documents && Array.isArray(applicationDetails.documents)) {
            const tableBody = document.querySelector('#admin-documents-table tbody');
            if (tableBody) {
                tableBody.innerHTML = '';
                if (applicationDetails.documents.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No documents uploaded.</td></tr>';
                } else {
                    applicationDetails.documents.forEach(doc => {
                        const fileExt = doc.document_path.split('.').pop().toLowerCase();
                        let previewHtml = '';
                        if (["jpg","jpeg","png"].includes(fileExt)) {
                            previewHtml = `<img src="php/client/identity-verification/view-document.php?path=${encodeURIComponent(doc.document_path)}" alt="Document">`;
                        } else if (fileExt === 'pdf') {
                            previewHtml = `<a href="php/client/identity-verification/view-document.php?path=${encodeURIComponent(doc.document_path)}" target="_blank"><i class='fas fa-file-pdf'></i> View</a>`;
                        }
                        tableBody.innerHTML += `
                            <tr data-document-path="${doc.document_path}">
                                <td>${doc.document_type}</td>
                                <td>${previewHtml}</td>
                                <td>${new Date(doc.created_at).toLocaleString()}</td>
                                <td><button class="view-document-btn">View</button></td>
                            </tr>
                        `;
                    });
                    // Add click listeners for view buttons
                    tableBody.querySelectorAll('.view-document-btn').forEach(btn => {
                        btn.onclick = function() {
                            const row = btn.closest('tr');
                            const docPath = row.getAttribute('data-document-path');
                            insertApplicationDocument(docPath);
                        };
                    });
                }
            }
        }

        const verificationDocPath = applicationDetails.application_document_path;

        insertApplicationDocument(verificationDocPath);

        // Display the modal
        userProfileModal.style.display = 'block';
    }

    async function fetchApplicationDetails(applicationID) {
        const body = new FormData();
        body.append('application_id', applicationID);
        await fetch('php/admin/admin-manage-applications/fetch-admin-application-details.php', {
            body: body,
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status === 'success') {
                    openUserProfileModal(data.data);
                } else {
                    alert('Failed to fetch application details: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching application details:', error);
                alert('Error fetching application details. Please try again.');
            });
    }

    function insertApplicationDocument(docPath) {
        const form = new FormData();
        form.append('file_path', docPath);
        
        // Show loading indicator with improved styling
        documentPlaceholder.innerHTML = `<p class="loading">Loading document...</p>`;
        const documentControls = document.getElementById('document-controls');
        
        fetch('php/services/get-document.php', {
            method: 'POST',
            body: form
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob(); // Get the response as binary data
        })
        .then(blob => {
            // Create a URL for the blob
            const objectUrl = URL.createObjectURL(blob);
            
            // Display the document
            documentPlaceholder.innerHTML = `
                <div class="document-container">
                    <img src="${objectUrl}" alt="Document" class="document-image" id="document-image">
                </div>
            `;
            
            // Show the controls
            documentControls.style.display = 'flex';
            
            // Add zoom and rotation functionality
            const docImage = document.getElementById('document-image');
            const zoomInBtn = document.getElementById('zoom-in-btn');
            const zoomOutBtn = document.getElementById('zoom-out-btn');
            const rotateBtn = document.getElementById('rotate-btn');
            const resetBtn = document.getElementById('reset-btn');
            const downloadBtn = document.getElementById('download-btn');
            
            let currentZoom = 1;
            let currentRotation = 0;
            
            // Reset any previous event listeners
            zoomInBtn.replaceWith(zoomInBtn.cloneNode(true));
            zoomOutBtn.replaceWith(zoomOutBtn.cloneNode(true));
            rotateBtn.replaceWith(rotateBtn.cloneNode(true));
            resetBtn.replaceWith(resetBtn.cloneNode(true));
            downloadBtn.replaceWith(downloadBtn.cloneNode(true));
            
            // Get fresh references
            const newZoomInBtn = document.getElementById('zoom-in-btn');
            const newZoomOutBtn = document.getElementById('zoom-out-btn');
            const newRotateBtn = document.getElementById('rotate-btn');
            const newResetBtn = document.getElementById('reset-btn');
            const newDownloadBtn = document.getElementById('download-btn');
            
            newZoomInBtn.addEventListener('click', () => {
                currentZoom += 0.1;
                updateTransform();
            });
            
            newZoomOutBtn.addEventListener('click', () => {
                if (currentZoom > 0.2) {
                    currentZoom -= 0.1;
                    updateTransform();
                }
            });
            
            newRotateBtn.addEventListener('click', () => {
                currentRotation = (currentRotation + 90) % 360;
                updateTransform();
            });
            
            newResetBtn.addEventListener('click', () => {
                currentZoom = 1;
                currentRotation = 0;
                updateTransform();
            });
            
            newDownloadBtn.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = 'document.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
            
            function updateTransform() {
                docImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
            }
        })
        .catch(error => {
            console.error('Error fetching document:', error);
            documentPlaceholder.innerHTML = `<p class="error-message">Error loading document. Please try again.</p>`;
            documentControls.style.display = 'none';
        });
    }

    function fetchApplicationRequests() {
        fetch('php/admin/admin-manage-applications/fetch-admin-application-request.php')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    totalApplicationsValue.innerText = data.total_application;
                    pendingApplicationsValue.innerText = data.total_pending_application;
                    underReviewApplicationsValue.innerText = data.total_under_review_application;
                    approvedApplicationsValue.innerText = data.total_approved_application;
                    rejectedApplicationsValue.innerText = data.total_rejected_application;

                    let tableContent = '';

                    data.applications.forEach(application => {
                        const appId = application.application_id;
                        const fName = application.first_name;
                        const lName = application.last_name;
                        const docType = application.document_type;
                        const status = application.status;
                        const date = application.created_at;

                        tableContent += insertApplicationRequestRow(appId, fName, lName, docType, date, status);
                    });

                    applicationRequestTable.innerHTML = tableContent;

                    // Attach event listeners after all rows are added to DOM
                    data.applications.forEach(application => {
                        const appId = application.application_id;
                        createEventListenerForVerifyButton(`verifyBtn${appId}`, appId);
                    });
                }
            });
    }

    fetchApplicationRequests();
    setInterval(fetchApplicationRequests, 60000);

    // Add event listeners for admin action buttons
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const requestInfoBtn = document.getElementById('request-additional-info-btn');

    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            handleAdminAction('approve');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            handleAdminAction('reject');
        });
    }

    if (requestInfoBtn) {
        requestInfoBtn.addEventListener('click', function() {
            handleAdminAction('request_info');
        });
    }

    // Function to handle admin actions
    function handleAdminAction(action) {
        const currentApplicationId = document.getElementById('modal-overlay').dataset.applicationId;
        let adminNotes = '';
        
        if (!currentApplicationId) {
            alert('No application selected!');
            return;
        }
        
        // Get admin notes based on the action
        if (action === 'reject' || action === 'request_info') {
            adminNotes = prompt(action === 'reject' 
                ? 'Please provide a reason for rejection:' 
                : 'Please specify what additional documents are needed:');
            
            if (adminNotes === null) {
                return; // User cancelled the prompt
            }
        }
        
        // Create confirmation message
        let confirmMessage = '';
        switch(action) {
            case 'approve':
                confirmMessage = 'Are you sure you want to approve this application?';
                break;
            case 'reject':
                confirmMessage = 'Are you sure you want to reject this application?';
                break;
            case 'request_info':
                confirmMessage = 'Are you sure you want to request additional information?';
                break;
        }
        
        if (!confirm(confirmMessage)) {
            return; // User cancelled the confirmation
        }
        
        // Show loading state on button
        const button = action === 'approve' ? approveBtn : 
                       action === 'reject' ? rejectBtn : requestInfoBtn;
        
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        button.disabled = true;
        
        // Disable all action buttons while processing
        [approveBtn, rejectBtn, requestInfoBtn].forEach(btn => {
            if (btn) btn.disabled = true;
        });
        
        const formData = new FormData();
        formData.append('action', action);
        formData.append('application_id', currentApplicationId);
        formData.append('admin_notes', adminNotes);
        
        // Send request to server
        fetch('php/admin/admin-manage-applications/handle-admin-action.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(getSuccessMessage(action));
                userProfileModal.style.display = 'none';
                fetchApplicationRequests(); // Refresh the applications list
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        })
        .finally(() => {
            // Reset button states
            button.innerHTML = originalText;
            [approveBtn, rejectBtn, requestInfoBtn].forEach(btn => {
                if (btn) btn.disabled = false;
            });
        });
    }
    
    function getSuccessMessage(action) {
        switch(action) {
            case 'approve':
                return 'Application has been approved successfully!';
            case 'reject':
                return 'Application has been rejected.';
            case 'request_info':
                return 'Additional information has been requested from the applicant.';
            default:
                return 'Action completed successfully.';
        }
    }
});