/**
 * Application Utilities - Global functions and variables for application handling
 */

// Global variables for application functionality
const applicationUtils = {
    // Current application being viewed
    currentApplicationId: null,
    
    // Document handling state
    currentZoom: 1,
    currentRotation: 0,
    
    // Application stats
    stats: {
        totalApplications: 0,
        pendingApplications: 0,
        underReviewApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0
    }
};

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

// Application data functions
async function fetchApplicationDetails(applicationID) {
    try {
        applicationUtils.currentApplicationId = applicationID;
        
        const body = new FormData();
        body.append('application_id', applicationID);
        const response = await fetch('php/admin/admin-manage-applications/fetch-admin-application-details.php', {
            body: body,
            method: 'POST'
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to fetch application details');
        }
    } catch (error) {
        console.error('Error fetching application details:', error);
        throw error;
    }
}

async function fetchApplicationRequests() {
    try {
        const response = await fetch('php/admin/admin-manage-applications/fetch-admin-application-request.php');
        const data = await response.json();
        
        if (data.success) {
            // Update global stats
            applicationUtils.stats.totalApplications = data.total_application;
            applicationUtils.stats.pendingApplications = data.total_pending_application;
            applicationUtils.stats.underReviewApplications = data.total_under_review_application;
            applicationUtils.stats.approvedApplications = data.total_approved_application;
            applicationUtils.stats.rejectedApplications = data.total_rejected_application;
            
            return data.applications;
        } else {
            throw new Error(data.message || 'Failed to fetch applications');
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        throw error;
    }
}

// Document handling functions
function insertApplicationDocument(docPath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('file_path', docPath);

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
                resolve({ blob, objectUrl, isImage, fileExt, docPath });
            })
            .catch(error => {
                console.error('Error fetching document:', error);
                reject(error);
            });
    });
}

