document.addEventListener("DOMContentLoaded", function () {
    const totalRequestsValue = document.getElementById("total-requests-value");
    const pendingRequestsValue = document.getElementById("pending-requests-value");
    const approvedRequestsValue = document.getElementById("approved-requests-value");
    const rejectedRequestsValue = document.getElementById("rejected-requests-value");

    const requestTableBody = document.getElementById("request-table-body");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeModalBtn = document.getElementById("close-modal-btn");
    
    // Pagination container reference
    const paginationContainer = document.querySelector('.pagination');

    // Search container references
    const requestSearch = document.querySelector('.request-search input');
    const requestSearchBtn = document.querySelector('.request-search button');

    // Track current page and search
    let currentPage = 1;
    let currentSearch = '';
    let currentUserId = null, currentReqId = null;

    // Setup real-time search with debounce
    if (requestSearch) {
        // Update search placeholder text
        requestSearch.placeholder = "Search by Request ID (e.g., REQ-123), Name, Document Type...";
        
        // Add input event listener with debounce
        requestSearch.addEventListener('input', AdminRequestUtils.debounce(function() {
            currentSearch = requestSearch.value.trim();
            currentPage = 1; // Reset to first page when searching
            fetchRequestData(currentPage, currentSearch);
            
            // Show/hide clear button based on search content
            toggleClearButton();
        }, 500)); // 500ms debounce delay
        
        // Add keydown event listener for Enter key
        requestSearch.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                currentSearch = requestSearch.value.trim();
                currentPage = 1;
                fetchRequestData(currentPage, currentSearch);
            }
        });
        
        // Create and add clear button to search
        const clearButton = document.createElement('button');
        clearButton.innerHTML = '<i class="fas fa-times"></i>';
        clearButton.className = 'search-clear-btn';
        clearButton.title = 'Clear search';
        clearButton.style.display = 'none'; // Initially hidden
        
        // Insert clear button before the search button
        requestSearch.parentNode.insertBefore(clearButton, requestSearchBtn);
        
        // Add event listener to clear button
        clearButton.addEventListener('click', function() {
            requestSearch.value = '';
            currentSearch = '';
            currentPage = 1;
            fetchRequestData(currentPage, '');
            clearButton.style.display = 'none';
        });
        
        // Function to toggle clear button visibility
        function toggleClearButton() {
            if (requestSearch.value.trim() === '') {
                clearButton.style.display = 'none';
            } else {
                clearButton.style.display = 'block';
            }
        }
    }
    
    if (requestSearchBtn) {
        requestSearchBtn.addEventListener('click', function() {
            currentSearch = requestSearch ? requestSearch.value.trim() : '';
            currentPage = 1;
            fetchRequestData(currentPage, currentSearch);
        });
    }

    function addRequestRow(reqId, fName, lName, docType, status, payment, updateOn, dateSubmitted) {
        let rowTemplate = `
            <tr>
                <td>REQ-${reqId}</td>
                <td>${fName} ${lName}</td>
                <td>${docType}</td>
                <td><span class="status-badge status-${status}">${status}</span></td>
                <td>₱${payment}</td>
                <td>${AdminRequestUtils.parseDate(updateOn)}</td>
                <td>${AdminRequestUtils.parseDate(dateSubmitted)}</td>
                <td>
                    <button class="view-btn" id="view${reqId}">View</button>
                </td>
            </tr>
        `;
        requestTableBody.insertAdjacentHTML('beforeend', rowTemplate);
        const viewBtn = document.getElementById(`view${reqId}`);
        viewBtn.addEventListener("click", function () {
            // Call the utility function and pass a callback to receive the user ID
            AdminRequestUtils.getRequestDetails(reqId, (userId, reqId) => {
                currentUserId = userId;
                currentReqId = reqId;
            });
        });
    }

    closeModalBtn.addEventListener("click", function () {
        modalOverlay.style.display = "none";
        document.getElementById("document-placeholder").innerHTML = `                            <i class="fas fa-id-card"></i>
                            <p>No document selected. Click "View" to display a document.</p>
`;
    });

    const documentUploadForm = document.getElementById("submit-document-request");
    const uploadStatusElement = document.createElement("div");
    uploadStatusElement.id = "upload-status";
    uploadStatusElement.className = "upload-status";
    documentUploadForm.parentNode.insertBefore(uploadStatusElement, documentUploadForm.nextSibling);

    documentUploadForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!currentUserId || !currentReqId) {
            AdminRequestUtils.showUploadMessage("No request selected", "error", uploadStatusElement);
            return;
        }
        const fileInput = documentUploadForm.querySelector('input[type="file"]');
        if (!fileInput || !fileInput.files.length) {
            AdminRequestUtils.showUploadMessage("Please select a file to upload", "error", uploadStatusElement);
            return;
        }
        const file = fileInput.files[0];
        if (file.size > 10 * 1024 * 1024) {
            AdminRequestUtils.showUploadMessage("File is too large. Maximum size is 10MB", "error", uploadStatusElement);
            return;
        }
        AdminRequestUtils.showUploadMessage("Uploading document...", "loading", uploadStatusElement);
        const formData = new FormData(documentUploadForm);
        formData.append("user_id", currentUserId);
        formData.append("request_id", currentReqId);
        formData.append("document_name", document.getElementById("document-name").textContent);
        fetch('php/admin/admin-manage-requests/upload-request-document.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    AdminRequestUtils.showUploadMessage("Document uploaded successfully!", "success", uploadStatusElement);
                    setTimeout(() => AdminRequestUtils.getRequestDetails(currentReqId, (userId, reqId) => {
                        currentUserId = userId;
                        currentReqId = reqId;
                    }), 2000);
                    
                    // Refresh request data after successful upload
                    fetchRequestData(currentPage, currentSearch);
                } else {
                    AdminRequestUtils.showUploadMessage("Failed to upload document: " + (data.message || "Unknown error"), "error", uploadStatusElement);
                }
            })
            .catch(err => {
                console.error(err);
                AdminRequestUtils.showUploadMessage("Error uploading document. Please try again.", "error", uploadStatusElement);
            });
    });

    // New function to handle fetching requests with search and pagination
    function fetchRequestData(page = 1, searchTerm = '') {
        // Show loading state
        requestTableBody.innerHTML = '<tr><td colspan="8"><div class="loading-spinner"></div><p>Loading requests...</p></td></tr>';
        
        AdminRequestUtils.fetchRequests(page, searchTerm)
            .then(requests => {
                // Update the stats in the UI
                totalRequestsValue.innerText = AdminRequestUtils.stats.totalRequests;
                pendingRequestsValue.innerText = AdminRequestUtils.stats.pendingRequests;
                approvedRequestsValue.innerText = AdminRequestUtils.stats.approvedRequests;
                rejectedRequestsValue.innerText = AdminRequestUtils.stats.rejectedRequests;

                // Clear the table and add rows
                requestTableBody.innerHTML = "";

                if (!requests || requests.length === 0) {
                    let noResultsMessage = 'No requests found.';
                    
                    // Show more specific message for search results
                    if (currentSearch) {
                        noResultsMessage = `No requests found matching "${currentSearch}".`;
                    }
                    
                    requestTableBody.innerHTML = `<tr style="color: red; text-align: center;"><td colspan="8">${noResultsMessage}</td></tr>`;
                } else {
                    requests.forEach(request => {
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
                }
                
                // Render pagination
                if (paginationContainer) {
                    AdminRequestUtils.renderPagination(paginationContainer, (newPage) => {
                        currentPage = newPage;
                        fetchRequestData(currentPage, currentSearch);
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching request data:", error);
                requestTableBody.innerHTML = `<tr><td colspan="8">Error loading requests: ${error.message}</td></tr>`;
            });
    }

    // Initial data load
    fetchRequestData(currentPage, currentSearch);
    
    // Set up less frequent refresh to avoid excessive API calls
    const refreshInterval = 5 * 60 * 1000; // 5 minutes
    setInterval(() => {
        fetchRequestData(currentPage, currentSearch);
    }, refreshInterval);
});