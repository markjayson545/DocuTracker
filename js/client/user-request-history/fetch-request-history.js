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

        // TODO: parse the document path and display the file name
        // Document Preview
        const documentFileNameValue = document.getElementById("modal-document-file-name");
        const documentFileSizeValue = document.getElementById("modal-document-file-size");

        const documentFileStatusContainer = document.getElementById("modal-document-status-container");
        const documentFileStatusIconValue = document.getElementById("modal-document-status-icon");
        const documentFileStatusTextValue = document.getElementById("modal-document-status-text");
        // const documentFilePathValue = document.getElementById("modal-document-file-path");

        // Request Timeline
        const requestTimelineContainerReqSubmitted = document.getElementById("timeline-container-request-submitted");
        const requestTimelineContainerPaymentReceived = document.getElementById("timeline-container-payment-received");
        const requestTimelineContainerProcessingStarted = document.getElementById("timeline-container-processing");
        const requestTimelineContainerReadyToDownload = document.getElementById("timeline-container-ready-to-download");

        const requestSubmittedValue = document.getElementById("timeline-request-submitted");
        const paymentReceived = document.getElementById("timeline-payment-received");
        const processingStarted = document.getElementById("timeline-processing-date");
        const readyToDownload = document.getElementById("timeline-ready-to-download");

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
                console.log(data);
                if (data.success) {
                    const requestDetails = data.data.request_details[0];
                    console.log(requestDetails);
                    requestIdValue.innerText = ('REQ-' + requestDetails.request_id);
                    documentTypeValue.innerText = requestDetails.document_type;
                    dateRequestedValue.innerText = requestDetails.created_at;
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

                    // TODO: Implement the logic to display the file name, and download link button
                    const fileName = requestDetails.document_type + ' - REQ' + requestDetails.request_id + '.pdf'; // Temporary file name
                    if (requestDetails.document_path) {
                        documentFileNameValue.innerText = fileName;
                        documentFileStatusIconValue.classList.remove('fa-clock');
                        documentFileStatusIconValue.classList.add('fa-check');
                        documentFileStatusTextValue.innerText = 'File Available';
                        documentFileStatusContainer.classList.remove('status-pending');
                        documentFileStatusContainer.classList.add('status-approved');
                    } else if (requestDetails.status === 'pending') {
                        documentFileNameValue.innerText = 'No file available';
                        documentFileSizeValue.innerText = '--.--.MB'; // Temporary file size
                        documentFileStatusTextValue.innerText = 'File Not Available';
                        // documentFilePathValue.href = '#';
                    } else {
                        documentFileNameValue.innerText = 'No file available';
                        documentFileStatusIconValue.classList.remove('fa-clock');
                        documentFileStatusIconValue.classList.add('fa-times');
                        documentFileStatusTextValue.innerText = 'File Not Available';
                        documentFileStatusContainer.classList.remove('status-pending');
                        documentFileStatusContainer.classList.add('status-rejected');
                    }

                    // TODO: Implement the request timeline
                    // Incomplete Implementation
                    const requestHistory = data.data.request_history;
                    if (requestHistory[0]){
                        // Created
                        requestTimelineContainerReqSubmitted.classList.add('active');
                    } 
                    if (requestHistory[1]){
                        // Payment Received
                        requestTimelineContainerReqSubmitted.classList.remove('active');
                        requestTimelineContainerReqSubmitted.classList.add('complete');
                        requestTimelineContainerPaymentReceived.classList.add('active');
                    }
                    if (requestHistory[2]){
                        // Processing Started
                        requestTimelineContainerPaymentReceived.classList.remove('active');
                        requestTimelineContainerPaymentReceived.classList.add('complete');
                        requestTimelineContainerProcessingStarted.classList.add('active');
                    }
                    if (requestHistory[3]){
                        // Ready to Download
                        requestTimelineContainerProcessingStarted.classList.remove('active');
                        requestTimelineContainerProcessingStarted.classList.add('complete');
                        requestTimelineContainerReadyToDownload.classList.add('complete');
                    }

                    requestDetailsModal.style.display = "block";
                }
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
                                            <button class="download-btn" title="Download File" disabled><i class="fas fa-download"></i></button>
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

    fetchRequestHistory();
    setInterval(fetchRequestHistory, 60000);

});