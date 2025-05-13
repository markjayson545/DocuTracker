/**
 * User Dashboard Data Manager
 * 
 * This script handles fetching and displaying user dashboard data,
 * including document types, statistics, and recent requests.
 */

document.addEventListener("DOMContentLoaded", function () {
    // Get UI elements
    const userNameLiteral = document.getElementById("user-name-literal");
    const totalRequest = document.getElementById("total-request");
    const pendingRequest = document.getElementById("pending-requests");
    const completedRequest = document.getElementById("completed-requests");
    const approvedRequest = document.getElementById("approved-requests");
    const recentPayments = document.getElementById("recent-payments");

    const recentActivitiesContainer = document.getElementById("activities-container");
    const noRecentActivities = document.getElementById("no-activities");

    const documentTypeSelector = document.getElementById("document-type");

    const summaryAmountValue = document.getElementById("summary-amount-to-pay");
    const totalAmountValue = document.getElementById("total-amount-to-pay");
    const documentTypeSelectedValue = document.getElementById("document-type-selected");
    const amountToPay = document.getElementById("amount-to-pay");

    const selectDocumentTypeFirstInfo = document.getElementById("select-document-first-info");
    const paymentInputDetails = document.getElementById("payment");
    const orderSummary = document.getElementById("order-summary");

    // Store document types
    let documentTypes = [];

    // Set up document type selector event listener
    documentTypeSelector.addEventListener('change', function() {
        const selectedType = documentTypeSelector.value;
        const selectedDocumentType = documentTypes.find(type => type.document_type_id == selectedType);
        
        if (selectedDocumentType) {
            // Update UI with selected document type details
            summaryAmountValue.innerText = selectedDocumentType.price;
            totalAmountValue.innerText = selectedDocumentType.price;
            documentTypeSelectedValue.innerText = selectedDocumentType.document_type;
            amountToPay.value = selectedDocumentType.price;
            
            // Show relevant sections
            selectDocumentTypeFirstInfo.style.display = "none";
            paymentInputDetails.style.display = "block";
            orderSummary.style.display = "block";
        } else {
            // Reset UI if no document type selected
            summaryAmountValue.innerText = "0.00";
            totalAmountValue.innerText = "0.00";
            amountToPay.value = "0.00";
            
            selectDocumentTypeFirstInfo.style.display = "none";
            orderSummary.style.display = "block";
            paymentInputDetails.style.display = "block";
        }
    });

    /**
     * Add activity card to activities container
     * @param {string} title - Activity title
     * @param {string} action - Activity description
     * @param {string} date - Activity date
     * @param {string} icon - Icon class
     */
    function addActivityCard(title, action, date, icon) {
        const activityTemplate = `
            <div class="activity">
                <div class="activity-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-details">
                    <h3>${title}</h3>
                    <p>${action}</p>
                    <small>${formatDate(date)}</small>
                </div>
            </div>
        `;
        
        recentActivitiesContainer.innerHTML += activityTemplate;
    }

    /**
     * Add payment card to recent payments container
     * @param {string} documentType - Document type
     * @param {string} amount - Payment amount
     * @param {string} date - Payment date
     * @param {string} status - Payment status
     */
    function addPaymentCard(documentType, amount, date, status) {
        const statusClass = status.toLowerCase() === 'completed' ? 'completed' : 'pending';
        
        const paymentTemplate = `
            <div class="payment">
                <div class="payment-details">
                    <h3>${documentType}</h3>
                    <p>${formatCurrency(amount)}</p>
                    <small>${formatDate(date)}</small>
                </div>
                <div class="payment-status ${statusClass}">
                    ${status}
                </div>
            </div>
        `;
        
        recentPayments.innerHTML += paymentTemplate;
    }

    /**
     * Fetch dashboard data and update UI
     */
    async function fetchDashboardData() {
        try {
            const response = await getUserDashboard();
            
            if (!response.success) {
                showAlert('Failed to load dashboard data', 'error');
                console.error('Error fetching dashboard data:', response.message);
                return;
            }
            
            const data = response.data;
            
            // Update user name
            if (userNameLiteral) {
                userNameLiteral.textContent = data.username || 'User';
            }
            
            // Update document types
            documentTypes = data.document_types || [];
            
            // Populate document type selector
            if (documentTypeSelector) {
                documentTypeSelector.innerHTML = '<option value="" selected disabled>Select Document Type</option>';
                
                documentTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.document_type_id;
                    option.textContent = `${type.document_type} - ₱${type.price}`;
                    documentTypeSelector.appendChild(option);
                });
            }
            
            // Update request counts
            if (totalRequest) totalRequest.textContent = data.total_requests || 0;
            if (pendingRequest) pendingRequest.textContent = data.pending_requests || 0;
            if (approvedRequest) approvedRequest.textContent = data.approved_requests || 0;
            if (completedRequest) completedRequest.textContent = data.completed_requests || 0;
            
            // Update recent activities
            if (recentActivitiesContainer) {
                recentActivitiesContainer.innerHTML = '';
                
                const recentRequests = data.recent_requests || [];
                if (recentRequests.length > 0) {
                    noRecentActivities.style.display = 'none';
                    
                    recentRequests.forEach(request => {
                        addActivityCard(
                            request.document_type || 'Document Request',
                            `Status: ${request.status}`,
                            request.date_requested,
                            'fas fa-file-alt'
                        );
                    });
                } else {
                    noRecentActivities.style.display = 'block';
                }
            }
            
            // Update recent payments
            if (recentPayments) {
                recentPayments.innerHTML = '';
                
                const recentPaymentsData = data.recent_payments || [];
                recentPaymentsData.forEach(payment => {
                    addPaymentCard(
                        payment.document_type || 'Document Payment',
                        payment.amount,
                        payment.date,
                        payment.status
                    );
                });
            }
        } catch (error) {
            console.error('Error in fetchDashboardData:', error);
            showAlert('An error occurred while loading dashboard data', 'error');
        }
    }

    // Initial fetch
    fetchDashboardData();
});
