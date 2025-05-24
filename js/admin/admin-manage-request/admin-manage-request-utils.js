/**
 * Utility functions for admin document request management
 */
const AdminRequestUtils = {
    /**
     * Formats a date into a relative time (e.g., "2 days ago") or a full date string
     * @param {string} date - The date string to format
     * @returns {string} Formatted date string
     */
    parseDate: function(date) {
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
    },

    /**
     * Formats a file size in bytes to a human-readable format
     * @param {number} bytes - The file size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Gets the appropriate FontAwesome icon class based on file type or extension
     * @param {string|File} fileOrExt - Either a File object or a file extension
     * @returns {string} FontAwesome icon class
     */
    getFileIconClass: function(fileOrExt) {
        let fileExtension;
        let fileType = '';
        
        if (typeof fileOrExt === 'string') {
            // If string, treat as extension
            fileExtension = fileOrExt.toLowerCase();
        } else if (fileOrExt instanceof File) {
            // If File object, get extension from name and type
            fileExtension = fileOrExt.name.split('.').pop().toLowerCase();
            fileType = fileOrExt.type;
        } else {
            return 'fas fa-file'; // Default icon
        }

        // Check by file type first if available
        if (fileType) {
            if (fileType.match('image.*')) return 'fas fa-file-image';
            if (fileType === 'application/pdf') return 'fas fa-file-pdf';
            if (fileType.includes('word')) return 'fas fa-file-word';
            if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
            if (fileType.includes('text')) return 'fas fa-file-alt';
        }

        // Otherwise check by extension
        switch (fileExtension) {
            case 'pdf': return 'fas fa-file-pdf';
            case 'jpeg':
            case 'jpg':
            case 'png':
            case 'gif': return 'fas fa-file-image';
            case 'doc':
            case 'docx': return 'fas fa-file-word';
            case 'xls':
            case 'xlsx': return 'fas fa-file-excel';
            case 'ppt':
            case 'pptx': return 'fas fa-file-powerpoint';
            case 'zip':
            case 'rar': return 'fas fa-file-archive';
            case 'txt': return 'fas fa-file-alt';
            default: return 'fas fa-file';
        }
    },

    /**
     * Shows an upload status message with appropriate styling
     * @param {string} message - The message to display
     * @param {string} type - Message type ('loading', 'success', 'error')
     * @param {HTMLElement} [statusElement] - The element to show the message in
     */
    showUploadMessage: function(message, type, statusElement) {
        if (!statusElement) {
            statusElement = document.getElementById("upload-status");
        }
        
        // Remove any file preview
        const existingPreviews = statusElement.querySelectorAll('.file-preview');
        existingPreviews.forEach(preview => preview.remove());
        
        statusElement.className = "upload-status " + type;
        if (type === "loading") {
            statusElement.innerHTML = `
                <div class="spinner"></div>
                <p>${message}</p>
            `;
        } else {
            statusElement.innerHTML = `<p>${message}</p>`;
            if (type === "success" || type === "error") {
                setTimeout(() => {
                    statusElement.innerHTML = "";
                    statusElement.className = "upload-status";
                }, 5000);
            }
        }
    },

    /**
     * Sets up image controls for zoom, rotate, and reset
     * @param {HTMLImageElement} imageElement - The image element to control
     * @returns {Function} Cleanup function to remove event listeners
     */
    setupImageControls: function(imageElement) {
        // Get control buttons
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const rotateBtn = document.getElementById('rotate-btn');
        const resetBtn = document.getElementById('reset-btn');

        // Track image transformation state
        let scale = 1;
        let rotation = 0;

        // Apply transformations function
        const applyTransform = () => {
            imageElement.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            // Add transition for smooth transformation
            imageElement.style.transition = 'transform 0.3s ease';
        };

        // Zoom in
        const zoomIn = () => {
            scale += 0.1;
            applyTransform();
        };

        // Zoom out
        const zoomOut = () => {
            scale = Math.max(0.1, scale - 0.1);
            applyTransform();
        };

        // Rotate
        const rotate = () => {
            rotation += 90;
            if (rotation >= 360) rotation = 0;
            applyTransform();
        };

        // Reset
        const reset = () => {
            scale = 1;
            rotation = 0;
            applyTransform();
        };

        // Add event listeners
        zoomInBtn.addEventListener('click', zoomIn);
        zoomOutBtn.addEventListener('click', zoomOut);
        rotateBtn.addEventListener('click', rotate);
        resetBtn.addEventListener('click', reset);

        // Return cleanup function
        return () => {
            zoomInBtn.removeEventListener('click', zoomIn);
            zoomOutBtn.removeEventListener('click', zoomOut);
            rotateBtn.removeEventListener('click', rotate);
            resetBtn.removeEventListener('click', reset);
        };
    },
    
    /**
     * Fetches and displays details for a document request
     * @param {number} reqId - The request ID to fetch
     * @param {Function} onUserIdRetrieved - Callback to pass the user ID once retrieved
     * @returns {Promise<void>}
     */
    getRequestDetails: async function(reqId, onUserIdRetrieved) {
        let userId = null;
        await fetch('php/services/get-requests.php?action=getRequest&request_id=' + reqId)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Request data received:", data);
                    const requestData = data.data;
                    userId = requestData.user_id;
                    
                    // Call the callback with the retrieved user ID and request ID
                    if (typeof onUserIdRetrieved === 'function') {
                        onUserIdRetrieved(userId, reqId);
                    }

                    // Populate document request details in the sidebar
                    document.getElementById("document-name").textContent = requestData.document_name || "N/A";

                    // Update status with appropriate class
                    const statusElement = document.getElementById("document-status");
                    statusElement.textContent = requestData.status || "N/A";
                    statusElement.className = "status-highlight status-" + requestData.status.toLowerCase();

                    // Format payment with peso symbol
                    document.getElementById("document-payment").textContent = "₱" + requestData.payment_amount || "N/A";
                    document.getElementById("document-payment-status").textContent = requestData.payment_status || "N/A";
                    document.getElementById("document-payment-method").textContent = requestData.payment_method || "N/A";

                    // Format dates using parseDate function
                    document.getElementById("document-submission-date").textContent = this.parseDate(requestData.created_at);
                    document.getElementById("document-updated-on").textContent = this.parseDate(requestData.updated_at);

                    // Show existing file if any
                    const fileContainer = document.getElementById('existing-file-container');
                    const filePreviewContainer = document.getElementById('document-preview-container');
                    const filePreviewImage = document.getElementById('file-preview-image');
                    const filePreviewPdf = document.getElementById('file-preview-pdf');
                    const filePreviewIcon = document.getElementById('file-preview-icon');
                    const filePreviewName = document.getElementById('file-preview-name');
                    const fileName = document.getElementById('file-name');
                    const fileSize = document.getElementById('file-size');
                    const downloadBtn = document.getElementById('download-btn');
                    const fileErrorMessage = document.getElementById('file-error-message');

                    // Reset all elements
                    filePreviewImage.style.display = 'none';
                    filePreviewPdf.style.display = 'none';
                    filePreviewIcon.style.display = 'none';
                    fileErrorMessage.style.display = 'none';
                    filePreviewContainer.style.display = 'flex';

                    if (requestData.document_path) {
                        fileContainer.style.display = 'block'; // Show container when file exists

                        // Extract filename from path
                        const extractedFileName = requestData.document_path.split('/').pop();
                        fileName.textContent = extractedFileName;

                        // Fetch the document
                        const formData = new FormData();
                        formData.append("document_path", requestData.document_path);
                        fetch("php/services/get-document.php", {
                            method: "POST",
                            body: formData
                        }).then(response => response.blob())
                            .then(blob => {
                                // Create object URL for the blob
                                const fileUrl = URL.createObjectURL(blob);

                                // Update file size
                                fileSize.textContent = this.formatFileSize(blob.size);

                                // Set download link
                                downloadBtn.href = fileUrl;
                                downloadBtn.download = extractedFileName;

                                // Show appropriate preview based on file type
                                if (extractedFileName.match(/\.(jpeg|jpg|png|gif)$/i)) {
                                    // Show image preview for image files
                                    filePreviewImage.src = fileUrl;
                                    filePreviewImage.alt = extractedFileName;
                                    filePreviewImage.style.display = 'block';
                                } else if (extractedFileName.match(/\.(pdf)$/i)) {
                                    // PDF handling - show only icon and filename without preview
                                    filePreviewIcon.style.display = 'flex';
                                    filePreviewIcon.innerHTML = '<i class="fas fa-file-pdf"></i>';
                                    filePreviewName.textContent = extractedFileName;
                                } else {
                                    // Show icon for other file types
                                    filePreviewName.textContent = extractedFileName;
                                    filePreviewIcon.style.display = 'flex';
                                    filePreviewIcon.innerHTML = `<i class="${this.getFileIconClass(extractedFileName)}"></i>`;
                                }
                            })
                            .catch(error => {
                                console.error("Error loading document:", error);
                                filePreviewContainer.style.display = 'none';
                                fileErrorMessage.textContent = 'Error loading document. Please try again.';
                                fileErrorMessage.style.display = 'block';
                            });
                    } else {
                        fileContainer.style.display = 'none'; // Hide container when no file exists
                    }
                } else {
                    console.log("Failed to fetch request details.");
                }
            })
            .catch(error => console.error("Error fetching request details:", error));

        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("action", "getUserInfo");
        await fetch('php/services/get-user-info.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    // Update user profile modal with fetched data
                    console.log("User data received:", data);
                    const userData = data.user;

                    // Update basic profile information
                    document.getElementById("full-name-title").textContent = `${userData.first_name || ''} ${userData.last_name || ''}`;
                    document.getElementById("user-id-title").textContent = userData.user_id;
                    document.getElementById("registered-on-title").textContent = this.parseDate(userData.created_at);

                    // Update verification status
                    const verificationStatusBadge = document.getElementById("verification-status-badge");
                    const verificationStatusIcon = document.getElementById("verification-status-icon");
                    const verificationStatus = document.getElementById("verification-status");
                    const verifiedUsersSection = document.getElementById("verified-users-section");

                    if (userData.is_verified) {
                        verificationStatus.textContent = "Verified";
                        verificationStatusIcon.className = "fas fa-check-circle";
                        verificationStatusBadge.classList.add("verified");
                        verifiedUsersSection.style.display = "block";
                        document.getElementById("verification-date").textContent = this.parseDate(userData.verification_date);
                        document.getElementById("verified-by").textContent = userData.verified_by || "System";
                    } else {
                        verificationStatus.textContent = "Unverified";
                        verificationStatusIcon.className = "fas fa-times-circle";
                        verificationStatusBadge.classList.add("unverified");
                        verifiedUsersSection.style.display = "none";
                    }

                    // Update personal information
                    document.getElementById("profile-section-full-name").textContent = `${userData.first_name} ${userData.middle_name || ''} ${userData.last_name} ${(userData.qualifier === 'none') ? '' : userData.qualifier || ''}`.trim();
                    document.getElementById("profile-section-email").textContent = userData.email;
                    document.getElementById("profile-section-phone").textContent = userData.phone;
                    document.getElementById("profile-section-full-address").textContent =
                        `${userData.house_number || ''} ${userData.street || ''}, ${userData.barangay}, ${userData.city}, ${userData.province}`.trim();
                    document.getElementById("profile-section-birthdate").textContent = userData.date_of_birth ? this.parseDate(userData.date_of_birth) : "N/A";
                    document.getElementById("profile-section-sex").textContent = userData.sex || "N/A";
                    document.getElementById("profile-section-civil-status").textContent = userData.civil_status || "N/A";
                    document.getElementById("profile-section-nationality").textContent = userData.nationality || "N/A";
                    document.getElementById("profile-section-birthplace").textContent = userData.birth_place || "N/A";
                    document.getElementById("profile-section-height").textContent = userData.height || "N/A";
                    document.getElementById("profile-section-weight").textContent = userData.weight || "N/A";
                    document.getElementById("profile-section-complexion").textContent = userData.complexion || "N/A";
                    document.getElementById("profile-section-blood-type").textContent = userData.blood_type || "N/A";
                    document.getElementById("profile-section-religion").textContent = userData.religion || "N/A";
                    document.getElementById("profile-section-education").textContent = userData.education || "N/A";
                    document.getElementById("profile-section-occupation").textContent = userData.occupation || "N/A";

                    // Fetch Verification Documents
                    this.getVerificationDocuments(userData.user_id);

                    // Display the modal
                    document.getElementById("modal-overlay").style.display = "block";
                }
            });
    },

    /**
     * Fetches verification documents for a user
     * @param {number} userId - The user ID to fetch documents for
     */
    getVerificationDocuments: function(userId) {
        const formData = new FormData();
        formData.append("user_id", userId);
        fetch('php/services/get-verification-documents.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    const documents = data.documents;
                    const documentsTableBody = document.getElementById("admin-documents-table-body");
                    documentsTableBody.innerHTML = ""; // Clear existing rows

                    documents.forEach(doc => {
                        const filePath = doc.document_path;
                        const documentId = doc.document_id;
                        const fileExtension = doc.document_path.split('.').pop().toLowerCase();
                        const fileTypeName = doc.document_type;

                        let documentRowTemplate = `
                            <tr>
                                <td>
                                    <div class="doc-preview-icon">
                                        <i class="${this.getFileIconClass(fileExtension)}"></i>
                                    </div>
                                    ${fileTypeName}
                                </td>
                                <td>${doc.created_at}</td>
                                <td><button class="view-document-btn" id="view-doc-${documentId}">View</button></td>
                            </tr>`;
                        documentsTableBody.insertAdjacentHTML('beforeend', documentRowTemplate);
                        const viewDocumentBtn = document.getElementById(`view-doc-` + documentId);
                        viewDocumentBtn.addEventListener("click", () => this.verificationDocumentPreview(filePath));
                    });
                }
            });
    },

    /**
     * Shows a preview of a verification document
     * @param {string} filePath - Path to the document to preview
     */
    verificationDocumentPreview: function(filePath) {
        const formData = new FormData();
        formData.append("document_path", filePath);
        fetch("php/services/get-document.php", {
            method: "POST",
            body: formData
        }).then(response => response.blob())
            .then(blob => {
                const fileUrl = URL.createObjectURL(blob);
                const filePreviewContainer = document.getElementById('document-placeholder');

                filePreviewContainer.innerHTML = ""; // Clear previous content

                const downloadBtn = document.getElementById('download-verification-btn');
                downloadBtn.href = fileUrl;
                downloadBtn.download = filePath.split('/').pop(); // Get filename from path
                downloadBtn.addEventListener('click', (e) => {
                    // This ensures download works in all browsers
                    e.preventDefault();
                    const a = document.createElement('a');
                    a.href = fileUrl;
                    a.download = filePath.split('/').pop();
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
                
                if (filePath.match(/\.(jpeg|jpg|png|gif)$/i)) {
                    const img = document.createElement('img');
                    img.src = fileUrl;
                    img.alt = "Document Preview";
                    img.style.scale = "0.6";
                    img.style.maxWidth = "100%";
                    filePreviewContainer.appendChild(img);

                    // Set up image controls for the newly created image
                    this.setupImageControls(img);

                    // Show control buttons for images
                    document.getElementById('document-controls').style.display = 'flex';
                } else if (filePath.match(/\.(pdf)$/i)) {
                    const pdfEmbed = document.createElement('embed');
                    pdfEmbed.src = fileUrl;
                    pdfEmbed.type = "application/pdf";
                    pdfEmbed.style.width = "100%";
                    pdfEmbed.style.height = "500px";
                    filePreviewContainer.appendChild(pdfEmbed);

                    const downloadBtn = document.createElement('a');
                    downloadBtn.href = fileUrl;
                    downloadBtn.download = filePath.split('/').pop();
                    downloadBtn.textContent = "Download PDF";
                    downloadBtn.className = "download-btn";
                    filePreviewContainer.appendChild(downloadBtn);
                    filePreviewContainer.style.display = 'block';

                    // Hide control buttons for PDFs since most controls don't apply
                    document.getElementById('document-controls').style.display = 'none';
                }
                else {
                    const icon = document.createElement('i');
                    icon.className = this.getFileIconClass(filePath.split('.').pop().toLowerCase());
                    filePreviewContainer.appendChild(icon);

                    // Hide control buttons for other file types
                    document.getElementById('document-controls').style.display = 'none';
                }
            });
    },

    /**
     * Fetch requests with pagination and search
     * @param {number} page - The page number to fetch
     * @param {string} searchTerm - The search term to filter by
     * @returns {Promise<Array>} - Array of request objects
     */
    fetchRequests: async function(page = 1, searchTerm = '') {
        try {
            let url = 'php/admin/admin-manage-requests/fetch-user-document-request.php';
            
            // Add query parameters for pagination and search
            const params = new URLSearchParams();
            if (page > 1) params.append('page', page);
            
            // Handle the case where user enters "REQ-123" instead of just "123"
            if (searchTerm) {
                const cleanedSearch = searchTerm.replace(/^REQ-/i, '');
                params.append('search', cleanedSearch);
            }
            
            // Append parameters to URL if they exist
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                // Store pagination data for access elsewhere
                this.pagination = data.pagination;
                
                // Store request stats
                this.stats = {
                    totalRequests: data.total_requests,
                    pendingRequests: data.total_pending_requests,
                    approvedRequests: data.total_approved_requests,
                    rejectedRequests: data.total_rejected_requests
                };
                
                return data.requests;
            } else {
                throw new Error(data.message || 'Failed to fetch requests');
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            throw error;
        }
    },

    /**
     * Create pagination HTML
     * @param {HTMLElement} container - The container for pagination controls
     * @param {Function} callback - Callback function when page is clicked
     * @returns {void}
     */
    renderPagination: function(container, callback) {
        if (!container || !this.pagination) return;
        
        const { current_page, total_pages } = this.pagination;
        
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
        
        container.innerHTML = paginationHTML;
        
        // Add event listeners to pagination buttons
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            if (!btn.disabled && btn.dataset.page) {
                btn.addEventListener('click', function() {
                    if (typeof callback === 'function') {
                        callback(parseInt(this.dataset.page));
                    }
                });
            }
        });
    },

    /**
     * Add debounce function to limit API calls during real-time search
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};
