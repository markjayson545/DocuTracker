document.addEventListener("DOMContentLoaded", function () {
    const totalRequestsValue = document.getElementById("total-requests-count");
    const pendingRequestsValue = document.getElementById("pending-requests-count");
    const approvedRequestsValue = document.getElementById("approved-requests-count");
    const rejectedRequestsValue = document.getElementById("rejected-requests-count");

    const requestTableBody = document.getElementById("request-history-body");

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
                                            <button class="view-btn" title="View Details"><i class="fas fa-eye"></i></button>
                                            <button class="download-btn" title="Download Receipt" disabled><i class="fas fa-download"></i></button>
                                        </div>
                                    </td>
                                </tr>
        `;
        requestTableBody.innerHTML += rowTemplate;
    }

    function fetchRequestHistory() {
        fetch('php/fetch-user-request-history.php')
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