document.addEventListener("DOMContentLoaded", function () {
    // Elements for system notification
    const systemNotificationForm = document.getElementById('system-notification-form');
    const systemNotificationTitle = document.getElementById('system-notification-title');
    const systemNotificationMessage = document.getElementById('system-notification-message');
    const systemNotificationType = document.getElementById('system-notification-type');

    // Elements for user notification
    const userNotificationForm = document.getElementById('user-notification-form');
    const userNotificationRecipient = document.getElementById('user-notification-recipient');
    const userNotificationTitle = document.getElementById('user-notification-title');
    const userNotificationMessage = document.getElementById('user-notification-message');
    const userNotificationStatus = document.getElementById('user-notification-status');

    // User search elements
    const userSearchInput = document.getElementById('user-search-input');
    const userSearchResults = document.getElementById('user-search-results');

    // Recent notifications table - Fix: Use the correct ID selector instead of class
    const notificationsTableBody = document.getElementById('notifications-table-body');

    // Initialize
    loadUsers();
    loadRecentNotifications();

    // Add event listeners
    if (systemNotificationForm) {
        systemNotificationForm.addEventListener('submit', handleSystemNotification);
    }

    if (userNotificationForm) {
        userNotificationForm.addEventListener('submit', handleUserNotification);
    }

    if (userSearchInput) {
        userSearchInput.addEventListener('input', debounce(searchUsers, 300));

        // Add focus event to show dropdown when input is focused if there's content
        userSearchInput.addEventListener('focus', function () {
            if (this.value.trim() !== '') {
                searchUsers();
            }
        });

        // Add click event to prevent closing when clicking inside search results
        userSearchResults.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        // Close search results when clicking outside
        document.addEventListener('click', function (e) {
            if (e.target !== userSearchInput && e.target !== userSearchResults) {
                userSearchResults.style.display = 'none';
            }
        });
    }

    /**
     * Send system-wide notification
     */
    function handleSystemNotification(e) {
        e.preventDefault();

        const title = systemNotificationTitle.value.trim();
        const message = systemNotificationMessage.value.trim();
        const type = systemNotificationType.value;

        if (!title || !message) {
            showAlert('Please fill in all fields', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'sendSystemNotification');
        formData.append('title', title);
        formData.append('message', message);
        formData.append('type', type);

        fetch('php/admin/admin-settings/handle-notifications.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('System notification sent successfully', 'success');
                    systemNotificationForm.reset();
                    // Refresh the recent notifications list
                    loadRecentNotifications();
                } else {
                    showAlert(data.message || 'Failed to send notification', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred while sending the notification', 'error');
            });
    }

    /**
     * Send notification to a specific user
     */
    function handleUserNotification(e) {
        e.preventDefault();

        const userId = userNotificationRecipient.value;
        const title = userNotificationTitle.value.trim();
        const message = userNotificationMessage.value.trim();
        const type = userNotificationStatus.value;

        if (!userId || !title || !message) {
            showAlert('Please fill in all fields and select a user', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'sendNotification');
        formData.append('userId', userId);
        formData.append('title', title);
        formData.append('message', message);
        formData.append('type', type);

        fetch('php/admin/admin-settings/handle-notifications.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Notification sent successfully', 'success');
                    userNotificationForm.reset();
                    // Refresh the recent notifications list
                    loadRecentNotifications();
                } else {
                    showAlert(data.message || 'Failed to send notification', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred while sending the notification', 'error');
            });
    }

    /**
     * Search for users when typing in the search field
     */
    function searchUsers() {
        const searchTerm = userSearchInput.value.trim();

        if (!searchTerm) {
            // Clear results if search term is empty
            userSearchResults.innerHTML = '';
            userSearchResults.style.display = 'none';
            return;
        }

        // Show loading state
        userSearchResults.innerHTML = '<div class="loading">Searching...</div>';
        userSearchResults.style.display = 'block';

        const formData = new FormData();
        formData.append('action', 'searchUser');
        formData.append('value', searchTerm);

        // Add debug logging
        console.log('Searching for users with term:', searchTerm);

        fetch('php/admin/admin-settings/handle-notifications.php', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                // Log the raw response for debugging
                response.clone().text().then(text => {
                    console.log('Raw response:', text);
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Search response:', data);
                if (data.success) {
                    displayUserSearchResults(data.data);
                } else {
                    // Show error message in the dropdown
                    userSearchResults.innerHTML = `<div class="no-results error">Error: ${data.message || 'Failed to search users'}</div>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                userSearchResults.innerHTML = '<div class="no-results error">Failed to search users. Please try again.</div>';
            });
    }

    /**
     * Display user search results
     */
    function displayUserSearchResults(users) {
        userSearchResults.innerHTML = '';

        if (!users || users.length === 0) {
            userSearchResults.innerHTML = '<div class="no-results">No users found</div>';
            return;
        }

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-search-result">
                    <i class="fas fa-user"></i>
                    <div class="user-details">
                        <p class="result-title">${user.username}</p>
                        <p class="result-meta">User • <span>${user.email}</span></p>
                    </div>
                </div>
            `;

            userElement.addEventListener('click', function () {
                // Set the selected user in the select box
                selectUser(user.id, user.username, user.email);
                // Hide the search results
                userSearchResults.style.display = 'none';
            });

            userSearchResults.appendChild(userElement);
        });

        userSearchResults.style.display = 'block';
    }

    /**
     * Select a user from the search results
     */
    function selectUser(id, username, email) {
        // Check if option already exists
        let option = Array.from(userNotificationRecipient.options).find(opt => opt.value === id.toString());

        if (!option) {
            // Add new option if it doesn't exist
            option = document.createElement('option');
            option.value = id;
            option.text = `${username} (${email})`;
            userNotificationRecipient.appendChild(option);
        }

        // Select the option
        userNotificationRecipient.value = id;

        // Clear the search input
        if (userSearchInput) {
            userSearchInput.value = '';
        }
    }

    /**
     * Load all users for the dropdown
     */
    function loadUsers() {
        const formData = new FormData();
        formData.append('action', 'getAllUser');

        fetch('php/admin/admin-settings/handle-notifications.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populateUserDropdown(data.data);
                } else {
                    console.error('Error loading users:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    /**
     * Populate the user dropdown with all users
     */
    function populateUserDropdown(users) {
        // Clear existing options except the placeholder
        while (userNotificationRecipient.options.length > 1) {
            userNotificationRecipient.remove(1);
        }

        // Add user options
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.text = `${user.username} (${user.email})`;
            userNotificationRecipient.appendChild(option);
        });
    }

    /**
     * Load recent notifications
     */
    function loadRecentNotifications() {
        if (!notificationsTableBody) {
            console.error('Notifications table body element not found');
            return;
        }

        // Add a loading indicator
        notificationsTableBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading notifications...</td></tr>';

        const formData = new FormData();
        formData.append('action', 'getAllNotification');

        fetch('php/admin/admin-settings/handle-notifications.php', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    displayRecentNotifications(data.data);
                } else {
                    console.error('Error loading notifications:', data.message);
                    notificationsTableBody.innerHTML = `<tr><td colspan="5" class="error-cell">Error: ${data.message || 'Failed to load notifications'}</td></tr>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                notificationsTableBody.innerHTML = '<tr><td colspan="5" class="error-cell">Failed to load notifications. Please try again.</td></tr>';
            });
    }

    /**
     * Display recent notifications in the table
     */
    function displayRecentNotifications(notifications) {
        notificationsTableBody.innerHTML = '';

        if (notifications.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5">No notifications found</td>';
            notificationsTableBody.appendChild(row);
            return;
        }

        notifications.forEach(notification => {
            const row = document.createElement('tr');

            // Format date
            const date = new Date(notification.created_at);
            const formattedDate = date.toLocaleString();

            // Determine recipient
            let recipient = notification.user_id === '0' ? 'All Users' : `User ID: ${notification.user_id}`;

            // Create status badge based on type
            let statusBadgeClass = 'status-info';
            switch (notification.type) {
                case 'success':
                    statusBadgeClass = 'status-success';
                    break;
                case 'warning':
                    statusBadgeClass = 'status-warning';
                    break;
                case 'error':
                    statusBadgeClass = 'status-danger';
                    break;
            }

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${notification.user_id === '0' ? 'System' : 'User'}</td>
                <td>${notification.title}</td>
                <td>${recipient}</td>
                <td><span class="status-badge ${statusBadgeClass}">${notification.type}</span></td>
            `;

            notificationsTableBody.appendChild(row);
        });
    }

    /**
     * Show alert message
     */
    function showAlert(message, type = 'info') {
        // Simple implementation using browser alert
        // In a real application, you might want to use a custom styled alert
        const alertMessage = type === 'error' ? `Error: ${message}` : message;
        alert(alertMessage);

        // Additionally log to console
        if (type === 'error') {
            console.error(message);
        } else {
            console.log(message);
        }
    }

    /**
     * Debounce function to limit how often a function is called
     */
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }
});
