document.addEventListener('DOMContentLoaded', function () {

    const userMenuContainer = document.getElementById('user-info');
    const userMenuDropdown = document.getElementById('user-dropdown');

    function toggle() {
        if (userMenuDropdown.style.display.match('none')) {
            userMenuDropdown.style.display = 'flex';
        } else {
            userMenuDropdown.style.display = 'none';
        }
    }

    userMenuContainer.addEventListener('click', function () {
        toggle();
    });

    async function fetchUserProfilePicture() {
        const formData = new FormData();
        formData.append('action', 'getUserProfile');
        await fetch('php/services/get-user-info.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                if (data.profile_path) {
                    formData.append('file_path', data.profile_path);
                } else {
                    console.error('No user profile path found.');
                    throw new Error('Profile path is missing.');
                }
            }).catch(error => {
                console.error('Error fetching user profile info:', error);
            });;

        const profileAvatar = document.getElementById('user-profile-picture');
        const dropdownAvatar = document.getElementById('dropdown-user-profile-picture');

        if (!formData.get('file_path')) {
            console.error('No user profile path found.');
            if (profileAvatar) {
                profileAvatar.src = 'https://avatar.iran.liara.run/public/boy?username=Ash'; // Default image
            }
            if (dropdownAvatar) {
                dropdownAvatar.src = 'https://avatar.iran.liara.run/public/boy?username=Ash'; // Default image
            }
            return;
        }

        await fetch('php/services/get-document.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                if (profileAvatar) {
                    profileAvatar.src = url;
                }
                if (dropdownAvatar) {
                    dropdownAvatar.src = url;
                }
            });
    }

    fetchUserProfilePicture();

});