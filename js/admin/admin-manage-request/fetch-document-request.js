document.addEventListener("DOMContentLoaded", function () {
    const totalRequestsValue = document.getElementById("total-requests-value");
    const pendingRequestsValue = document.getElementById("pending-requests-value");
    const approvedRequestsValue = document.getElementById("approved-requests-value");
    const rejectedRequestsValue = document.getElementById("rejected-requests-value");

    const requestTableBody = document.getElementById("request-table-body");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeModalBtn = document.getElementById("close-modal-btn");

    let currentUserId = null, currentReqId = null;

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
                } else {
                    AdminRequestUtils.showUploadMessage("Failed to upload document: " + (data.message || "Unknown error"), "error", uploadStatusElement);
                }
            })
            .catch(err => {
                console.error(err);
                AdminRequestUtils.showUploadMessage("Error uploading document. Please try again.", "error", uploadStatusElement);
            });
    });

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