document.addEventListener("DOMContentLoaded", function () {
    const notificationButton = document.getElementById("notification-button");
    const notificationDropdown = document.getElementById("notification-dropdown");
    const notificationListContainer = document.getElementById("notification-list");
    const notificationBadge = document.getElementById("notification-badge-count");
    const markAllReadButton = document.getElementById("mark-all-read");

    notificationButton.addEventListener("click", function () {
        if (notificationDropdown.style.display === "block") {
            notificationDropdown.style.display = "none";
        } else {
            notificationDropdown.style.display = "block";
            fetchNotifications();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!notificationButton.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.style.display = "none";
        }
    });

    markAllReadButton.addEventListener("click", function () {
        markAllNotificationsAsRead();
    });

    function getNotificationIcon(type) {
        const iconMap = {
            'success': 'fas fa-check-circle',
            'info': 'fas fa-info-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle',
            'pending': 'fas fa-clock'
        };
        return iconMap[type] || 'fas fa-bell';
    }

    function formatTimeAgo(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    function displayNotifications(notifications) {
        notificationListContainer.innerHTML = ""; // Clear existing notifications
        
        if (notifications.length === 0) {
            notificationListContainer.innerHTML = `
                <div class="notification-item">
                    <div class="notification-content">
                        <p>No notifications available</p>
                    </div>
                </div>
            `;
            updateNotificationBadge(0);
            return;
        }

        notifications.forEach(notification => {
            const notificationItemTemplate = `
                <div class="notification-item ${notification.type}" data-id="${notification.id}">
                    <div class="notification-icon">
                        <i class="${getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-title">
                        <strong>${notification.title}</strong>
                    </div>
                    <div class="notification-content">
                        <p>${notification.message}</p>
                        <span class="notification-time">${formatTimeAgo(notification.created_at)}</span>
                    </div>
                    <div class="notification-actions">
                        <button class="notification-action mark-read-btn" onclick="markAsRead(${notification.id})" title="Mark as read">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            `;
            notificationListContainer.innerHTML += notificationItemTemplate;
        });
        
        updateNotificationBadge(notifications.length);
    }

    function updateNotificationBadge(count) {
        notificationBadge.textContent = count;
        if (count > 0) {
            notificationBadge.style.display = "block";
        } else {
            notificationBadge.style.display = "none";
        }
    }

    async function fetchNotifications() {
        const formData = new FormData();
        formData.append("action", "getAllNotification");
        
        try {
            const response = await fetch("php/services/user-notification.php", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            
            console.log("Notifications:", data);
            if (data.success) {
                displayNotifications(data.data);
            } else {
                console.error("Error fetching notifications:", data.message);
                notificationListContainer.innerHTML = `
                    <div class="notification-item error">
                        <div class="notification-content">
                            <p>Error loading notifications</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Network error:", error);
            notificationListContainer.innerHTML = `
                <div class="notification-item error">
                    <div class="notification-content">
                        <p>Network error. Please try again.</p>
                    </div>
                </div>
            `;
        }
    }

    // Global function for marking individual notification as read
    window.markAsRead = async function(notificationId) {
        const formData = new FormData();
        formData.append("action", "setReadNotification");
        formData.append("notificationId", notificationId);
        
        try {
            const response = await fetch("php/services/user-notification.php", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                // Remove the notification from display
                const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
                if (notificationElement) {
                    notificationElement.remove();
                }
                // Update badge count
                const remainingNotifications = document.querySelectorAll('.notification-item[data-id]').length;
                updateNotificationBadge(remainingNotifications);
                
                // Show empty state if no notifications left
                if (remainingNotifications === 0) {
                    notificationListContainer.innerHTML = `
                        <div class="notification-item">
                            <div class="notification-content">
                                <p>No notifications available</p>
                            </div>
                        </div>
                    `;
                }
            } else {
                console.error("Error marking notification as read:", data.message);
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    async function markAllNotificationsAsRead() {
        const notificationItems = document.querySelectorAll('.notification-item[data-id]');
        
        if (notificationItems.length === 0) {
            return;
        }

        if (!confirm("Are you sure you want to mark all notifications as read?")) {
            return;
        }

        const promises = [];
        
        notificationItems.forEach(item => {
            const notificationId = item.getAttribute('data-id');
            const formData = new FormData();
            formData.append("action", "setReadNotification");
            formData.append("notificationId", notificationId);
            
            promises.push(
                fetch("php/services/user-notification.php", {
                    method: "POST",
                    body: formData
                })
            );
        });
        
        try {
            await Promise.all(promises);
            notificationListContainer.innerHTML = `
                <div class="notification-item">
                    <div class="notification-content">
                        <p>All notifications marked as read</p>
                    </div>
                </div>
            `;
            updateNotificationBadge(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            alert("Some notifications could not be marked as read. Please try again.");
        }
    }

    // Initial load of notifications
    fetchNotifications();
});
