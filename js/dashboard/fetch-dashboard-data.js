document.addEventListener("DOMContentLoaded", function () {
    const userNameLiteral = document.getElementById("user-name-literal");
    const totalRequest = document.getElementById("total-request");
    const pendingRequest = document.getElementById("pending-requests");
    const completedRequest = document.getElementById("completed-requests");
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

    function addActivityCard(title, date, icon) {
        let activityTemplate =
            `<div class="activity">
                        <div class="activity-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="activity-details">
                            <h4>
                                ${title}
                            </h4>
                            <p>
                                ${date}
                            </p>
                        </div>
                    </div>`;
        recentActivitiesContainer.innerHTML += activityTemplate;
    }
    

    fetch("php/fetch-dashboard-data.php")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);

            // Set user name on greeting 
            userNameLiteral.innerText =
                data.user.first_name + " "
                + data.user.last_name
                + (data.user.qualifier == "none" ? "" : " " + data.user.qualifier);

            // Set dashboard data on cards
            totalRequest.innerText = data.total_requests;
            pendingRequest.innerText = data.pending_requests;
            completedRequest.innerText = data.completed_requests;
            recentPayments.innerText = data.recent_payments ?? "0.00";

            // Set recent activities
            if (data.recent_activities) {
                noRecentActivities.style.display = "none";
                recentActivitiesContainer.style.display = "flex";
                data.recent_activities.forEach((activity) => {
                    addActivityCard(
                        activity.title,
                        activity.date,
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