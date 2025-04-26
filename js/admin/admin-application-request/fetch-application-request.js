document.addEventListener('DOMContentLoaded', function() {
    const totalApplicationsValue = document.getElementById('total-applications-value');
    const pendingApplicationsValue = document.getElementById('pending-applications-value');
    const underReviewApplicationsValue = document.getElementById('under-review-applications-value');
    const approvedApplicationsValue = document.getElementById('approved-applications-value');
    const rejectedApplicationsValue = document.getElementById('rejected-applications-value');

    const applicationRequestTable = document.getElementById('application-table-body');

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

    function insertApplicationRequestRow(appId, fName, lName, docType, date, status) {
        const formattedStatus = status
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        let rowTemplate = `
                    <tr>
                        <td>APP-${appId}</td>
                        <td>${fName} ${lName}</td>
                        <td>${docType}</td>
                        <td>${parseDate(date)}</td>
                        <td><span class="status-badge status-${status}">${formattedStatus}</span></td>
                        <td class="actions-cell">
                        <button class="verify-btn">Verify</button>
                        <button class="reject-btn">Reject</button>
                        </td>
                    </tr>`;
        applicationRequestTable.innerHTML += rowTemplate;
    }

    function fetchApplicationRequests() {
        fetch('php/admin/admin-manage-applications/fetch-admin-application-request.php')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.success){
                totalApplicationsValue.innerText = data.total_application;
                pendingApplicationsValue.innerText = data.total_pending_application;
                underReviewApplicationsValue.innerText = data.total_under_review_application;
                approvedApplicationsValue.innerText = data.total_approved_application;
                rejectedApplicationsValue.innerText = data.total_rejected_application;

                applicationRequestTable.innerHTML = '';

                data.applications.forEach(application => {
                    const appId = application.application_id;
                    const fName = application.first_name;
                    const lName = application.last_name;
                    const docType = application.document_type;
                    const status = application.status;
                    const date = application.created_at;

                    insertApplicationRequestRow(appId, fName, lName, docType, date, status);
                });

            }
        });
    }

    fetchApplicationRequests();
    setInterval(fetchApplicationRequests, 60000);

});