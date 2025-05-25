document.addEventListener('DOMContentLoaded', function () {
    const totalRequestCount = document.getElementById('total-requests-count');
    const totalPendingApprovalCount = document.getElementById('pending-approval-count');
    const totalRevenueCount = document.getElementById('total-revenue-value');
    const totalUsersCount = document.getElementById('total-users-count');
    const totalPendingApplicationCount = document.getElementById('pending-applications-count');
    const totalVerifiedUserCount = document.getElementById('verified-users-count');

    const systemNotificationContainer = document.getElementById('system-notification-container');

    const recentRequestsContainer = document.getElementById('recent-requests-table-body');

    function addRequestToTable(reqId, firstName, lastName, docType, status, updateDate, dateRequested, userId) {
        // Helper function to safely capitalize a string
        const capitalize = (str) => {
            return str && typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        };
        
        let formattedUpdateDate = 'N/A';
        if (updateDate) {
            const now = new Date();
            const updateDateTime = new Date(updateDate);
            const diffMs = now - updateDateTime;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHrs = Math.floor(diffMin / 60);
            const diffDays = Math.floor(diffHrs / 24);
            
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
        }

        let formattedRequestDate = dateRequested ? new Date(dateRequested).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A';

        let requestTemplate = `
                <tr onclick="redirectToRequestDetails(${reqId}, ${userId})" style="cursor: pointer;">
                <td>REQ-${reqId || 'N/A'}</td>
                <td>${capitalize(firstName)} ${capitalize(lastName)}</td>
                <td>${docType}</td>
                <td><span class="status-badge status-${status || 'unknown'}">${capitalize(status)}</span></td>
                <td>${formattedUpdateDate}</td>
                <td>${formattedRequestDate}</td>
                </tr>
        `;
        recentRequestsContainer.insertAdjacentHTML('beforeend', requestTemplate);

    }



    function fetchDashboardData() {
        fetch('php/admin/admin-dashboard/fetch-admin-dashboard.php')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched dashboard data:', data);
                if (data.success && data.isAdmin) {
                    totalRequestCount.innerText = data.data.totalRequest;
                    totalPendingApprovalCount.innerText = data.data.totalPendingRequests;
                    totalRevenueCount.innerText = data.data.totalRevenue;
                    totalUsersCount.innerText = data.data.totalUsers;
                    totalPendingApplicationCount.innerText = data.data.totalPendingApplications;
                    totalVerifiedUserCount.innerText = data.data.totalVerifiedUsers;

                    if (data.data.recentRequests) {
                        recentRequestsContainer.innerHTML = '';
                        data.data.recentRequests.forEach(request => {
                            addRequestToTable(request.request_id, request.first_name, request.last_name, request.document_type_name, request.status, request.updated_at, request.created_at, request.user_id);
                        });
                    }
                } else {
                    alert('You are not authorized to view this page.');
                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 2000);
                }
            });
    }

    fetchDashboardData();
    setInterval(fetchDashboardData, 60000); // Fetch data every 60 seconds

});

function redirectToRequestDetails(requestId, userId) {
    window.location.href = `admin-manage-requests.html?id=${requestId}&userId=${userId}`;
}