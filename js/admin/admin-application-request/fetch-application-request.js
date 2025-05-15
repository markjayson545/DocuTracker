document.addEventListener('DOMContentLoaded', function () {
    // DOM element references
    const totalApplicationsValue = document.getElementById('total-applications-value');
    const pendingApplicationsValue = document.getElementById('pending-applications-value');
    const underReviewApplicationsValue = document.getElementById('under-review-applications-value');
    const approvedApplicationsValue = document.getElementById('approved-applications-value');
    const rejectedApplicationsValue = document.getElementById('rejected-applications-value');

    const applicationRequestTable = document.getElementById('application-table-body');
    const userProfileModal = document.getElementById('modal-overlay');
    const userProfileModalCloseBtn = document.getElementById('close-modal-btn');
    const documentPlaceholder = document.getElementById('document-placeholder');

    // Event listener setup
    userProfileModalCloseBtn.addEventListener('click', function () {
        userProfileModal.style.display = 'none';
        const documentControls = document.getElementById('document-controls');
        documentControls.style.display = 'none';
    });

    // Helper functions
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

    function capitalizeFirstLetter(val) {
        if (!val || typeof val !== 'string') return '';
        let value = val.replace(/-/g, " ");
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    }

    // Table and UI management functions
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

    // Document handling functions
    function insertApplicationDocument(docPath) {
        const form = new FormData();
        form.append('file_path', docPath);

        // Show loading indicator with improved styling
        documentPlaceholder.innerHTML = `<p class="loading">Loading document...</p>`;
        const documentControls = document.getElementById('document-controls');

        // Get file extension to determine file type
        const fileExt = docPath.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt);

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

                // Display document based on file type
                if (isImage) {
                    // Display image as before
                    documentPlaceholder.innerHTML = `
                    <div class="document-container">
                        <img src="${objectUrl}" alt="Document" class="document-image" id="document-image">
                    </div>
                `;
                    // Show the controls
                    documentControls.style.display = 'flex';

                    setupImageControls(objectUrl, docPath);
                }
                else {
                    // For non-image files, show appropriate icon based on file extension
                    const fileExt = docPath.split('.').pop().toLowerCase();

                    let fileIcon = 'fa-file';
                    let fileColor = '#6c757d'; // default gray

                    // Determine file type and set appropriate icon and color
                    switch (fileExt) {
                        case 'pdf':
                            fileIcon = 'fa-file-pdf';
                            fileColor = '#dc3545'; // red
                            break;
                        case 'doc':
                        case 'docx':
                            fileIcon = 'fa-file-word';
                            fileColor = '#0d6efd'; // blue
                            break;
                        case 'xls':
                        case 'xlsx':
                        case 'csv':
                            fileIcon = 'fa-file-excel';
                            fileColor = '#198754'; // green
                            break;
                        case 'ppt':
                        case 'pptx':
                            fileIcon = 'fa-file-powerpoint';
                            fileColor = '#fd7e14'; // orange
                            break;
                        case 'txt':
                            fileIcon = 'fa-file-alt';
                            fileColor = '#212529'; // dark
                            break;
                        case 'zip':
                        case 'rar':
                        case '7z':
                        case 'tar':
                        case 'gz':
                            fileIcon = 'fa-file-archive';
                            fileColor = '#6610f2'; // purple
                            break;
                        case 'html':
                        case 'htm':
                        case 'css':
                        case 'js':
                        case 'php':
                        case 'py':
                        case 'java':
                        case 'c':
                        case 'cpp':
                            fileIcon = 'fa-file-code';
                            fileColor = '#0dcaf0'; // info blue
                            break;
                        case 'mp3':
                        case 'wav':
                        case 'ogg':
                        case 'flac':
                        case 'm4a':
                            fileIcon = 'fa-file-audio';
                            fileColor = '#6f42c1'; // purple
                            break;
                        case 'mp4':
                        case 'mov':
                        case 'avi':
                        case 'wmv':
                        case 'flv':
                        case 'mkv':
                        case 'webm':
                            fileIcon = 'fa-file-video';
                            fileColor = '#d63384'; // pink
                            break;
                        case 'jpg':
                        case 'jpeg':
                        case 'png':
                        case 'gif':
                        case 'bmp':
                        case 'svg':
                        case 'webp':
                            fileIcon = 'fa-file-image';
                            fileColor = '#20c997'; // teal
                            break;
                        default:
                            fileIcon = 'fa-file';
                            fileColor = '#6c757d'; // gray
                    }

                    const fileName = docPath.split('/').pop() || 'document';

                    documentPlaceholder.innerHTML = `
                    <div class="document-container non-image-document">
                        <div class="file-icon-container">
                            <i class="fas ${fileIcon}" style="color: ${fileColor}"></i>
                            <p>${fileName}</p>
                            <div class="file-actions">
                                <a href="${objectUrl}" download="${fileName}" class="download-link">
                                    <i class="fas fa-download"></i> 
                                    <p>Download File</p>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                }
            })
            .catch(error => {
                console.error('Error fetching document:', error);
                documentPlaceholder.innerHTML = `<p class="error-message">Error loading document. Please try again.</p>`;
                documentControls.style.display = 'none';
            });
    }

    function setupImageControls(objectUrl, docPath) {
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
            const fileName = docPath.split('/').pop() || 'document.jpg';
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        function updateTransform() {
            docImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        }
    }

    function addEventListenerForViewBtn(btnId, docPath) {
        const btn = document.getElementById(btnId);
        btn.addEventListener('click', function () {
            insertApplicationDocument(docPath);
        });
    }

    // Application data functions
    async function fetchApplicationDetails(applicationID) {
        const body = new FormData();
        body.append('application_id', applicationID);
        await fetch('php/admin/admin-manage-applications/fetch-admin-application-details.php', {
            body: body,
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
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
        profileSectionNationality.innerText = capitalizeFirstLetter(applicationDetails.nationality) || 'N/A';
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
            const tableBody = document.getElementById('admin-documents-table-body');
            if (tableBody) {
                tableBody.innerHTML = '';
                if (applicationDetails.documents.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No documents uploaded.</td></tr>';
                } else {
                    applicationDetails.documents.forEach(doc => {
                        const fileExt = doc.document_path.split('.').pop().toLowerCase();
                        const filePath = doc.document_path;

                        // Determine the appropriate icon based on file extension
                        let iconClass = 'fa-file';

                        // Map file extensions to Font Awesome icons
                        switch (fileExt) {
                            case 'jpg':
                            case 'jpeg':
                            case 'png':
                            case 'gif':
                            case 'bmp':
                            case 'svg':
                            case 'webp':
                                iconClass = 'fa-file-image';
                                break;
                            case 'pdf':
                                iconClass = 'fa-file-pdf';
                                break;
                            case 'doc':
                            case 'docx':
                                iconClass = 'fa-file-word';
                                break;
                            case 'xls':
                            case 'xlsx':
                            case 'csv':
                                iconClass = 'fa-file-excel';
                                break;
                            case 'ppt':
                            case 'pptx':
                                iconClass = 'fa-file-powerpoint';
                                break;
                            case 'txt':
                                iconClass = 'fa-file-alt';
                                break;
                            case 'zip':
                            case 'rar':
                            case '7z':
                            case 'tar':
                            case 'gz':
                                iconClass = 'fa-file-archive';
                                break;
                            case 'html':
                            case 'htm':
                            case 'css':
                            case 'js':
                            case 'php':
                            case 'py':
                            case 'java':
                            case 'c':
                            case 'cpp':
                                iconClass = 'fa-file-code';
                                break;
                            case 'mp3':
                            case 'wav':
                            case 'ogg':
                            case 'flac':
                            case 'm4a':
                                iconClass = 'fa-file-audio';
                                break;
                            case 'mp4':
                            case 'avi':
                            case 'mov':
                            case 'wmv':
                            case 'flv':
                            case 'mkv':
                            case 'webm':
                                iconClass = 'fa-file-video';
                                break;
                            default:
                                iconClass = 'fa-file';
                                break;
                        }

                        // Format the date
                        const createdDate = new Date(doc.created_at).toLocaleString();

                        // Create row with appropriate icon
                        const rowTemplate = `
                            <tr data-document-path="${doc.document_path}">
                                <td>
                                    <div class="doc-preview-icon"><i class="fas ${iconClass}"></i></div>
                                    ${capitalizeFirstLetter(doc.document_type)}
                                </td>
                                <td>${createdDate}</td>
                                <td><button class="view-document-btn" id="viewDoc${doc.document_path}">View</button></td>
                            </tr>`;
                        tableBody.insertAdjacentHTML('beforeend', rowTemplate);
                        addEventListenerForViewBtn('viewDoc' + doc.document_path, doc.document_path);
                    });
                }
            }
        }

        const verificationDocPath = applicationDetails.application_document_path;

        // Load the main application document if available
        if (verificationDocPath) {
            insertApplicationDocument(verificationDocPath);
        } else {
            // Display a message if no document is available
            documentPlaceholder.innerHTML = `
                <div class="no-document-message">
                    <i class="fas fa-file-excel"></i>
                    <p>No primary document available. Please check the uploaded documents list.</p>
                </div>
            `;
        }

        // Display the modal
        userProfileModal.style.display = 'block';
    }

    function fetchApplicationRequests() {
        fetch('php/admin/admin-manage-applications/fetch-admin-application-request.php')
            .then(response => response.json())
            .then(data => {
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

    // Admin actions for applications
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const requestInfoBtn = document.getElementById('request-additional-info-btn');

    if (approveBtn) {
        approveBtn.addEventListener('click', function () {
            handleAdminAction('approve');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', function () {
            handleAdminAction('reject');
        });
    }

    if (requestInfoBtn) {
        requestInfoBtn.addEventListener('click', function () {
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
        switch (action) {
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
        switch (action) {
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

    // Initialize data fetch
    fetchApplicationRequests();
    setInterval(fetchApplicationRequests, 60000);
});