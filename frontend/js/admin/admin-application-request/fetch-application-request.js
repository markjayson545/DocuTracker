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
    
    // Pagination elements
    const paginationContainer = document.querySelector('.pagination');
    
    // Application search
    const applicationSearch = document.querySelector('.application-search input');
    const applicationSearchBtn = document.querySelector('.application-search button');
    
    // Current page and search state
    let currentPage = 1;
    let currentSearch = '';

    // Event listener setup
    userProfileModalCloseBtn.addEventListener('click', function () {
        userProfileModal.style.display = 'none';
        const documentControls = document.getElementById('document-controls');
        if (documentControls) {
            documentControls.style.display = 'none';
        }
    });

    // Create event listeners for verify buttons
    function createEventListenerForVerifyButton(btnId, appId) {
        const verifyBtn = document.getElementById(btnId);
        if (verifyBtn) {
            verifyBtn.addEventListener('click', async function () {
                try {
                    const applicationDetails = await fetchApplicationDetails(appId);
                    openUserProfileModal(applicationDetails);
                } catch (error) {
                    alert('Failed to fetch application details: ' + error.message);
                }
            });
        }
    }

    // Setup real-time search with debounce
    if (applicationSearch) {
        applicationSearch.addEventListener('input', debounce(function() {
            currentSearch = applicationSearch.value.trim();
            currentPage = 1; // Reset to first page when searching
            initializeApplicationData(currentPage, currentSearch);
        }, 500)); // 500ms debounce delay
    }
    
    if (applicationSearchBtn) {
        applicationSearchBtn.addEventListener('click', function() {
            currentSearch = applicationSearch.value.trim();
            currentPage = 1;
            initializeApplicationData(currentPage, currentSearch);
        });
    }

    // Document display handler
    function displayDocument(documentData) {
        const { objectUrl, isImage, fileExt, docPath } = documentData;
        const documentControls = document.getElementById('document-controls');

        if (isImage) {
            // Display image
            documentPlaceholder.innerHTML = `
                <div class="document-container">
                    <img src="${objectUrl}" alt="Document" class="document-image" id="document-image">
                </div>
            `;
            // Show the controls
            documentControls.style.display = 'flex';

            setupImageControls(objectUrl, docPath);
        } else {
            // For non-image files, show appropriate icon based on file extension
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
    }

    // Display document with loading indicator
    function viewDocument(docPath) {
        // Show loading indicator
        documentPlaceholder.innerHTML = `<p class="loading">Loading document...</p>`;
        const documentControls = document.getElementById('document-controls');
        documentControls.style.display = 'none';
        
        insertApplicationDocument(docPath)
            .then(documentData => {
                displayDocument(documentData);
            })
            .catch(error => {
                documentPlaceholder.innerHTML = `<p class="error-message">Error loading document: ${error.message}</p>`;
            });
    }

    function setupImageControls(objectUrl, docPath) {
        const docImage = document.getElementById('document-image');
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const rotateBtn = document.getElementById('rotate-btn');
        const resetBtn = document.getElementById('reset-btn');
        const downloadBtn = document.getElementById('download-btn');

        // Reset application utils zoom/rotation values
        applicationUtils.currentZoom = 1;
        applicationUtils.currentRotation = 0;

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
            applicationUtils.currentZoom += 0.1;
            updateTransform();
        });

        newZoomOutBtn.addEventListener('click', () => {
            if (applicationUtils.currentZoom > 0.2) {
                applicationUtils.currentZoom -= 0.1;
                updateTransform();
            }
        });

        newRotateBtn.addEventListener('click', () => {
            applicationUtils.currentRotation = (applicationUtils.currentRotation + 90) % 360;
            updateTransform();
        });

        newResetBtn.addEventListener('click', () => {
            applicationUtils.currentZoom = 1;
            applicationUtils.currentRotation = 0;
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
            docImage.style.transform = `scale(${applicationUtils.currentZoom}) rotate(${applicationUtils.currentRotation}deg)`;
        }
    }

    function addEventListenerForViewBtn(btnId, docPath) {
        const btn = document.getElementById(btnId);
        btn.addEventListener('click', function () {
            viewDocument(docPath);
        });
    }

    function openUserProfileModal(applicationDetails) {
        // Store the current application ID in the modal
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

        // Profile Details - using the helper function from global utilities
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
                            // ...existing code for other file types...
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
            viewDocument(verificationDocPath);
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

    // Update the application table
    function updateApplicationTable(applications) {
        if (!applications || applications.length === 0) {
            applicationRequestTable.innerHTML = '<tr style="color: red; text-align: center;"><td colspan="6">No applications found.</td></tr>';
            return;
        }
        
        let tableContent = '';
        
        applications.forEach(application => {
            const appId = application.application_id;
            const fName = application.first_name;
            const lName = application.last_name;
            const docType = application.document_type;
            const status = application.status;
            const date = application.created_at;

            tableContent += createApplicationRow(appId, fName, lName, docType, date, status);
        });

        applicationRequestTable.innerHTML = tableContent;

        // Attach event listeners after all rows are added to DOM
        applications.forEach(application => {
            const appId = application.application_id;
            createEventListenerForVerifyButton(`verifyBtn${appId}`, appId);
        });
    }
    
    // Render pagination controls
    function renderPagination() {
        if (!paginationContainer || !applicationUtils.pagination) return;
        
        const { current_page, total_pages } = applicationUtils.pagination;
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${current_page === 1 ? 'disabled' : ''}" 
                    ${current_page === 1 ? 'disabled' : ''} 
                    data-page="${current_page - 1}" 
                    title="Previous Page">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // First page
        if (current_page > 3) {
            paginationHTML += `
                <button class="pagination-btn" data-page="1">1</button>
                ${current_page > 4 ? '<span class="pagination-ellipsis">...</span>' : ''}
            `;
        }
        
        // Page numbers
        for (let i = Math.max(1, current_page - 2); i <= Math.min(total_pages, current_page + 2); i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === current_page ? 'active' : ''}" 
                        data-page="${i}">${i}</button>
            `;
        }
        
        // Last page
        if (current_page < total_pages - 2) {
            paginationHTML += `
                ${current_page < total_pages - 3 ? '<span class="pagination-ellipsis">...</span>' : ''}
                <button class="pagination-btn" data-page="${total_pages}">${total_pages}</button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn ${current_page === total_pages ? 'disabled' : ''}" 
                    ${current_page === total_pages ? 'disabled' : ''} 
                    data-page="${current_page + 1}" 
                    title="Next Page">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners to pagination buttons
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            if (!btn.disabled && btn.dataset.page) {
                btn.addEventListener('click', function() {
                    currentPage = parseInt(this.dataset.page);
                    initializeApplicationData(currentPage, currentSearch);
                });
            }
        });
    }

    // Initialize application data with pagination and search
    function initializeApplicationData(page = 1, searchTerm = '') {
        // Show loading state
        applicationRequestTable.innerHTML = '<tr><td colspan="6"><div class="loading-spinner"></div><p>Loading applications...</p></td></tr>';
        
        fetchApplicationRequests(page, searchTerm)
            .then(applications => {
                // Update the stats in the UI
                totalApplicationsValue.innerText = applicationUtils.stats.totalApplications;
                pendingApplicationsValue.innerText = applicationUtils.stats.pendingApplications;
                underReviewApplicationsValue.innerText = applicationUtils.stats.underReviewApplications;
                approvedApplicationsValue.innerText = applicationUtils.stats.approvedApplications;
                rejectedApplicationsValue.innerText = applicationUtils.stats.rejectedApplications;
                
                // Update the application table
                updateApplicationTable(applications);
                
                // Render pagination
                renderPagination();
            })
            .catch(error => {
                console.error('Failed to load application data:', error);
                applicationRequestTable.innerHTML = `<tr><td colspan="6">Error loading applications: ${error.message}</td></tr>`;
            });
    }

    // Admin actions for applications
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const requestInfoBtn = document.getElementById('request-additional-info-btn');

    if (approveBtn) {
        approveBtn.addEventListener('click', function () {
            processAdminAction('approve');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', function () {
            processAdminAction('reject');
        });
    }

    if (requestInfoBtn) {
        requestInfoBtn.addEventListener('click', function () {
            processAdminAction('request_info');
        });
    }

    // Function to process the admin actions with UI feedback
    function processAdminAction(action) {
        const currentApplicationId = userProfileModal.dataset.applicationId;
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

        // Call the global handler function
        handleAdminAction(action, currentApplicationId, adminNotes)
            .then(result => {
                if (result && result.success) {
                    alert(result.message);
                    userProfileModal.style.display = 'none';
                    initializeApplicationData(currentPage, currentSearch); // Refresh with current page and search
                } else if (result) {
                    alert('Error: ' + result.message);
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

    // Initialize data fetch
    initializeApplicationData(currentPage, currentSearch);
    
    // Set up refresh interval - reduced frequency to avoid excessive API calls
    const refreshInterval = 5 * 60 * 1000; // 5 minutes
    setInterval(() => {
        initializeApplicationData(currentPage, currentSearch);
    }, refreshInterval);
});