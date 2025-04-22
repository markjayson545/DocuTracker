document.addEventListener("DOMContentLoaded", function () {
    const userNameLiteral = document.getElementById("user-name-literal");
    const totalRequest = document.getElementById("total-request");
    const pendingRequest = document.getElementById("pending-requests");
    const completedRequest = document.getElementById("completed-requests");
    const recentPayments = document.getElementById("recent-payments");

    const recentActivitiesContainer = document.getElementById("activities-container");
    const noRecentActivities = document.getElementById("no-activities");

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

        })
        .catch((error) => {
            console.error("Error fetching dashboard data:", error);
        });

});