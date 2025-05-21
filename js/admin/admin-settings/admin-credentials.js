document.addEventListener('DOMContentLoaded', function() {
    // Initialize credentials management forms
    initializeAdminCredentialsForms();
    
    // Load current username and email
    fetchAndDisplayAdminInfo();
});

/**
 * Initialize event listeners for the credential forms
 */
function initializeAdminCredentialsForms() {
    // Change Username Form
    const usernameForm = document.getElementById('change-username-form');
    if (usernameForm) {
        usernameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newUsername = document.getElementById('new-username').value;
            
            // Prompt for password before proceeding
            const confirmPassword = prompt("Please enter your current password to confirm username change:");
            
            if (!confirmPassword) {
                showAlert("Password is required to change your username", "error");
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'changeUsername');
            formData.append('new_username', newUsername);
            formData.append('confirm_password_username', confirmPassword);
            
            submitCredentialChange(formData, 'Username updated successfully!');
        });
    }
    
    // Change Email Form
    const emailForm = document.getElementById('change-email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newEmail = document.getElementById('new-email').value;
            const confirmPassword = document.getElementById('confirm-password-email').value;
            
            if (!confirmPassword) {
                showAlert("Password is required to change your email", "error");
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'changeEmail');
            formData.append('new_email', newEmail);
            formData.append('confirm_password_email', confirmPassword);
            
            submitCredentialChange(formData, 'Email updated successfully!');
        });
    }
    
    // Change Password Form
    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;
            
            // Client-side validation
            if (newPassword !== confirmNewPassword) {
                showAlert('Passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showAlert('Password must be at least 8 characters long!', 'error');
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'changePassword');
            formData.append('current_password', currentPassword);
            formData.append('new_password', newPassword);
            formData.append('confirm_new_password', confirmNewPassword);
            
            submitCredentialChange(formData, 'Password updated successfully!');
        });
    }
}

/**
 * Submit credential change to the server
 */
function submitCredentialChange(formData, successMessage) {
    // Show loading state (could be implemented with a loading spinner)
    
    fetch('php/admin/admin-settings/handle-admin-credentials.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(successMessage, 'success');
            
            // If it was a username or email change, update the displayed values
            if (formData.get('action') === 'changeUsername' || formData.get('action') === 'changeEmail') {
                fetchAndDisplayAdminInfo();
            }
            
            // Reset form fields
            resetFormFields(formData.get('action'));
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred while processing your request.', 'error');
    });
}

/**
 * Fetch admin's current username
 */
function fetchAdminUsername() {
    return fetch('php/admin/admin-settings/get-admin-credentials.php?action=getUsername')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.username;
            } else {
                console.error('Error fetching username:', data.message);
                throw new Error(data.message);
            }
        });
}

/**
 * Fetch admin's current email
 */
function fetchAdminEmail() {
    return fetch('php/admin/admin-settings/get-admin-credentials.php?action=getEmail')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.email;
            } else {
                console.error('Error fetching email:', data.message);
                throw new Error(data.message);
            }
        });
}

/**
 * Fetch and display the admin's information
 */
function fetchAndDisplayAdminInfo() {
    fetch('php/admin/admin-settings/get-admin-credentials.php?action=getUserInfo')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayAdminInfo(data.username, data.email);
            } else {
                console.error('Error fetching admin info:', data.message);
                showAlert('Failed to load your information. Please refresh the page.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred while loading your information.', 'error');
        });
}

/**
 * Display admin information in the form fields and header
 */
function displayAdminInfo(username, email) {
    // Update form fields
    const currentUsernameField = document.getElementById('current-username');
    const currentEmailField = document.getElementById('current-email');
    
    if (currentUsernameField) currentUsernameField.value = username;
    if (currentEmailField) currentEmailField.value = email;
    
    // Update user info in header
    const userNameElements = document.querySelectorAll('#user-name');
    const userEmailElements = document.querySelectorAll('#user-email');
    
    userNameElements.forEach(element => {
        element.textContent = username;
    });
    
    userEmailElements.forEach(element => {
        element.textContent = email;
    });
}

/**
 * Reset form fields after successful submission
 */
function resetFormFields(action) {
    if (action === 'changeUsername') {
        document.getElementById('new-username').value = '';
    } else if (action === 'changeEmail') {
        document.getElementById('new-email').value = '';
        document.getElementById('confirm-password-email').value = '';
    } else if (action === 'changePassword') {
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-new-password').value = '';
    }
}

/**
 * Show alert message to the user
 */
function showAlert(message, type) {
    // This is a simple implementation using alert()
    // In a real application, you would use a toast notification system
    if (type === 'success') {
        alert('Success: ' + message);
    } else {
        alert('Error: ' + message);
    }
}
