document.addEventListener("DOMContentLoaded", function () {
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

    let documentTypes = [];

    documentTypeSelector.addEventListener('change', function(){
        const selectedType = documentTypeSelector.value;
        console.log(selectedType);
        const selectedDocumentType = documentTypes.find(type => type.document_type_id == selectedType);
        console.log(selectedDocumentType);
        if (selectedDocumentType) {
            summaryAmountValue.innerText = selectedDocumentType.price;
            totalAmountValue.innerText = selectedDocumentType.price;
            documentTypeSelectedValue.innerText = selectedDocumentType.document_type;
            amountToPay.value = selectedDocumentType.price;
            selectDocumentTypeFirstInfo.style.display = "none";
            paymentInputDetails.style.display = "block";
            orderSummary.style.display = "block";
        } else {
            summaryAmountValue.innerText = "0.00";
            totalAmountValue.innerText = "0.00";
            amountToPay.value = "0.00";
            selectDocumentTypeFirstInfo.style.display = "none";
            orderSummary.style.display = "block";
            paymentInputDetails.style.display = "block";
        }
    });

    function addActivityCard(title, action, date, icon) {
        let activityTemplate =
            `<div class="activity">
                        <div class="activity-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="activity-details">
                            <h4>
                                ${title}
                            </h4>
                            <p>${action}</p>
                            <div class="activity-info">
                                <p><i class="fas fa-calendar-alt"></i> ${date}</p>
                            </div>
                        </div>
                    </div>`;
        recentActivitiesContainer.innerHTML += activityTemplate;
    }
    

    fetch("php/client/user-dashboard/fetch-dashboard-data.php")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            console.log(
                "Dashboard data fetched successfully:", data
            );

            // Set user name on greeting 
            userNameLiteral.innerText =
                data.user.first_name + " "
                + data.user.last_name
                + (data.user.qualifier == "none" ? "" : " " + data.user.qualifier);

            // Set dashboard data on cards
            totalRequest.innerText = data.total_requests;
            pendingRequest.innerText = data.pending_requests;
            completedRequest.innerText = data.completed_requests;
            approvedRequest.innerText = data.completed_requests;
            recentPayments.innerText = data.recent_payments ?? "0.00";

            // Set recent activities
            if (data.recent_activities) {
                noRecentActivities.style.display = "none";
                recentActivitiesContainer.style.display = "flex";
                data.recent_activities.forEach((activity) => {

                    const createdDate = new Date(activity.created_at);
                    const now = new Date();
                    const diffTime = Math.abs(now - createdDate);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
                    
                    let timeAgo;
                    if (diffDays > 0) {
                        timeAgo = diffDays + (diffDays === 1 ? " day ago" : " days ago");
                    } else if (diffHours > 0) {
                        timeAgo = diffHours + (diffHours === 1 ? " hour ago" : " hours ago");
                    } else if (diffMinutes > 0) {
                        timeAgo = diffMinutes + (diffMinutes === 1 ? " minute ago" : " minutes ago");
                    } else {
                        timeAgo = "just now";
                    }
                    
                    addActivityCard(
                        activity.title,
                        activity.action,
                        timeAgo,
                        'fa-file-invoice'
                    );
                });
            } else {
                noRecentActivities.style.display = "flex";
                recentActivitiesContainer.style.display = "none";
            }

            documentTypes = data.document_types;

            if(data.document_types) {
                data.document_types.forEach((type) => {
                    let option = document.createElement("option");
                    option.value = type.document_type_id;
                    option.textContent = type.document_type;
                    documentTypeSelector.appendChild(option);
                    console.log(type.document_type);
                });
            }

        })
        .catch((error) => {
            console.error("Error fetching dashboard data:", error);
        });

});