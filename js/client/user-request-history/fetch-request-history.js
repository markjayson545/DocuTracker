document.addEventListener("DOMContentLoaded", function () {
    const totalRequestsValue = document.getElementById("total-requests-count");
    const pendingRequestsValue = document.getElementById("pending-requests-count");
    const approvedRequestsValue = document.getElementById("approved-requests-count");
    const rejectedRequestsValue = document.getElementById("rejected-requests-count");

    const requestTableBody = document.getElementById("request-history-body");

    const requestDetailsModal = document.getElementById("document-request-modal");
    const closeRequestDetailsModal = document.getElementById("close-request-modal");

    closeRequestDetailsModal.addEventListener("click", function () {
        requestDetailsModal.style.display = "none";
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

    function showDetailsModal(reqId) {

        // Request Information
        const requestIdValue = document.getElementById("modal-request-id");
        const documentTypeValue = document.getElementById("modal-document-type");

        // Dates
        const dateRequestedValue = document.getElementById("modal-date-requested");
        const lastUpdatedValue = document.getElementById("modal-last-updated");

        // Payment Details
        const modeOfPaymentValue = document.getElementById("modal-payment-mode-of-payment");
        const paymentAmountValue = document.getElementById("modal-payment-amount");
        const paymentStatusValue = document.getElementById("modal-payment-status");

        // Document Preview
        const documentFileNameValue = document.getElementById("modal-document-file-name");
        const documentFileSizeValue = document.getElementById("modal-document-file-size");

        const documentFileStatusContainer = document.getElementById("modal-document-status-container");
        const documentFileStatusIconValue = document.getElementById("modal-document-status-icon");
        const documentFileStatusTextValue = document.getElementById("modal-document-status-text");

        const data = new FormData();
        data.append('request_id', reqId);
        fetch('php/client/user-request-history/fetch-document-request-details.php',
            {
                method: 'POST',
                body: data
            }
        )
            .then(response => response.json())
            .then(data => {
                console.log('Request Details: ' + data);
                if (data.success) {
                    const requestDetails = data.data.request_details[0];
                    console.log(requestDetails);
                    requestIdValue.innerText = ('REQ-' + requestDetails.request_id);
                    documentTypeValue.innerText = requestDetails.document_type;
                    dateRequestedValue.innerText = new Date(requestDetails.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    lastUpdatedValue.innerText = parseDate(requestDetails.updated_at);
                    modeOfPaymentValue.innerText = requestDetails.mode_of_payment;
                    paymentAmountValue.innerText = '₱' + requestDetails.amount;

                    paymentStatusValue.classList.remove('paid');
                    if (requestDetails.payment_status === 'pending') {
                        paymentStatusValue.classList.add('pending');
                        paymentStatusValue.innerText = 'Pending';
                    } else if (requestDetails.payment_status === 'paid') {
                        paymentStatusValue.classList.add('paid');
                        paymentStatusValue.innerText = 'Paid';
                    }

                    const fileName = requestDetails.document_type + ' - REQ' + requestDetails.request_id + '.pdf'; // Temporary file name
                    if (requestDetails.document_path) {
                        documentFileNameValue.innerText = fileName;
                        documentFileStatusIconValue.classList.remove('fa-clock');
                        documentFileStatusIconValue.classList.add('fa-check');
                        documentFileStatusTextValue.innerText = 'File Available';
                        documentFileStatusContainer.classList.remove('status-pending');
                        documentFileStatusContainer.classList.add('status-approved');

                        // Attempt to load and display document preview
                        fetchDocumentPreview(requestDetails.document_path)
                            .catch(error => {
                                console.error('Error loading document preview:', error);
                                // If preview fails, we still have the basic file info displayed
                            });

                        btnDownload = document.getElementById("download-document-btn");
                        btnDownload.disabled = false;
                        btnDownload.addEventListener('click', function () {
                            downloadDocument(requestDetails.document_path);
                        });

                    } else if (requestDetails.status === 'pending') {
                        documentFileNameValue.innerText = 'No file available';
                        documentFileSizeValue.innerText = '--.--.MB'; // Temporary file size
                        documentFileStatusTextValue.innerText = 'File Not Available';
                        btnDownload = document.getElementById("download-document-btn");
                        btnDownload.disabled = true;

                        // Clear any existing preview
                        const previewContainer = document.getElementById('document-preview-container');
                        if (previewContainer) {
                            previewContainer.innerHTML = '';
                        }
                    } else {
                        documentFileNameValue.innerText = 'No file available';
                        documentFileStatusIconValue.classList.remove('fa-clock');
                        documentFileStatusIconValue.classList.add('fa-times');
                        documentFileStatusTextValue.innerText = 'File Not Available';
                        documentFileStatusContainer.classList.remove('status-pending');
                        documentFileStatusContainer.classList.add('status-rejected');
                        btnDownload = document.getElementById("download-document-btn");
                        btnDownload.disabled = true;

                        // Clear any existing preview
                        const previewContainer = document.getElementById('document-preview-container');
                        if (previewContainer) {
                            previewContainer.innerHTML = '';
                        }
                    }

                    const timelineTable = document.getElementById("timeline-table-body");
                    const timelineData = data.data.request_history;
                    console.log(timelineData);
                    timelineTable.innerHTML = '';
                    timelineData.forEach(timeline => {
                        let icon, statusText, statusClass;

                        // Set appropriate icon and text based on status
                        switch (timeline.status) {
                            case 'created':
                                icon = 'fa-paper-plane';
                                statusText = 'Request Submitted';
                                break;
                            case 'payment_received':
                                icon = 'fa-credit-card';
                                statusText = 'Payment Received';
                                break;
                            case 'processing':
                                icon = 'fa-spinner';
                                statusText = 'Processing Started';
                                break;
                            case 'completed':
                                icon = 'fa-check-circle';
                                statusText = 'File Available For Download';
                                break;
                            case 'updated':
                                icon = 'fa-edit';
                                statusText = 'Request Updated';
                                break;
                            case 'rejected':
                                icon = 'fa-times-circle';
                                statusText = 'Request Rejected';
                                break;
                            default:
                                icon = 'fa-info-circle';
                                statusText = timeline.status.replace('_', ' ');
                        }
                        

                        // Format date
                        const dateFormatted = new Date(timeline.created_at).toLocaleString();

                        const rowTemplate = `
                        <tr>
                            <td><i class="fas ${icon}"></i> ${statusText}</td>
                            <td>${dateFormatted}</td>
                            <td><span class="status-badge status-completed">Completed</span></td>
                        </tr>
                        `;

                        timelineTable.insertAdjacentHTML('beforeend', rowTemplate);
                    });


                    requestDetailsModal.style.display = "block";
                }
            });
    }

    function downloadDocument(docPath) {
        // Extract filename from document path
        const pathParts = docPath.split('/');
        const filename = pathParts[pathParts.length - 1];

        const data = new FormData();
        data.append('document_path', docPath);
        fetch('php/services/client-only-get-document.php',
            {
                method: 'POST',
                body: data
            }).then(response => response.blob())
            .then(blob => {
                // Create a download URL from the blob
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename || 'document.pdf'; // Use parsed filename from path
                document.body.appendChild(a); // Needed for Firefox
                a.click();
                document.body.removeChild(a); // Clean up
                window.URL.revokeObjectURL(url);
            }).catch(error => {
                console.error('Error downloading document:', error);
            });
    }

    async function fetchDocumentPreview(docPath) {
        // Check if document path exists
        if (!docPath) {
            return Promise.reject("No document path provided");
        }

        // Extract filename to determine file type
        const pathParts = docPath.split('/');
        const filename = pathParts[pathParts.length - 1];
        const fileExtension = filename.split('.').pop().toLowerCase();

        const data = new FormData();
        data.append('document_path', docPath);

        return await fetch('php/services/client-only-get-document.php', {
            method: 'POST',
            body: data
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch document');
                }
                return response.blob();
            })
            .then(blob => {
                // Calculate file size for display
                const fileSizeInBytes = blob.size;
                let fileSize;

                if (fileSizeInBytes < 1024) {
                    fileSize = fileSizeInBytes + ' bytes';
                } else if (fileSizeInBytes < 1024 * 1024) {
                    fileSize = (fileSizeInBytes / 1024).toFixed(2) + ' KB';
                } else {
                    fileSize = (fileSizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
                }

                // Update file size display
                const documentFileSizeValue = document.getElementById("modal-document-file-size");
                documentFileSizeValue.innerText = fileSize;

                // Create a preview based on file type
                const previewContainer = document.getElementById('document-preview-container');
                if (!previewContainer) {
                    // Create preview container if it doesn't exist
                    const docPreviewSection = document.querySelector('.document-preview');
                    const newPreviewContainer = document.createElement('div');
                    newPreviewContainer.id = 'document-preview-container';
                    newPreviewContainer.className = 'document-actual-preview';
                    docPreviewSection.appendChild(newPreviewContainer);
                }

                // Clear any existing preview
                const container = document.getElementById('document-preview-container');
                container.innerHTML = '';

                // Create URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create appropriate preview element based on file type
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension)) {
                    // Image preview
                    const img = document.createElement('img');
                    img.src = url;
                    img.className = 'preview-image';
                    img.alt = filename;
                    container.appendChild(img);
                } else if (fileExtension === 'pdf') {
                    // PDF preview (embed if supported by browser)
                    const embed = document.createElement('embed');
                    embed.src = url;
                    embed.type = 'application/pdf';
                    embed.className = 'preview-pdf';
                    container.appendChild(embed);

                    // Fallback link for browsers that don't support PDF embedding
                    const fallbackLink = document.createElement('p');
                    fallbackLink.className = 'pdf-fallback';
                    fallbackLink.innerHTML = 'PDF preview not available in your browser. <a href="' + url + '" target="_blank">Open in new tab</a>';
                    container.appendChild(fallbackLink);
                } else {
                    // Generic file type - show icon only
                    const fileTypeMessage = document.createElement('p');
                    fileTypeMessage.className = 'unsupported-preview';
                    fileTypeMessage.innerHTML = `<i class="fas fa-file"></i> Preview not available for ${fileExtension.toUpperCase()} files`;
                    container.appendChild(fileTypeMessage);
                }

                return url; // Return the URL for potential cleanup later
            });
    }

    function createEventListenerForDetailsButton(btnId, reqId) {
        const detailsBtn = document.getElementById(btnId);
        detailsBtn.addEventListener('click', function () {
            console.log("Details button clicked for btnId:", btnId);
            console.log("Request ID:", reqId);
            showDetailsModal(reqId);
        });
    }

    function addRequestRow(reqId, docType, dRequested, status, payment, pStatus, lastUpdated) {
        let rowTemplate =
            `                       <tr>
                                    <td>REQ-${reqId}</td>
                                    <td>${docType}</td>
                                    <td>${parseDate(dRequested)}</td>
                                    <td><span class="status-badge status-pending">${status}</span></td>
                                    <td>₱${payment} <span class="payment-status paid">${pStatus}</span></td>
                                    <td>${parseDate(lastUpdated)}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="view-btn" title="View Details" id="view-${reqId}"><i class="fas fa-eye"></i></button>
                                        </div>
                                    </td>
                                </tr>
        `;
        requestTableBody.insertAdjacentHTML('beforeend', rowTemplate);
        createEventListenerForDetailsButton('view-' + reqId, reqId);
    }

    function fetchRequestHistory() {
        fetch('php/client/user-request-history/fetch-user-request-history.php')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    totalRequestsValue.innerText = data.data.total_requests;
                    pendingRequestsValue.innerText = data.data.total_pending_requests;
                    approvedRequestsValue.innerText = data.data.total_approved_requests;
                    rejectedRequestsValue.innerText = data.data.total_rejected_requests;

                    requestTableBody.innerHTML = '';
                    data.data.requests.forEach(request => {
                        const reqId = request.request_id;
                        const docType = request.document_type;
                        const dRequested = request.created_at;
                        const status = request.status;
                        const payment = request.amount;
                        const pStatus = request.payment_status;
                        const lastUpdated = request.updated_at;
                        addRequestRow(reqId, docType, dRequested, status, payment, pStatus, lastUpdated);
                    });
                }
            });
    }


    const urlString = window.location.href;
    const url = new URL(urlString);
    const requestId = url.searchParams.get("id");

    if (requestId) {
        showDetailsModal(requestId);
    }

    fetchRequestHistory();
    setInterval(fetchRequestHistory, 60000);
});