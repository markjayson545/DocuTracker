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

    function insertModalContent(reqId, docType, dRequested, lastUpdated, status, paymentMode, pAmount, pStatus, documentPath) {

    }

    function showDetailsModal(reqId) {
        const requestIdValue = document.getElementById("modal-request-id");
        const documentTypeValue = document.getElementById("modal-document-type");

        const dateRequestedValue = document.getElementById("modal-date-requested");
        const lastUpdatedValue = document.getElementById("modal-last-updated");

        const modeOfPaymentValue = document.getElementById("modal-payment-mode-of-payment");
        const paymentAmountValue = document.getElementById("modal-payment-amount");
        const paymentStatusValue = document.getElementById("modal-payment-status");

        // TODO: parse the document path and display the file name
        const documentFileNameValue = document.getElementById("modal-document-file-name");
        const documentFileSizeValue = document.getElementById("modal-document-file-size");
        const documentFileStatusIconValue = document.getElementById("modal-document-status-icon");

        // const documentFilePathValue = document.getElementById("modal-document-file-path");


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
                    paymentAmountValue.innerText = requestDetails.amount;

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
                        documentFilePathValue.href = requestDetails.document_path;
                    } else {
                        documentFileNameValue.innerText = 'No file available';
                        // documentFilePathValue.href = '#';
                    }

                    // TODO: Implement the request timeline

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
                                    <td>Php${payment} <span class="payment-status paid">${pStatus}</span></td>
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