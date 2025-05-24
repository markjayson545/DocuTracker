/**
 * User Modal Utilities
 * Contains global functions for managing user modals in the DocuTracker application
 */

// Open the user details modal and set up all event listeners
window.openUserModal = function(userId) {
    const userDetailsModal = document.getElementById("modal-overlay");
    
    // Fetch user details and documents
    window.fetchUserDetails(userId);
    window.fetchUserDocuments(userId);
    
    // Display the modal
    userDetailsModal.style.display = "block";

    // Event listener for the "Save Changes" button
    const personalInfoForm = document.getElementById("personal-info-form");
    personalInfoForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(personalInfoForm);
        formData.append("user_id", userId);
        fetch(`php/admin/admin-manage-users/update-user.php`, {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.fetchUsersData && window.fetchUsersData();
                    window.fetchUserDetails(userId);
                } else {
                    alert("Failed to update user details.");
                }
            })
            .catch(error => console.log("Error updating user details:", error));
    });

    // Event listener for the "Discard Changes" button
    document.getElementById("discard-changes-btn").addEventListener("click", function () {
        window.fetchUserDetails(userId);
    });

    // Set up action buttons
    setupUserActionButtons(userId);
};

// Set up action buttons within the user modal
function setupUserActionButtons(userId) {
    // Actions Listeners
    const activateUserButton = document.getElementById("activate-user-btn");
    const resetPasswordButton = document.getElementById("reset-password-btn");
    const suspendUserButton = document.getElementById("suspend-user-btn");
    const verifyUserButton = document.getElementById("verify-user-btn");
    const requestMoreInfoButton = document.getElementById("request-additional-info-btn");
    const rejectVerificationButton = document.getElementById("reject-user-btn");
    const makeAdminButton = document.getElementById("make-admin-btn");
    const makeClientButton = document.getElementById("make-client-btn");

    // Update button states when user details are loaded
    fetch(`php/admin/admin-manage-users/fetch-admin-user-details.php`, {
        method: "POST",
        body: new FormData().append("user_id", userId)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.updateUserButtonStates(data.user);
            }
        })
        .catch(error => console.log("Error fetching user details:", error));

    // Add click event listeners to all action buttons
    activateUserButton.addEventListener("click", function () {
        window.handleUserAction("activate", userId);
    });
    resetPasswordButton.addEventListener("click", function () {
        window.handleUserAction("reset-password", userId);
    });
    suspendUserButton.addEventListener("click", function () {
        window.handleUserAction("suspend", userId);
    });
    verifyUserButton.addEventListener("click", function () {
        window.handleUserAction("verify", userId);
    });
    requestMoreInfoButton.addEventListener("click", function () {
        window.handleUserAction("request-more-info", userId);
    });
    rejectVerificationButton.addEventListener("click", function () {
        window.handleUserAction("reject-verification", userId);
    });
    makeAdminButton.addEventListener("click", function () {
        window.handleUserAction("make-admin", userId);
    });
    makeClientButton.addEventListener("click", function () {
        window.handleUserAction("make-client", userId);
    });
}

// Update button states based on user status
window.updateUserButtonStates = function(user) {
    const activateUserButton = document.getElementById("activate-user-btn");
    const suspendUserButton = document.getElementById("suspend-user-btn");
    const verifyUserButton = document.getElementById("verify-user-btn");
    const requestMoreInfoButton = document.getElementById("request-additional-info-btn");
    const rejectVerificationButton = document.getElementById("reject-user-btn");
    const makeAdminButton = document.getElementById("make-admin-btn");
    const makeClientButton = document.getElementById("make-client-btn");
    
    const isVerified = user.is_verified === 1 || user.is_verified === true;
    const status = user.status;
    
    // Manage activation/suspension buttons
    activateUserButton.disabled = !isVerified || status === 'active';
    suspendUserButton.disabled = !isVerified || status === 'suspended';
    
    // Manage verification buttons
    verifyUserButton.disabled = isVerified;
    requestMoreInfoButton.disabled = isVerified;
    rejectVerificationButton.disabled = isVerified;
    
    // Manage role buttons
    makeAdminButton.disabled = !isVerified;
    makeClientButton.disabled = !isVerified;
    
    // Add visual indication for disabled buttons
    const buttons = [activateUserButton, suspendUserButton, verifyUserButton, 
                     requestMoreInfoButton, rejectVerificationButton, 
                     makeAdminButton, makeClientButton];
    
    buttons.forEach(btn => {
        if (btn.disabled) {
            btn.classList.add('disabled-btn');
        } else {
            btn.classList.remove('disabled-btn');
        }
    });
};

// Handle user actions (activate, suspend, verify, etc.)
window.handleUserAction = function(action, userId) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("action", action);

    switch (action) {
        case "request-more-info":
            const additionalInfo = prompt("Please specify what additional information you need from the user:");
            if (additionalInfo === null) {
                return;
            }
            if (additionalInfo.trim() === "") {
                alert("You must provide details about what information is needed.");
                return;
            }
            formData.append("message", additionalInfo);
            break;

        case "reject-verification":
            const rejectionReason = prompt("Please specify the reason for rejecting the verification:");
            if (rejectionReason === null) {
                return;
            }
            if (rejectionReason.trim() === "") {
                alert("You must provide a reason for rejecting the verification.");
                return;
            }
            formData.append("message", rejectionReason);
            break;

        case "reset-password":
            const newPassword = prompt("Enter new password for user ID: " + userId);
            const confirmPassword = prompt("Confirm new password for user ID: " + userId);
            if (newPassword === null || confirmPassword === null) {
                return;
            }
            if (newPassword.trim() === "" || confirmPassword.trim() === "") {
                alert("You must provide a new password.");
                return;
            }
            if (newPassword !== confirmPassword) {
                alert("Passwords do not match. Please try again.");
                return;
            }
            formData.append("new_password", newPassword);
            formData.append("confirm_password", confirmPassword);
            break;

        case "make-admin":
        case "make-client":
            const roleConfirmation = confirm(`Are you sure you want to make this user a ${action === "make-admin" ? "admin" : "client"}?`);
            if (!roleConfirmation) {
                return;
            }
            
            const adminPassword = prompt("Please enter your admin password to confirm this action:");
            if (!adminPassword) {
                alert("Admin password is required for role changes.");
                return;
            }
            
            formData.append("admin_password", adminPassword);
            break;

        default:
            const confirmation = confirm(`Are you sure you want to ${action} this user?`);
            if (!confirmation) {
                return;
            }
            break;
    }

    fetch(`php/admin/admin-manage-users/user-actions.php`, {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`User ${action} successfully!`);
                window.fetchUsersData && window.fetchUsersData();
                window.fetchUserDetails(userId);
                
                // Refresh button states after action
                fetch(`php/admin/admin-manage-users/fetch-admin-user-details.php`, {
                    method: "POST",
                    body: new FormData().append("user_id", userId)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.updateUserButtonStates(data.user);
                        }
                    });
            } else {
                alert(`Failed to ${action} user: ${data.message}`);
            }
        })
        .catch(error => {
            console.log(`Error ${action} user:`, error);
            alert(`Error occurred while processing your request.`);
        });
};
