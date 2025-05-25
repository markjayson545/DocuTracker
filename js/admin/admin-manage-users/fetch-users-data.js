document.addEventListener("DOMContentLoaded", function () {
    // DOM element references
    const totalUsersValue = document.getElementById("total-users-value");
    const activeUsersValue = document.getElementById("active-users-value");
    const pendingVerificationValue = document.getElementById("pending-verification-value");
    const suspendedUsersValue = document.getElementById("suspended-users-value");
    const verifiedUsersValue = document.getElementById("verified-users-value");
    const userTableBody = document.getElementById("user-table-body");
    const userDetailsModal = document.getElementById("modal-overlay");
    const closeModalButton = document.getElementById("close-modal-btn");
    const userSearchInput = document.querySelector(".user-search input");
    const userSearchButton = document.querySelector(".user-search button");
    const paginationContainer = document.querySelector(".pagination");
    const userTableContainer = document.querySelector(".user-table-container");

    // Pagination state
    let currentPage = 1;
    let totalPages = 1;
    let currentSearchTerm = "";
    let searchTimeout = null;
    let lastSearchTime = 0;
    const minSearchInterval = 300; // Minimum time between API calls in milliseconds

    // Add styles for search feedback
    document.head.insertAdjacentHTML('beforeend', `
    <style>
      .disabled-btn {
        opacity: 0.6;
        cursor: not-allowed;
        background-color: #e9ecef;
        border-color: #ced4da;
        color: #6c757d;
      }
      
      .searching-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(255, 255, 255, 0.8);
        padding: 10px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: none;
        z-index: 10;
      }
      
      .searching-indicator i {
        margin-right: 8px;
        animation: spin 1s infinite linear;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .user-table-container {
        position: relative;
        min-height: 200px;
      }
      
      .no-results {
        text-align: center;
        padding: 20px;
        color: #6c757d;
      }
      
      .user-info-wrapper {
        display: flex;
        align-items: center;
      }
      
      .username-text {
        margin-left: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px; /* Adjust based on your layout */
      }
    </style>
    `);

    // Create a searching indicator element
    const searchingIndicator = document.createElement('div');
    searchingIndicator.className = 'searching-indicator';
    searchingIndicator.innerHTML = '<i class="fas fa-spinner"></i> Searching...';
    userTableContainer.appendChild(searchingIndicator);

    // Event listeners setup
    closeModalButton.addEventListener("click", function () {
        userDetailsModal.style.display = "none";
        const documentControls = document.getElementById('document-controls');
        if (documentControls) {
            documentControls.style.display = 'none';
        }
        document.getElementById('document-placeholder').innerHTML = `                            <i class="fas fa-id-card"></i>
                            <p>No document selected. Click "View" to display a document.</p>
`;
    });

    // Debounce function to limit API calls
    function debounce(func, delay) {
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Rate limiting function
    function rateLimitedSearch() {
        const now = Date.now();
        if (now - lastSearchTime < minSearchInterval) {
            // If called too soon, delay the call
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, minSearchInterval - (now - lastSearchTime));
            return;
        }
        performSearch();
    }

    // Function to perform the actual search
    function performSearch() {
        lastSearchTime = Date.now();
        currentSearchTerm = userSearchInput.value.trim();
        currentPage = 1; // Reset to first page on new search
        fetchUsersData(currentPage, currentSearchTerm);
    }

    // Setup search event listeners with debouncing
    userSearchInput.addEventListener("input", debounce(rateLimitedSearch, 500));

    userSearchButton.addEventListener("click", function (e) {
        e.preventDefault();
        rateLimitedSearch();
    });

    // User data functions
    window.fetchUserDetails = function (userId) {
        const formData = new FormData();
        formData.append("user_id", userId);

        // Show loading indicators in modal
        document.getElementById("full-name-title").innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        document.getElementById("user-id-title").innerText = `USR-${userId}`;

        fetch(`php/admin/admin-manage-users/fetch-admin-user-details.php`, {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    const user = data.user;
                    const hasClientProfile = data.hasClientProfile;

                    // Always display basic user information
                    const displayName = user.username || "N/A";
                    const fullNameTitle = document.getElementById("full-name-title");

                    // Set name based on available data
                    if (user.first_name && user.last_name) {
                        fullNameTitle.innerText = `${user.first_name} ${user.last_name}`;
                    } else {
                        fullNameTitle.innerText = displayName;
                    }

                    // Add a visual indicator if profile is incomplete
                    if (!hasClientProfile) {
                        fullNameTitle.innerHTML += ' <span class="profile-incomplete-badge" title="Profile Incomplete"><i class="fas fa-exclamation-triangle"></i></span>';

                        // Add an inline style for the badge if it doesn't exist in CSS
                        if (!document.querySelector('style#profile-incomplete-style')) {
                            const style = document.createElement('style');
                            style.id = 'profile-incomplete-style';
                            style.textContent = `
                                .profile-incomplete-badge {
                                    display: inline-block;
                                    color: #ff9900;
                                    font-size: 0.8em;
                                    margin-left: 8px;
                                    vertical-align: middle;
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    }


                    if (user.profile_picture) {
                        getUserProfileImage(user.profile_picture);
                    } else {
                        // Set a default profile image if none exists
                        document.getElementById("user-profile-img-modal").src = "https://www.w3schools.com/howto/img_avatar.png";
                    }

                    document.getElementById("user-id-title").innerText = `USR-${user.user_id}`;
                    document.getElementById("registered-on-title").innerText = window.parseDate(user.created_at);
                    document.getElementById("verification-status").innerText = user.is_verified ? "Verified" : "Pending";
                    document.getElementById("verification-status-icon").className = user.is_verified
                        ? "fas fa-check-circle verified-icon"
                        : "fas fa-clock pending-icon";

                    // Populate verified user section
                    document.getElementById("verification-date").innerText = user.verification_date || "N/A";
                    document.getElementById("verified-by").innerText = user.verified_by || "N/A";

                    // Populate personal information form with safe defaults
                    document.getElementById("first-name").value = user.first_name || "";
                    document.getElementById("last-name").value = user.last_name || "";
                    document.getElementById("middle-name").value = user.middle_name || "";
                    document.getElementById("email").value = user.email || "";
                    document.getElementById("phone").value = user.phone || "";
                    document.getElementById("house-num").value = user.house_number || "";
                    document.getElementById("street").value = user.street || "";
                    document.getElementById("barangay").value = user.barangay || "";
                    document.getElementById("city").value = user.city || "";
                    document.getElementById("province").value = user.province || "";
                    document.getElementById("dob").value = user.date_of_birth || "";
                    document.getElementById("birth-place").value = user.birth_place || "";

                    // For select inputs, make sure the value exists or use default
                    setSelectValueSafely("sex", user.sex, "prefer-not-to-say");
                    setSelectValueSafely("civil-status", user.civil_status, "single");
                    setSelectValueSafely("nationality", user.nationality, "other");
                    setSelectValueSafely("complexion", user.complexion, "medium");
                    setSelectValueSafely("blood-type", user.blood_type, "unknown");
                    setSelectValueSafely("religion", user.religion, "other");
                    setSelectValueSafely("education", user.education, "high-school");
                    setSelectValueSafely("occupation", user.occupation, "unemployed");

                    // If no profile, display a friendly message to the admin
                    if (!hasClientProfile) {
                        const profileForm = document.getElementById("personal-info-form");
                        const warningMsg = document.createElement('div');
                        warningMsg.className = 'profile-incomplete-warning';
                        warningMsg.innerHTML = `
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>Profile Incomplete:</strong> This user hasn't completed their profile setup.
                                You can add their information manually and save it.
                            </div>
                        `;
                        profileForm.insertBefore(warningMsg, profileForm.firstChild);

                        // Add styling for the warning
                        if (!document.querySelector('style#warning-style')) {
                            const style = document.createElement('style');
                            style.id = 'warning-style';
                            style.textContent = `
                                .profile-incomplete-warning .alert {
                                    background-color: #fff3cd;
                                    color: #856404;
                                    padding: 12px;
                                    border-radius: 4px;
                                    margin-bottom: 20px;
                                    border-left: 4px solid #ffc107;
                                }
                                .profile-incomplete-warning .alert i {
                                    margin-right: 8px;
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    } else {
                        // Remove any existing warning if user has a profile
                        const existingWarning = document.querySelector('.profile-incomplete-warning');
                        if (existingWarning) {
                            existingWarning.remove();
                        }
                    }
                } else {
                    alert("Error loading user details: " + (data.message || "Unknown error"));
                }
            })
            .catch(error => console.log("Error fetching user details:", error));
    };

    async function getUserProfileImage(path) {
        const formData = new FormData();
        formData.append('file_path', path);
        await fetch('php/services/get-document.php', {
            method: 'POST',
            body: formData
        }).then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                console.log("Profile picture URL:", url);
                document.getElementById("user-profile-img-modal").src = url;
            }
            ).catch(error => {
                console.error('Error fetching profile picture:', error);
            });
    }

    // Helper function to safely set select input values
    function setSelectValueSafely(selectId, value, defaultValue) {
        const selectElement = document.getElementById(selectId);
        if (!selectElement) return;

        // Check if the value exists in the options
        const optionExists = Array.from(selectElement.options).some(option => option.value === value);

        if (value && optionExists) {
            selectElement.value = value;
        } else {
            selectElement.value = defaultValue;
        }
    }

    window.fetchUserDocuments = function (userId) {
        const formData = new FormData();
        formData.append("user_id", userId);
        fetch(`php/admin/admin-manage-users/fetch-admin-user-application-doc.php`, {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tableBody = document.getElementById("admin-documents-table-body");
                    if (tableBody) {
                        tableBody.innerHTML = '';

                        if (data.documents.length === 0) {
                            tableBody.innerHTML = '<tr><td colspan="4">No documents uploaded.</td></tr>';
                        } else {
                            data.documents.forEach(doc => {
                                const fileExt = doc.document_path.split('.').pop().toLowerCase();
                                const filePath = doc.document_path;

                                console.log("Document file path:", filePath);

                                // Get icon class using the global utility function
                                const iconClass = window.getFileIconClass(fileExt);

                                // Format the date
                                const createdDate = new Date(doc.uploaded_at).toLocaleString();

                                // Create row with appropriate icon
                                const rowTemplate = `
                                    <tr data-document-path="${doc.document_path}">
                                        <td>
                                            <div class="doc-preview-icon"><i class="fas ${iconClass}"></i></div>
                                            ${window.capitalize(doc.document_type)}
                                        </td>
                                        <td>${createdDate}</td>
                                        <td><button class="view-document-btn" id="viewDoc${doc.document_id}">View</button></td>
                                    </tr>`;
                                tableBody.insertAdjacentHTML('beforeend', rowTemplate);

                                // Add event listener for the view button
                                const viewBtn = document.getElementById(`viewDoc${doc.document_id}`);
                                if (viewBtn) {
                                    viewBtn.addEventListener('click', function () {
                                        insertApplicationDocument(doc.document_path);
                                    });
                                }
                            });
                        }
                    }
                } else {
                    console.log("Error fetching user documents:", data.message);
                }
            })
            .catch(error => console.log("Error fetching user documents:", error));
    };

    window.fetchUsersData = function (page = 1, searchTerm = "") {
        // Store the current page and search term in global variables to maintain state
        currentPage = page;
        currentSearchTerm = searchTerm;

        // Show searching indicator
        searchingIndicator.style.display = 'block';

        // Build URL with query parameters
        let url = `php/admin/admin-manage-users/fetch-admin-user-manage.php?page=${page}`;
        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Hide searching indicator
                searchingIndicator.style.display = 'none';

                console.log(data);
                console.log("Current Page:", currentPage);
                if (data.success) {
                    // Update summary cards
                    totalUsersValue.innerText = data.totalUsers;
                    activeUsersValue.innerText = data.totalActiveUsers;
                    pendingVerificationValue.innerText = data.totalPendingVerificationUsers;
                    suspendedUsersValue.innerText = data.totalSuspendedUsers;
                    verifiedUsersValue.innerText = data.totalVerifiedUsers;

                    // Update table content
                    let tableContent = '';
                    if (data.users.length === 0) {
                        tableContent = '<tr style="color: red; text-align: center;"><td colspan="8" class="no-results">No users found matching your search criteria.</td></tr>';
                    } else {
                        data.users.forEach(user => {
                            tableContent += createUserRow(user.user_id, user.username, user.profile_picture, user.email, user.role, user.status, user.is_verified, user.created_at);
                        });
                    }

                    userTableBody.innerHTML = tableContent;

                    // Load profile images after rendering the table
                    loadProfileImages();

                    attachViewEventListeners();

                    // Update pagination
                    totalPages = data.pagination.totalPages;
                    updatePagination(currentPage, totalPages);
                } else {
                    // Handle error state
                    searchingIndicator.style.display = 'none';
                    userTableBody.innerHTML = '<tr><td colspan="8" class="no-results">Error loading users. Please try again.</td></tr>';
                }
            })
            .catch(error => {
                console.error("Error fetching users data:", error);
                searchingIndicator.style.display = 'none';
                userTableBody.innerHTML = '<tr><td colspan="8" class="no-results">Connection error. Please check your internet connection and try again.</td></tr>';
            });
    };

    // Pagination functions
    function updatePagination(currentPageNum, totalPagesNum) {
        // Clear existing pagination
        paginationContainer.innerHTML = '';

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.title = 'Previous Page';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPageNum <= 1;
        if (prevBtn.disabled) prevBtn.classList.add('disabled-btn');
        prevBtn.addEventListener('click', function () {
            if (currentPageNum > 1) {
                window.fetchUsersData(currentPageNum - 1, currentSearchTerm);
            }
        });
        paginationContainer.appendChild(prevBtn);

        // Determine which page numbers to show
        let startPage = Math.max(1, currentPageNum - 2);
        let endPage = Math.min(totalPagesNum, startPage + 4);

        if (endPage - startPage < 4 && startPage > 1) {
            startPage = Math.max(1, endPage - 4);
        }

        // Page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn';
            if (i === currentPageNum) pageBtn.classList.add('active');
            pageBtn.textContent = i;

            // Use a closure to capture the correct page number
            (function (pageNum) {
                pageBtn.addEventListener('click', function () {
                    window.fetchUsersData(pageNum, currentSearchTerm);
                });
            })(i);

            paginationContainer.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.title = 'Next Page';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPageNum >= totalPagesNum;
        if (nextBtn.disabled) nextBtn.classList.add('disabled-btn');
        nextBtn.addEventListener('click', function () {
            if (currentPageNum < totalPagesNum) {
                window.fetchUsersData(currentPageNum + 1, currentSearchTerm);
            }
        });
        paginationContainer.appendChild(nextBtn);
    }

    // UI/Table management functions
    function createUserRow(userId, username, profile_picture, email, role, status, isVerified, createdAt) {
        console.log("Creating row for user:", userId, username, email, profile_picture, role, status, isVerified, createdAt);

        // Use default image initially and add data attribute for profile path
        const defaultImg = "https://www.w3schools.com/howto/img_avatar.png";

        let icon = 'fa-check-circle verified-icon';
        if (!isVerified) {
            icon = 'fa-clock pending-icon';
        }

        return `
            <tr>
            <td>USR-${userId}</td>
            <td class="username-cell">
                <div class="user-info-wrapper">
                    <img src="${defaultImg}" alt="Profile Picture" class="user-profile-img user-${userId}" 
                        data-profile-path="${profile_picture || ''}" 
                        style="width: 30px; height: 30px; border-radius: 50%;">
                    <span class="username-text">${username}</span>
                </div>
            </td>
            <td>${email}</td>
            <td><span class="role-badge role-${role}">${role}</span></td>
            <td><span class="status-badge status-${status}">${status}</span></td>
            <td><i class="fas ${icon}"></i></td>
            <td>${window.parseDate(createdAt)}</td>
            <td class="actions-cell">
                <button class="action-icon-btn view-user-btn" data-user-id="${userId}" title="View">
                <i class="fas fa-eye"></i>View
                </button>
            </td>
            </tr>
        `;
    }

    // New function to load profile images after the table is rendered
    function loadProfileImages() {
        const profileImgs = document.querySelectorAll('.user-profile-img[data-profile-path]');
        profileImgs.forEach(img => {
            const profilePath = img.getAttribute('data-profile-path');
            if (profilePath && profilePath !== '') {
                const formData = new FormData();
                formData.append('file_path', profilePath);

                fetch('php/services/get-document.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        if (response.ok) return response.blob();
                        throw new Error('Failed to load image');
                    })
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        img.src = url;
                    })
                    .catch(error => {
                        console.error('Error fetching profile picture:', error);
                        // Keep the default image that's already there
                    });
            }
        });
    }

    function attachViewEventListeners() {
        document.querySelectorAll('.view-user-btn').forEach(button => {
            button.addEventListener("click", function () {
                const userId = this.getAttribute('data-user-id');
                // Call openModal directly instead of window.openUserModal
                openModal(userId);
            });
        });
    }

    // Modal and user actions functions
    function openModal(userId) {
        // Clear any previous event listeners to avoid duplicates
        const personalInfoForm = document.getElementById("personal-info-form");
        const newPersonalInfoForm = personalInfoForm.cloneNode(true);
        personalInfoForm.parentNode.replaceChild(newPersonalInfoForm, personalInfoForm);

        // Remove old event listeners from action buttons
        const actionButtons = document.querySelectorAll('.btn[id$="-btn"]');
        actionButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
        });

        fetchUserDetails(userId);
        fetchUserDocuments(userId);
        userDetailsModal.style.display = "block";

        // Event listener for the "Save Changes" button
        document.getElementById("personal-info-form").addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(this);
            formData.append("user_id", userId);
            fetch(`php/admin/admin-manage-users/update-user.php`, {
                method: "POST",
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("User information updated successfully!");
                        fetchUsersData();
                        fetchUserDetails(userId);
                    } else {
                        alert("Failed to update user details: " + (data.message || "Unknown error"));
                    }
                })
                .catch(error => console.log("Error updating user details:", error));
        });

        // Event listener for the "Discard Changes" button
        document.getElementById("discard-changes-btn").addEventListener("click", function () {
            fetchUserDetails(userId);
        });

        // Actions Listeners
        const activateUserButton = document.getElementById("activate-user-btn");
        const resetPasswordButton = document.getElementById("reset-password-btn");
        const suspendUserButton = document.getElementById("suspend-user-btn");
        const verifyUserButton = document.getElementById("verify-user-btn");
        const requestMoreInfoButton = document.getElementById("request-additional-info-btn");
        const rejectVerificationButton = document.getElementById("reject-user-btn");
        const makeAdminButton = document.getElementById("make-admin-btn");
        const makeClientButton = document.getElementById("make-client-btn");

        // Function to update button states based on user status
        function updateButtonStates(user) {
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
        }

        // Update button states when user details are loaded
        fetch(`php/admin/admin-manage-users/fetch-admin-user-details.php`, {
            method: "POST",
            body: new FormData().append("user_id", userId)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateButtonStates(data.user);
                }
            })
            .catch(error => console.log("Error fetching user details:", error));

        function handleAction(action) {
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

                case "suspend":
                    const suspensionReason = prompt("Please specify the reason for suspending the user:");
                    if (suspensionReason === null) {
                        return;
                    }
                    if (suspensionReason.trim() === "") {
                        alert("You must provide a reason for suspending the user.");
                        return;
                    }
                    formData.append("message", suspensionReason);
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
                        fetchUsersData();
                        fetchUserDetails(userId);

                        // Refresh button states after action
                        fetch(`php/admin/admin-manage-users/fetch-admin-user-details.php`, {
                            method: "POST",
                            body: new FormData().append("user_id", userId)
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    updateButtonStates(data.user);
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
        }

        // Ensure event listeners are added only once by removing and re-adding them
        activateUserButton.onclick = function () { handleAction("activate"); };
        resetPasswordButton.onclick = function () { handleAction("reset-password"); };
        suspendUserButton.onclick = function () { handleAction("suspend"); };
        verifyUserButton.onclick = function () { handleAction("verify"); };
        requestMoreInfoButton.onclick = function () { handleAction("request-more-info"); };
        rejectVerificationButton.onclick = function () { handleAction("reject-verification"); };
        makeAdminButton.onclick = function () { handleAction("make-admin"); };
        makeClientButton.onclick = function () { handleAction("make-client"); };
    }

    // Document handling functions
    function insertApplicationDocument(docPath) {
        const form = new FormData();
        form.append('file_path', docPath);

        // Show loading indicator with improved styling
        const documentPlaceholder = document.getElementById('document-placeholder');
        documentPlaceholder.innerHTML = `<p class="loading">Loading document...</p>`;
        const documentControls = document.getElementById('document-controls');
        documentControls.style.display = 'none'; // Hide controls until document loads

        // Get file extension to determine file type
        const fileExt = docPath.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt);

        // Use absolute path to ensure we're hitting the correct endpoint
        fetch('php/services/get-document.php', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.blob(); // Get the response as binary data
            })
            .then(blob => {
                // Create a URL for the blob
                const objectUrl = URL.createObjectURL(blob);

                // Display document based on file type
                if (isImage) {
                    // Display image
                    documentPlaceholder.innerHTML = `
                    <div class="document-container">
                        <img src="${objectUrl}" alt="Document" class="document-image" id="document-image">
                    </div>
                `;

                    // Show the controls
                    documentControls.style.display = 'flex';

                    setupImageControls(objectUrl, docPath);
                } else {
                    // For non-image files, show appropriate icon based on file extension
                    const fileIcon = window.getFileIconClass(fileExt);
                    const fileColor = window.getFileColor(fileExt);
                    const fileName = docPath.split('/').pop() || 'document';

                    // Display appropriate file icon with download link
                    documentPlaceholder.innerHTML = `
                    <div class="document-container non-image-document">
                        <div class="file-icon-container">
                            <i class="fas ${fileIcon}" style="color: ${fileColor}"></i>
                            <p>${fileName}</p>
                            <div class="file-actions">
                                <a href="${objectUrl}" download="${fileName}" class="download-link">
                                    <i class="fas fa-download"></i> Download File
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                }
            })
            .catch(error => {
                console.error('Error fetching document:', error);
                documentPlaceholder.innerHTML = `
                    <p class="error-message">Error loading document: ${error.message}</p>
                    <p>File path: ${docPath}</p>
                `;
                documentControls.style.display = 'none';
            });
    }

    function setupImageControls(objectUrl, docPath) {
        const docImage = document.getElementById('document-image');
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const rotateBtn = document.getElementById('rotate-btn');
        const resetBtn = document.getElementById('reset-btn');
        const downloadBtn = document.getElementById('download-btn');

        // Set a reasonable default zoom that works well
        let currentZoom = 1;
        let currentRotation = 0;

        // Reset any previous event listeners
        zoomInBtn.replaceWith(zoomInBtn.cloneNode(true));
        zoomOutBtn.replaceWith(zoomOutBtn.cloneNode(true));
        rotateBtn.replaceWith(rotateBtn.cloneNode(true));
        resetBtn.replaceWith(resetBtn.cloneNode(true));
        downloadBtn.replaceWith(downloadBtn.cloneNode(true));

        // Get fresh references
        const newZoomInBtn = document.getElementById('zoom-in-btn');
        const newZoomOutBtn = document.getElementById('zoom-out-btn');
        const newRotateBtn = document.getElementById('rotate-btn');
        const newResetBtn = document.getElementById('reset-btn');
        const newDownloadBtn = document.getElementById('download-btn');

        newZoomInBtn.addEventListener('click', () => {
            currentZoom += 0.1;
            updateTransform();
        });

        newZoomOutBtn.addEventListener('click', () => {
            if (currentZoom > 0.2) {
                currentZoom -= 0.1;
                updateTransform();
            }
        });

        newRotateBtn.addEventListener('click', () => {
            currentRotation = (currentRotation + 90) % 360;
            updateTransform();
        });

        newResetBtn.addEventListener('click', () => {
            currentZoom = 1;
            currentRotation = 0;
            updateTransform();
        });

        newDownloadBtn.addEventListener('click', () => {
            const fileName = docPath.split('/').pop() || 'document.jpg';
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        function updateTransform() {
            docImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        }
    }

    // Initialize data fetch
    window.fetchUsersData(1, "");

    // Use a longer interval for auto-refresh to avoid excessive API calls
    setInterval(() => {
        // Only auto-refresh if the search field is empty to avoid disrupting user searches
        if (userSearchInput.value.trim() === "") {
            window.fetchUsersData(currentPage, currentSearchTerm);
        }
    }, 60000);
});

// Make sure openUserModal is defined in global scope
window.openUserModal = function (userId) {
    // Use the internal openModal function if it exists in the current scope
    if (typeof openModal === 'function') {
        openModal(userId);
    } else {
        // Fallback implementation
        document.getElementById("modal-overlay").style.display = "block";
        window.fetchUserDetails(userId);
        window.fetchUserDocuments(userId);
    }
};