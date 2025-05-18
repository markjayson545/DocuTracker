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

    // Event listeners setup
    closeModalButton.addEventListener("click", function () {
        userDetailsModal.style.display = "none";
        const documentControls = document.getElementById('document-controls');
        if (documentControls) {
            documentControls.style.display = 'none';
        }
    });

    // Helper functions
    function parseDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function capitalize(string) {
        if (!string) return '';
        string = string.replace(/-/g, ' ');
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // User data functions
    function fetchUserDetails(userId) {
        const formData = new FormData();
        formData.append("user_id", userId);
        fetch(`php/admin/admin-manage-users/fetch-admin-user-details.php`, {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const user = data.user;
                    // Populate user profile details
                    document.getElementById("full-name-title").innerText = `${user.first_name} ${user.last_name}`;
                    document.getElementById("user-id-title").innerText = `USR-${user.user_id}`;
                    document.getElementById("registered-on-title").innerText = parseDate(user.created_at);
                    document.getElementById("verification-status").innerText = user.is_verified ? "Verified" : "Pending";
                    document.getElementById("verification-status-icon").className = user.is_verified
                        ? "fas fa-check-circle verified-icon"
                        : "fas fa-clock pending-icon";

                    // Populate verified user section
                    document.getElementById("verification-date").innerText = user.verification_date || "N/A";
                    document.getElementById("verified-by").innerText = user.verified_by || "N/A";

                    // Populate personal information form
                    document.getElementById("first-name").value = user.first_name;
                    document.getElementById("last-name").value = user.last_name;
                    document.getElementById("middle-name").value = user.middle_name || "";
                    document.getElementById("email").value = user.email;
                    document.getElementById("phone").value = user.phone || "";
                    document.getElementById("house-num").value = user.house_number || "";
                    document.getElementById("street").value = user.street || "";
                    document.getElementById("barangay").value = user.barangay || "";
                    document.getElementById("city").value = user.city || "";
                    document.getElementById("province").value = user.province || "";
                    document.getElementById("dob").value = user.date_of_birth || "";
                    document.getElementById("birth-place").value = user.birth_place || "";
                    document.getElementById("sex").value = user.sex || "prefer-not-to-say";
                    document.getElementById("civil-status").value = user.civil_status || "single";
                    document.getElementById("height").value = user.height || "";
                    document.getElementById("weight").value = user.weight || "";
                    document.getElementById("nationality").value = user.nationality || "other";
                    document.getElementById("complexion").value = user.complexion || "medium";
                    document.getElementById("blood-type").value = user.blood_type || "unknown";
                    document.getElementById("religion").value = user.religion || "other";
                    document.getElementById("education").value = user.education || "high-school";
                    document.getElementById("occupation").value = user.occupation || "unemployed";
                }
            })
            .catch(error => console.log("Error fetching user details:", error));
    }

    function fetchUserDocuments(userId) {
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

                                // Determine the appropriate icon based on file extension
                                let iconClass = 'fa-file';

                                // Map file extensions to Font Awesome icons
                                switch (fileExt) {
                                    // Images
                                    case 'jpg':
                                    case 'jpeg':
                                    case 'png':
                                    case 'gif':
                                    case 'bmp':
                                    case 'svg':
                                    case 'webp':
                                        iconClass = 'fa-file-image';
                                        break;
                                    // Documents
                                    case 'pdf':
                                        iconClass = 'fa-file-pdf';
                                        break;
                                    case 'doc':
                                    case 'docx':
                                        iconClass = 'fa-file-word';
                                        break;
                                    case 'xls':
                                    case 'xlsx':
                                    case 'csv':
                                        iconClass = 'fa-file-excel';
                                        break;
                                    case 'ppt':
                                    case 'pptx':
                                        iconClass = 'fa-file-powerpoint';
                                        break;
                                    case 'txt':
                                        iconClass = 'fa-file-alt';
                                        break;
                                    // Archives
                                    case 'zip':
                                    case 'rar':
                                    case '7z':
                                    case 'tar':
                                    case 'gz':
                                        iconClass = 'fa-file-archive';
                                        break;
                                    // Code
                                    case 'html':
                                    case 'htm':
                                    case 'css':
                                    case 'js':
                                    case 'php':
                                    case 'py':
                                    case 'java':
                                    case 'c':
                                    case 'cpp':
                                        iconClass = 'fa-file-code';
                                        break;
                                    // Audio
                                    case 'mp3':
                                    case 'wav':
                                    case 'ogg':
                                    case 'flac':
                                    case 'm4a':
                                        iconClass = 'fa-file-audio';
                                        break;
                                    // Video
                                    case 'mp4':
                                    case 'avi':
                                    case 'mov':
                                    case 'wmv':
                                    case 'flv':
                                    case 'mkv':
                                    case 'webm':
                                        iconClass = 'fa-file-video';
                                        break;
                                    // Default
                                    default:
                                        iconClass = 'fa-file';
                                        break;
                                }

                                // Format the date
                                const createdDate = new Date(doc.uploaded_at).toLocaleString();

                                // Create row with appropriate icon
                                const rowTemplate = `
                                    <tr data-document-path="${doc.document_path}">
                                        <td>
                                            <div class="doc-preview-icon"><i class="fas ${iconClass}"></i></div>
                                            ${capitalize(doc.document_type)}
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
    }

    function fetchUsersData() {
        fetch('php/admin/admin-manage-users/fetch-admin-user-manage.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    totalUsersValue.innerText = data.totalUsers;
                    activeUsersValue.innerText = data.totalActiveUsers;
                    pendingVerificationValue.innerText = data.totalPendingVerificationUsers;
                    suspendedUsersValue.innerText = data.totalSuspendedUsers;
                    verifiedUsersValue.innerText = data.totalVerifiedUsers;

                    let tableContent = '';
                    data.users.forEach(user => {
                        const userId = user.user_id;
                        const fName = user.first_name;
                        const lName = user.last_name;
                        const email = user.email;
                        const role = user.role;
                        const status = user.status;
                        const isVerified = user.is_verified;
                        const createdAt = user.created_at;

                        tableContent += createUserRow(userId, fName, lName, email, role, status, isVerified, createdAt);
                    });

                    userTableBody.innerHTML = tableContent;
                    attachViewEventListeners();
                }
            });
    }

    // UI/Table management functions
    function createUserRow(userId, fName, lName, email, role, status, isVerified, createdAt) {
        let icon = 'fa-check-circle verified-icon';

        if (!isVerified) {
            icon = 'fa-clock pending-icon';
        }
        return `
            <tr>
                <td>USR-${userId}</td>
                <td>${fName} ${lName}</td>
                <td>${email}</td>
                <td><span class="role-badge role-${role}">${role}</span></td>
                <td><span class="status-badge status-${status}">${status}</span></td>
                <td><i class="fas ${icon}"></i></td>
                <td>${parseDate(createdAt)}</td>
                <td class="actions-cell">
                    <button class="action-icon-btn view-user-btn" data-user-id="${userId}" title="View">
                        <i class="fas fa-eye"></i>View
                    </button>
                </td>
            </tr>
        `;
    }

    function attachViewEventListeners() {
        document.querySelectorAll('.view-user-btn').forEach(button => {
            button.addEventListener("click", function () {
                const userId = this.getAttribute('data-user-id');
                openModal(userId);
            });
        });
    }

    // Modal and user actions functions
    function openModal(userId) {
        fetchUserDetails(userId);
        fetchUserDocuments(userId);
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
                        alert("User details updated successfully!");
                        fetchUsersData();
                        fetchUserDetails(userId);
                    } else {
                        alert("Failed to update user details.");
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

        function handleAction(action) {
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("action", action);

            if (action === "request-more-info") {
                const additionalInfo = prompt("Please specify what additional information you need from the user:");
                if (additionalInfo === null) {
                    return;
                }
                if (additionalInfo.trim() === "") {
                    alert("You must provide details about what information is needed.");
                    return;
                }
                formData.append("message", additionalInfo);
            } else if (action === "reject-verification") {
                const rejectionReason = prompt("Please specify the reason for rejecting the verification:");
                if (rejectionReason === null) {
                    return;
                }
                if (rejectionReason.trim() === "") {
                    alert("You must provide a reason for rejecting the verification.");
                    return;
                }
                formData.append("message", rejectionReason);
            } else if (action === "reset-password") {
                let newPassword = prompt("Enter new password for user ID: " + userId);
                let confirmPassword = prompt("Confirm new password for user ID: " + userId);
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
                    } else {
                        alert(`Failed to ${action} user.`);
                    }
                })
                .catch(error => console.log(`Error ${action} user:`, error));
        }

        activateUserButton.addEventListener("click", function () {
            handleAction("activate");
        });
        resetPasswordButton.addEventListener("click", function () {
            handleAction("reset-password");
        });
        suspendUserButton.addEventListener("click", function () {
            handleAction("suspend");
        });
        verifyUserButton.addEventListener("click", function () {
            handleAction("verify");
        });
        requestMoreInfoButton.addEventListener("click", function () {
            handleAction("request-more-info");
        });
        rejectVerificationButton.addEventListener("click", function () {
            handleAction("reject-verification");
        });
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
                    const fileExt = docPath.split('.').pop().toLowerCase();
                    let fileIcon = 'fa-file';
                    let fileColor = '#6c757d'; // default gray

                    // Determine file type and set appropriate icon and color
                    switch (fileExt) {
                        case 'pdf':
                            fileIcon = 'fa-file-pdf';
                            fileColor = '#dc3545'; // red
                            break;
                        case 'doc':
                        case 'docx':
                            fileIcon = 'fa-file-word';
                            fileColor = '#0d6efd'; // blue
                            break;
                        case 'xls':
                        case 'xlsx':
                        case 'csv':
                            fileIcon = 'fa-file-excel';
                            fileColor = '#198754'; // green
                            break;
                        case 'ppt':
                        case 'pptx':
                            fileIcon = 'fa-file-powerpoint';
                            fileColor = '#fd7e14'; // orange
                            break;
                        case 'txt':
                            fileIcon = 'fa-file-alt';
                            fileColor = '#212529'; // dark
                            break;
                        case 'zip':
                        case 'rar':
                        case '7z':
                        case 'tar':
                        case 'gz':
                            fileIcon = 'fa-file-archive';
                            fileColor = '#6610f2'; // purple
                            break;
                        case 'html':
                        case 'htm':
                        case 'css':
                        case 'js':
                        case 'php':
                        case 'py':
                        case 'java':
                        case 'c':
                        case 'cpp':
                            fileIcon = 'fa-file-code';
                            fileColor = '#0dcaf0'; // info blue
                            break;
                        case 'mp3':
                        case 'wav':
                        case 'ogg':
                        case 'flac':
                        case 'm4a':
                            fileIcon = 'fa-file-audio';
                            fileColor = '#6f42c1'; // purple
                            break;
                        case 'mp4':
                        case 'avi':
                        case 'mov':
                        case 'wmv':
                        case 'flv':
                        case 'mkv':
                        case 'webm':
                            fileIcon = 'fa-file-video';
                            fileColor = '#d63384'; // pink
                            break;
                        default:
                            fileIcon = 'fa-file';
                            fileColor = '#6c757d'; // gray
                    }

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
    fetchUsersData();
    setInterval(fetchUsersData, 60000);
});