document.addEventListener("DOMContentLoaded", function () { 
    const totalRequestsValue = document.getElementById("total-requests-value");
    const pendingRequestsValue = document.getElementById("pending-requests-value");
    const approvedRequestsValue = document.getElementById("approved-requests-value");
    const rejectedRequestsValue = document.getElementById("rejected-requests-value");

    const requestTableBody = document.getElementById("request-table-body");

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
                                    <td>Php${payment}</td>
                                    <td>${parseDate(updateOn)}</td>
                                    <td>${parseDate(dateSubmitted)}</td>
                                    <td>
                                        <button class="view-btn">View</button>
                                    </td>
                                </tr>
        `;
        requestTableBody.innerHTML += rowTemplate;
    }

    function fetchRequestHistory() {
        fetch('php/fetch-user-document-request.php')
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