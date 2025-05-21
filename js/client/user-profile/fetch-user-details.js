document.addEventListener('DOMContentLoaded', function() {
    fetchUserDetails();
});

function fetchUserDetails() {
    // Show loading state
    showLoadingState();
    
    // Prepare data for the request
    const formData = new FormData();
    formData.append('action', 'getUserInfo');
    // No need to explicitly send user_id, server will use the session
    
    // Make the AJAX request
    fetch('php/services/get-user-info.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin' // Important: Send cookies for session handling
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            populateUserProfile(data.user);
        } else {
            displayError(data.message || "Failed to load user information");
        }
    })
    .catch(error => {
        console.error('Error fetching user details:', error);
        displayError("An error occurred while loading your profile");
    })
    .finally(() => {
        hideLoadingState();
    });
}

function showLoadingState() {
    // Add loading indicators to all info values
    document.querySelectorAll('.info-value, .detail-value').forEach(el => {
        el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
}

function hideLoadingState() {
    // Remove loading indicators if needed
}

function displayError(message) {
    // Display error to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.prepend(errorDiv);
    }
    setTimeout(() => {
        errorDiv.remove();
    }
    , 5000); // Remove after 5 seconds
}




function populateUserProfile(userData) {
    // Basic user info in avatar section
    document.getElementById('profile-full-name').textContent = formatFullName(userData);
    document.getElementById('profile-user-id').textContent = `User ID: USR-${userData.user_id.toString().padStart(3, '0')}`;
    document.getElementById('profile-member-since').textContent = `Member since: ${formatDate(userData.created_at)}`;
    
    // Update header user info
    const userNameElements = document.querySelectorAll('#user-name');
    userNameElements.forEach(el => {
        el.textContent = `${userData.first_name} ${userData.last_name}`;
    });
    
    const userEmailElements = document.querySelectorAll('#user-email');
    userEmailElements.forEach(el => {
        el.textContent = userData.email;
    });
    
    // Personal Information section
    document.getElementById('info-full-name').textContent = formatFullName(userData);
    document.getElementById('info-birthdate').textContent = formatDate(userData.date_of_birth);
    document.getElementById('info-sex').textContent = userData.sex || 'Not provided';
    document.getElementById('info-civil-status').textContent = userData.civil_status || 'Not provided';
    document.getElementById('info-nationality').textContent = userData.nationality || 'Not provided';
    document.getElementById('info-birth-place').textContent = userData.birth_place || 'Not provided';
    
    // Construct full address
    const address = [
        userData.house_number,
        userData.street,
        userData.barangay,
        userData.city,
        userData.province
    ].filter(Boolean).join(', ');
    document.getElementById('info-address').textContent = address || 'Not provided';
    
    // Physical characteristics
    document.getElementById('info-height').textContent = userData.height || 'Not provided';
    document.getElementById('info-weight').textContent = userData.weight || 'Not provided';
    document.getElementById('info-complexion').textContent = userData.complexion || 'Not provided';
    document.getElementById('info-blood-type').textContent = userData.blood_type || 'Not provided';
    document.getElementById('info-religion').textContent = userData.religion || 'Not provided';
    document.getElementById('info-education').textContent = userData.education || 'Not provided';
    document.getElementById('info-occupation').textContent = userData.occupation || 'Not provided';
    
    // Contact details
    document.getElementById('contact-email').textContent = userData.email || 'Not provided';
    document.getElementById('contact-phone').textContent = userData.phone || 'Not provided';
    
    // Set verification status in the badge (if verified)
    const verificationBadge = document.getElementById('profile-verification-badge');
    if (userData.is_verified) {
        verificationBadge.classList.add('verified');
        verificationBadge.innerHTML = '<i class="fas fa-check-circle"></i> Verified Account';
    } else {
        verificationBadge.classList.remove('verified');
        verificationBadge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Unverified Account';
    }

    // Update profile picture if available
    // This would be implemented if the API provides profile picture URLs
    // const profileAvatar = document.getElementById('profile-avatar');
    // if (userData.profile_picture) {
    //     profileAvatar.src = userData.profile_picture;
    // }
}

// Helper function to format full name
function formatFullName(userData) {
    return `${userData.first_name} ${userData.middle_name ? userData.middle_name + ' ' : ''}${userData.last_name} ${(userData.qualifier === 'none') ? '' : userData.qualifier}`.trim();
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'Not provided';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as is if invalid
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
