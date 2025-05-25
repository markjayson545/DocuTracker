document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('avatar-upload');
    const profileAvatar = document.getElementById('profile-avatar');

    // Add event listener to the file input
    fileInput.addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            // Show preview of the selected image
            const reader = new FileReader();
            reader.onload = function (e) {
                profileAvatar.src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);

            // Upload the profile picture
            uploadProfilePicture(this.files[0]);
        }
    });

    // Function to upload the profile picture
    function uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('profile-picture', file);

        // Show loading state
        profileAvatar.style.opacity = 0.5;

        fetch('php/services/upload-user-profile.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response
                console.log(data);
                if (data.status === 'success') {
                    // Show success message
                    showNotification('Profile picture updated successfully!', 'success');
                } else {
                    // Show error message
                    showNotification(data.message || 'Failed to update profile picture.', 'error');
                    // Reset the profile picture to the previous one
                    setTimeout(() => {
                        // fetchUserProfilePicture(); // This would be a function from your fetch-user-details.js
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while uploading the image.', 'error');
            })
            .finally(() => {
                // Reset opacity
                profileAvatar.style.opacity = 1;
            });
    }

    // Function to show notification
    function showNotification(message, type) {
        // You can implement this based on your notification system
        // For now, we'll just use alert
        alert(message);
    }

    async function fetchUserProfilePicture() {
        const formData = new FormData();
        formData.append('action', 'getUserProfile');
        const userProfilePath = await fetch('php/services/get-user-info.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => formData.append('file_path', data.profile_path));
                
        if (!formData.get('file_path')) {
            console.error('No user profile path found.');
            return;
        }

        await fetch('php/services/get-document.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            profileAvatar.src = url;
        })
    }

    // Initial fetch of the user profile picture
    fetchUserProfilePicture();
});
