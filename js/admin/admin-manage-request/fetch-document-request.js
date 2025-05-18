document.addEventListener("DOMContentLoaded", function () {
    const totalRequestsValue = document.getElementById("total-requests-value");
    const pendingRequestsValue = document.getElementById("pending-requests-value");
    const approvedRequestsValue = document.getElementById("approved-requests-value");
    const rejectedRequestsValue = document.getElementById("rejected-requests-value");

    const requestTableBody = document.getElementById("request-table-body");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeModalBtn = document.getElementById("close-modal-btn");

    let currentUserId = null, currentReqId = null;

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

    function addRequestRow(reqId, fName, lName, docType, status, payment, updateOn, dateSubmitted) {
        let rowTemplate = `
                                <tr>
                                    <td>REQ-${reqId}</td>
                                    <td>${fName} ${lName}</td>
                                    <td>${docType}</td>
                                    <td><span class="status-badge status-${status}">${status}</span></td>
                                    <td>₱${payment}</td>
                                    <td>${parseDate(updateOn)}</td>
                                    <td>${parseDate(dateSubmitted)}</td>
                                    <td>
                                        <button class="view-btn" id="view${reqId}">View</button>
                                    </td>
                                </tr>
        `;
        requestTableBody.insertAdjacentHTML('beforeend', rowTemplate);
        const viewBtn = document.getElementById(`view${reqId}`);
        viewBtn.addEventListener("click", function () {
            getRequestDetails(reqId);
        });
    }

    async function getRequestDetails(reqId) {
        let userId = null;
        await fetch('php/services/get-requests.php?action=getRequest&request_id=' + reqId)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Request data received:", data);
                    const requestData = data.data;
                    userId = requestData.user_id;
                    currentUserId = userId;
                    currentReqId = reqId;

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
                    document.getElementById("document-submission-date").textContent = parseDate(requestData.created_at);
                    document.getElementById("document-updated-on").textContent = parseDate(requestData.updated_at);

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
                                fileSize.textContent = formatFileSize(blob.size);

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

                                    // No preview button for PDFs, only download option
                                    // The download button is already handled outside this conditional
                                } else {
                                    // Show icon for other file types
                                    filePreviewName.textContent = extractedFileName;
                                    filePreviewIcon.style.display = 'flex';
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
                    document.getElementById("registered-on-title").textContent = parseDate(userData.created_at);

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
                        document.getElementById("verification-date").textContent = parseDate(userData.verification_date);
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
                    document.getElementById("profile-section-birthdate").textContent = userData.date_of_birth ? parseDate(userData.date_of_birth) : "N/A";
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
                    getVerificationDocuments(userData.user_id);

                    // Display the modal
                    modalOverlay.style.display = "block";
                }
            });
    }

    function showUploadMessage(message, type) {
        const uploadStatus = document.getElementById("upload-status");
        // Remove any file preview
        const existingPreviews = uploadStatus.querySelectorAll('.file-preview');
        existingPreviews.forEach(preview => preview.remove());
        uploadStatus.className = "upload-status " + type;
        if (type === "loading") {
            uploadStatus.innerHTML = `
                <div class="spinner"></div>
                <p>${message}</p>
            `;
        } else {
            uploadStatus.innerHTML = `<p>${message}</p>`;
            if (type === "success" || type === "error") {
                setTimeout(() => {
                    uploadStatus.innerHTML = "";
                    uploadStatus.className = "upload-status";
                }, 5000);
            }
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        else return (bytes / 1048576).toFixed(1) + " MB";
    }

    closeModalBtn.addEventListener("click", function () {
        modalOverlay.style.display = "none";
    });

    const documentUploadForm = document.getElementById("submit-document-request");
    const uploadStatusElement = document.createElement("div");
    uploadStatusElement.id = "upload-status";
    uploadStatusElement.className = "upload-status";
    documentUploadForm.parentNode.insertBefore(uploadStatusElement, documentUploadForm.nextSibling);

    documentUploadForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!currentUserId || !currentReqId) {
            showUploadMessage("No request selected", "error");
            return;
        }
        const fileInput = documentUploadForm.querySelector('input[type="file"]');
        if (!fileInput || !fileInput.files.length) {
            showUploadMessage("Please select a file to upload", "error");
            return;
        }
        const file = fileInput.files[0];
        if (file.size > 10 * 1024 * 1024) {
            showUploadMessage("File is too large. Maximum size is 10MB", "error");
            return;
        }
        showUploadMessage("Uploading document...", "loading");
        const formData = new FormData(documentUploadForm);
        formData.append("user_id", currentUserId);
        formData.append("request_id", currentReqId);
        formData.append("document_name", document.getElementById("document-name").textContent);
        fetch('php/admin/admin-manage-requests/upload-request-document.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showUploadMessage("Document uploaded successfully!", "success");
                    setTimeout(() => getRequestDetails(currentReqId), 2000);
                } else {
                    showUploadMessage("Failed to upload document: " + (data.message || "Unknown error"), "error");
                }
            })
            .catch(err => {
                console.error(err);
                showUploadMessage("Error uploading document. Please try again.", "error");
            });
    });

    function getVerificationDocuments(userId) {
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

                        let iconClass = "fas fa-file-alt";

                        switch (fileExtension) {
                            case 'pdf':
                                iconClass = "fas fa-file-pdf";
                                break;
                            case 'jpeg':
                            case 'jpg':
                            case 'png':
                            case 'gif':
                                iconClass = "fas fa-file-image";
                                break;
                            case 'doc':
                            case 'docx':
                                iconClass = "fas fa-file-word";
                                break;
                            case 'xls':
                            case 'xlsx':
                                iconClass = "fas fa-file-excel";
                                break;
                            case 'ppt':
                            case 'pptx':
                                iconClass = "fas fa-file-powerpoint";
                                break;
                            case 'zip':
                            case 'rar':
                                iconClass = "fas fa-file-archive";
                                break;
                            case 'txt':
                                iconClass = "fas fa-file-alt";
                                break;
                            default:
                                iconClass = "fas fa-file";
                        }

                        let documentRowTemplate = `
                            <tr>
                                <td>
                                    <div class="doc-preview-icon">
                                        <i class="${iconClass}"></i>
                                    </div>
                                    ${fileTypeName}
                                </td>
                                <td>${doc.created_at}</td>
                                <td><button class="view-document-btn" id="view-doc-${documentId}">View</button></td>
                            </tr>`;
                        documentsTableBody.insertAdjacentHTML('beforeend', documentRowTemplate);
                        const viewDocumentBtn = document.getElementById(`view-doc-` + documentId);
                        viewDocumentBtn.addEventListener("click", () => verificationDocumentPreview(filePath));
                    });
                }
            })
    }

    function verificationDocumentPreview(filePath) {
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
                    setupImageControls(img);

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
                    icon.className = "fas fa-file";
                    filePreviewContainer.appendChild(icon);

                    // Hide control buttons for other file types
                    document.getElementById('document-controls').style.display = 'none';
                }
            });
    }

    // Function to handle image control operations (zoom, rotate, etc.)
    function setupImageControls(imageElement) {
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
        zoomInBtn.addEventListener('click', () => {
            scale += 0.1;
            applyTransform();
        });

        // Zoom out
        zoomOutBtn.addEventListener('click', () => {
            scale = Math.max(0.1, scale - 0.1);
            applyTransform();
        });

        // Rotate
        rotateBtn.addEventListener('click', () => {
            rotation += 90;
            if (rotation >= 360) rotation = 0;
            applyTransform();
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            scale = 1;
            rotation = 0;
            applyTransform();
        });

        // Remove existing event listeners when setting up new ones
        return () => {
            zoomInBtn.removeEventListener('click', applyTransform);
            zoomOutBtn.removeEventListener('click', applyTransform);
            rotateBtn.removeEventListener('click', applyTransform);
            resetBtn.removeEventListener('click', applyTransform);
        };
    }

    function fetchRequestHistory() {
        fetch('php/admin/admin-manage-requests/fetch-user-document-request.php')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    totalRequestsValue.innerText = data.total_requests;
                    pendingRequestsValue.innerText = data.total_pending_requests;
                    approvedRequestsValue.innerText = data.total_approved_requests;
                    rejectedRequestsValue.innerText = data.total_rejected_requests;

                    requestTableBody.innerHTML = "";

                    data.requests.forEach(request => {
                        const reqId = request.request_id;
                        const fName = request.first_name;
                        const lName = request.last_name;
                        const docType = request.document_type_name;
                        const status = request.status;
                        const payment = request.payment_amount;

                        const updateOn = request.updated_at;
                        const dateSubmitted = request.created_at;

                        addRequestRow(reqId, fName, lName, docType, status, payment, updateOn, dateSubmitted);
                    });

                } else {
                    console.error("Failed to fetch request history.");
                }
            })
            .catch(error => {
                console.error("Error fetching request history:", error);
            });
    }

    fetchRequestHistory();
    setInterval(fetchRequestHistory, 60000); // Refresh every 60 seconds

});