// Add document display function (globalized)
function displayDocument(documentData) {
    const { objectUrl, isImage, fileExt, docPath } = documentData;
    const documentPlaceholder = document.getElementById('document-placeholder');
    const documentControls = document.getElementById('document-controls');
    
    if (!documentPlaceholder) {
        console.error('Document placeholder element not found');
        return;
    }

    if (isImage) {
        // Display image
        documentPlaceholder.innerHTML = `
            <div class="document-container">
                <img src="${objectUrl}" alt="Document" class="document-image" id="document-image">
            </div>
        `;
        
        // Show the controls if they exist
        if (documentControls) {
            documentControls.style.display = 'flex';
            setupImageControls(objectUrl, docPath);
        }
    } else {
        // For non-image files, determine appropriate icon and color
        let fileIcon = 'fa-file';
        let fileColor = '#6c757d'; // default gray

        // Map file extensions to icons and colors
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
            // More file types...
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

// Global function to view a document with loading indicator
function viewDocument(docPath) {
    const documentPlaceholder = document.getElementById('document-placeholder');
    const documentControls = document.getElementById('document-controls');
    
    if (!documentPlaceholder) {
        console.error('Document placeholder element not found');
        return;
    }
    
    // Show loading indicator
    documentPlaceholder.innerHTML = `<p class="loading">Loading document...</p>`;
    
    if (documentControls) {
        documentControls.style.display = 'none';
    }
    
    insertApplicationDocument(docPath)
        .then(documentData => {
            displayDocument(documentData);
        })
        .catch(error => {
            if (documentPlaceholder) {
                documentPlaceholder.innerHTML = `<p class="error-message">Error loading document: ${error.message}</p>`;
            }
        });
}

// Setup image controls for zoom, rotate, etc.
function setupImageControls(objectUrl, docPath) {
    const docImage = document.getElementById('document-image');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const rotateBtn = document.getElementById('rotate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    if (!docImage || !zoomInBtn || !zoomOutBtn || !rotateBtn || !resetBtn || !downloadBtn) {
        console.error('One or more document control elements not found');
        return;
    }

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
        updateTransform(docImage);
    });

    newZoomOutBtn.addEventListener('click', () => {
        if (applicationUtils.currentZoom > 0.2) {
            applicationUtils.currentZoom -= 0.1;
            updateTransform(docImage);
        }
    });

    newRotateBtn.addEventListener('click', () => {
        applicationUtils.currentRotation = (applicationUtils.currentRotation + 90) % 360;
        updateTransform(docImage);
    });

    newResetBtn.addEventListener('click', () => {
        applicationUtils.currentZoom = 1;
        applicationUtils.currentRotation = 0;
        updateTransform(docImage);
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
}

function updateTransform(docImage) {
    if (docImage) {
        docImage.style.transform = `scale(${applicationUtils.currentZoom}) rotate(${applicationUtils.currentRotation}deg)`;
    }
}

// Admin actions for applications
async function handleAdminAction(action, applicationId, adminNotes = '') {
    try {
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
            return null; // User cancelled the confirmation
        }

        const formData = new FormData();
        formData.append('action', action);
        formData.append('application_id', applicationId);
        formData.append('admin_notes', adminNotes);

        // Send request to server
        const response = await fetch('php/admin/admin-manage-applications/handle-admin-action.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            return {
                success: true,
                message: getSuccessMessage(action)
            };
        } else {
            throw new Error(data.message || 'Action failed');
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            success: false,
            message: error.message
        };
    }
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

// Table functions
function createApplicationRow(appId, fName, lName, docType, date, status) {
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

// Global function to open user profile modal - THE KEY ADDITION
function openUserProfileModal(applicationDetails) {
    // Find the modal element
    const userProfileModal = document.getElementById('modal-overlay');
    
    if (!userProfileModal) {
        console.error('User profile modal not found');
        return;
    }
    
    // Store the current application ID in the modal
    userProfileModal.dataset.applicationId = applicationDetails.application_id;
    
    // Get all the necessary DOM elements
    const elements = {
        // Title elements
        fullNameTitle: document.getElementById('full-name-title'),
        userIdTitle: document.getElementById('user-id-title'),
        registeredOnTitle: document.getElementById('registered-on-title'),
        verificationStatus: document.getElementById('verification-status'),
        verificationStatusBadge: document.getElementById('verification-status-badge'),
        verificationStatusIcon: document.getElementById('verification-status-icon'),
        verifiedUsersSection: document.getElementById('verified-users-section'),
        verificationDate: document.getElementById('verification-date'),
        verifiedBy: document.getElementById('verified-by'),
        viewApplicationBtn: document.getElementById('view-application-btn'),
        
        // Profile details elements
        profileSectionFullName: document.getElementById('profile-section-full-name'),
        profileSectionEmail: document.getElementById('profile-section-email'),
        profileSectionPhone: document.getElementById('profile-section-phone'),
        profileSectionFullAddress: document.getElementById('profile-section-full-address'),
        profileSectionBirthdate: document.getElementById('profile-section-birthdate'),
        profileSectionSex: document.getElementById('profile-section-sex'),
        profileSectionCivilStatus: document.getElementById('profile-section-civil-status'),
        profileSectionNationality: document.getElementById('profile-section-nationality'),
        profileSectionBirthplace: document.getElementById('profile-section-birthplace'),
        profileSectionHeight: document.getElementById('profile-section-height'),
        profileSectionWeight: document.getElementById('profile-section-weight'),
        profileSectionComplexion: document.getElementById('profile-section-complexion'),
        profileSectionBloodType: document.getElementById('profile-section-blood-type'),
        profileSectionReligion: document.getElementById('profile-section-religion'),
        profileSectionEducation: document.getElementById('profile-section-education'),
        profileSectionOccupation: document.getElementById('profile-section-occupation'),
        
        // Document elements
        documentPlaceholder: document.getElementById('document-placeholder')
    };
    
    // Check if required elements exist
    if (!elements.fullNameTitle || !elements.profileSectionFullName) {
        console.error('Required modal elements not found');
        return;
    }
    
    // Set title information
    if (elements.fullNameTitle) {
        elements.fullNameTitle.innerText = `${applicationDetails.first_name} ${applicationDetails.middle_name ? applicationDetails.middle_name + ' ' : ''}${applicationDetails.last_name} ${applicationDetails.qualifier === 'none' ? '' : applicationDetails.qualifier}`;
    }
    
    if (elements.userIdTitle) {
        elements.userIdTitle.innerText = `ID: ${applicationDetails.user_id}`;
    }
    
    if (elements.registeredOnTitle) {
        elements.registeredOnTitle.innerText = `Registered on: ${new Date(applicationDetails.user_created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
    
    // Format verification status
    const isVerified = applicationDetails.is_verified === '1' || applicationDetails.is_verified === true;
    
    if (elements.verificationStatus && elements.verificationStatusBadge && elements.verificationStatusIcon) {
        if (isVerified) {
            elements.verificationStatus.innerText = 'Verified';
            elements.verificationStatusBadge.classList.add('verified');
            elements.verificationStatusBadge.classList.remove('not-verified');
            elements.verificationStatusIcon.className = 'fas fa-check-circle';
            
            // Show verified users section if it exists
            if (elements.verifiedUsersSection) {
                elements.verifiedUsersSection.style.display = 'block';
                
                // Update verified user info
                if (elements.verificationDate && applicationDetails.verification_date) {
                    const formattedVerificationDate = new Date(applicationDetails.verification_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                    elements.verificationDate.innerText = formattedVerificationDate;
                }
                
                if (elements.verifiedBy) {
                    elements.verifiedBy.innerText = applicationDetails.verified_by || 'System';
                }
                
                // Set up view application button if it exists
                if (elements.viewApplicationBtn) {
                    // Remove any existing event listeners
                    const newBtn = elements.viewApplicationBtn.cloneNode(true);
                    elements.viewApplicationBtn.parentNode.replaceChild(newBtn, elements.viewApplicationBtn);
                    
                    // Add new event listener
                    newBtn.addEventListener('click', () => {
                        window.location.href = `admin-view-application.html?id=${applicationDetails.application_id}`;
                    });
                }
            }
        } else {
            elements.verificationStatus.innerText = 'Not Verified';
            elements.verificationStatusBadge.classList.add('not-verified');
            elements.verificationStatusBadge.classList.remove('verified');
            elements.verificationStatusIcon.className = 'fas fa-times-circle';
            
            // Hide verified users section if it exists
            if (elements.verifiedUsersSection) {
                elements.verifiedUsersSection.style.display = 'none';
            }
        }
    }
    
    // Fill in all profile details if elements exist
    if (elements.profileSectionFullName) {
        elements.profileSectionFullName.innerText = `${applicationDetails.first_name} ${applicationDetails.middle_name ? applicationDetails.middle_name + ' ' : ''}${applicationDetails.last_name} ${applicationDetails.qualifier === 'none' ? '' : applicationDetails.qualifier}`;
    }
    
    if (elements.profileSectionEmail) {
        elements.profileSectionEmail.innerText = applicationDetails.email || 'N/A';
    }
    
    if (elements.profileSectionPhone) {
        elements.profileSectionPhone.innerText = applicationDetails.phone || 'N/A';
    }
    
    // Construct full address
    if (elements.profileSectionFullAddress) {
        const addressParts = [
            applicationDetails.house_number_building_name,
            applicationDetails.street_name,
            applicationDetails.subdivision_barangay,
            applicationDetails.city_municipality,
            applicationDetails.province
        ].filter(Boolean); // Remove empty parts
        elements.profileSectionFullAddress.innerText = addressParts.join(', ') || 'N/A';
    }
    
    // Format birthdate
    if (elements.profileSectionBirthdate) {
        const birthdate = applicationDetails.birthdate ? new Date(applicationDetails.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        elements.profileSectionBirthdate.innerText = birthdate;
    }
    
    // Set other simple profile fields if they exist
    if (elements.profileSectionSex) elements.profileSectionSex.innerText = capitalizeFirstLetter(applicationDetails.sex) || 'N/A';
    if (elements.profileSectionCivilStatus) elements.profileSectionCivilStatus.innerText = capitalizeFirstLetter(applicationDetails.civil_status) || 'N/A';
    if (elements.profileSectionNationality) elements.profileSectionNationality.innerText = capitalizeFirstLetter(applicationDetails.nationality) || 'N/A';
    if (elements.profileSectionBirthplace) elements.profileSectionBirthplace.innerText = capitalizeFirstLetter(applicationDetails.birthplace) || 'N/A';
    if (elements.profileSectionHeight) elements.profileSectionHeight.innerText = applicationDetails.height ? `${applicationDetails.height} cm` : 'N/A';
    if (elements.profileSectionWeight) elements.profileSectionWeight.innerText = applicationDetails.weight ? `${applicationDetails.weight} kg` : 'N/A';
    if (elements.profileSectionComplexion) elements.profileSectionComplexion.innerText = capitalizeFirstLetter(applicationDetails.complexion) || 'N/A';
    if (elements.profileSectionBloodType) elements.profileSectionBloodType.innerText = applicationDetails.blood_type || 'N/A';
    if (elements.profileSectionReligion) elements.profileSectionReligion.innerText = capitalizeFirstLetter(applicationDetails.religion) || 'N/A';
    if (elements.profileSectionEducation) elements.profileSectionEducation.innerText = capitalizeFirstLetter(applicationDetails.educational_attainment) || 'N/A';
    if (elements.profileSectionOccupation) elements.profileSectionOccupation.innerText = capitalizeFirstLetter(applicationDetails.occupation) || 'N/A';
    
    // Handle documents table if it exists
    const documentsTableBody = document.getElementById('admin-documents-table-body');
    if (documentsTableBody && applicationDetails.documents && Array.isArray(applicationDetails.documents)) {
        // Clear previous content
        documentsTableBody.innerHTML = '';
        
        if (applicationDetails.documents.length === 0) {
            documentsTableBody.innerHTML = '<tr><td colspan="4">No documents uploaded.</td></tr>';
        } else {
            // Populate documents table
            applicationDetails.documents.forEach(doc => {
                const fileExt = doc.document_path.split('.').pop().toLowerCase();
                let iconClass = 'fa-file';
                
                // Map file extensions to icons
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
                    // Add more file types as needed
                }
                
                // Format date
                const createdDate = new Date(doc.created_at).toLocaleString();
                
                // Create table row
                const rowTemplate = `
                    <tr data-document-path="${doc.document_path}">
                        <td>
                            <div class="doc-preview-icon"><i class="fas ${iconClass}"></i></div>
                            ${capitalizeFirstLetter(doc.document_type)}
                        </td>
                        <td>${createdDate}</td>
                        <td><button class="view-document-btn" id="viewDoc${doc.document_path}">View</button></td>
                    </tr>`;
                documentsTableBody.insertAdjacentHTML('beforeend', rowTemplate);
                
                // Add event listener to view button
                setTimeout(() => {
                    const viewBtn = document.getElementById(`viewDoc${doc.document_path}`);
                    if (viewBtn) {
                        viewBtn.addEventListener('click', () => {
                            viewDocument(doc.document_path);
                        });
                    }
                }, 0);
            });
        }
    }
    
    // Load the main application document if available
    const verificationDocPath = applicationDetails.application_document_path;
    if (elements.documentPlaceholder) {
        if (verificationDocPath) {
            viewDocument(verificationDocPath);
        } else {
            // Display a message if no document is available
            elements.documentPlaceholder.innerHTML = `
                <div class="no-document-message">
                    <i class="fas fa-file-excel"></i>
                    <p>No primary document available. Please check the uploaded documents list.</p>
                </div>
            `;
        }
    }
    
    // Display the modal
    userProfileModal.style.display = 'block';
}

// Function to set up modal close functionality
function setupModalCloseHandlers() {
    const userProfileModal = document.getElementById('modal-overlay');
    const userProfileModalCloseBtn = document.getElementById('close-modal-btn');
    
    if (userProfileModal && userProfileModalCloseBtn) {
        userProfileModalCloseBtn.addEventListener('click', function () {
            userProfileModal.style.display = 'none';
            const documentControls = document.getElementById('document-controls');
            if (documentControls) {
                documentControls.style.display = 'none';
            }
        });
    }
}

// Export all functions and variables globally
window.applicationUtils = applicationUtils;
window.parseDate = parseDate;
window.capitalizeFirstLetter = capitalizeFirstLetter;
window.fetchApplicationDetails = fetchApplicationDetails;
window.fetchApplicationRequests = fetchApplicationRequests;
window.insertApplicationDocument = insertApplicationDocument;
window.displayDocument = displayDocument;
window.viewDocument = viewDocument;
window.setupImageControls = setupImageControls;
window.handleAdminAction = handleAdminAction;
window.createApplicationRow = createApplicationRow;
window.openUserProfileModal = openUserProfileModal;
window.setupModalCloseHandlers = setupModalCloseHandlers;

// Auto-setup modal handlers when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupModalCloseHandlers();
});
