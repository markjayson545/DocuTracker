document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('user-profile-picture-input');
    const userProfilePic = document.getElementById('user-profile-picture');
    const dropdownProfilePic = document.getElementById('dropdown-user-profile-picture');

    // Add event listener to the file input
    fileInput.addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            // Show preview of the selected image immediately
            const reader = new FileReader();
            reader.onload = function (e) {
                // Update both profile pictures with the new image
                userProfilePic.src = e.target.result;
                dropdownProfilePic.src = e.target.result;
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

        // Show loading state on both profile pictures
        userProfilePic.style.opacity = 0.5;
        dropdownProfilePic.style.opacity = 0.5;

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
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while uploading the image.', 'error');
            })
            .finally(() => {
                // Reset opacity for both profile pictures
                userProfilePic.style.opacity = 1;
                dropdownProfilePic.style.opacity = 1;
            });
    }

    // Function to show notification - use existing notification system if available
    function showNotification(message, type) {
        // Check if the handleUserNotification function exists
        if (typeof handleUserNotification === 'function') {
            handleUserNotification(message, type);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
});
